# Review da infra Docker/Caddy (2026-08-28)

Contexto: testes locais no Windows de `docker-compose.yml` + `caddy/Caddyfile` + `Dockerfile`s, antes de subir pra VPS Ubuntu. Análise feita reproduzindo o build localmente (`docker compose build`), sem alterar nenhum arquivo do repo.

## Erro de build (reproduzido)

`api/Dockerfile` e `front/Dockerfile` falham os dois no `npm install`, mesma causa raiz: ambos começam com `FROM node:18-alpine`, mas as dependências atuais do projeto exigem Node mais novo — o próprio `.nvmrc` da raiz já pina `22.23.2`.

**api** — falha explícita:
```
npm error │ Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+.  │
```
`prisma@7.9.1` recusa instalar em Node 18.

**front** — falha diferente na superfície, mesma causa:
```
Error: Cannot find native binding.
    at .../node_modules/@tailwindcss/oxide/index.js:573:11
```
`@tailwindcss/oxide` distribui binários nativos por plataforma (`oxide-linux-x64-gnu`, `-musl`, `-win32-...` etc. — todos já estão corretos no `front/package-lock.json`, não é lockfile desatualizado). O que quebra é a combinação Node 18 + npm 10.8.2 nesse cenário de instalação parcial de workspace: é o bug conhecido do npm sobre `optionalDependencies` ([npm/cli#4828](https://github.com/npm/cli/issues/4828)), que só se manifesta nessas versões antigas.

Confirmado isolando um build de teste (imagem descartada, não afetou o repo): trocando só a imagem base pra `node:22-alpine` no Dockerfile do front, mantendo o resto idêntico, o build passa limpo e o `vite build` gera o `dist/` normalmente.

**Onde olhar:** `api/Dockerfile:1` e `front/Dockerfile:1`. A correção é subir a imagem base pra uma versão de Node compatível com o que `.nvmrc`/`package.json` já exigem (Prisma 7 pede ≥20.19; Nest 11, Vite 6 e react-router 7 também já não suportam 18).

## `docker compose config` — sintaxe

Válido. Único aviso é cosmético: `version: '3.8'` no topo do `docker-compose.yml` está obsoleto no Compose v2 (ele ignora e avisa) — pode remover sem efeito funcional.

## Segurança

**Bom:**
- `.env` nunca foi commitado (histórico do git inteiro sem blob de `.env`), `.gitignore` cobre `.env` em qualquer profundidade.
- `.dockerignore` exclui `node_modules`, `.git` e `.env` do contexto de build — segredos não vazam pra dentro da imagem via `COPY . .`.
- `postgres` e `api` não publicam mais porta pro host (antes o Postgres tinha `5432:5432`; sumiu na versão nova) — numa VPS isso é o certo: só o Caddy fica exposto (80/443), banco e API só são alcançáveis dentro da rede interna do compose.
- Senha do basic auth do Caddy é passada como hash bcrypt via env (`{$ADMIN_PASSWORD_HASH}`), nunca em texto puro no `Caddyfile`.

**Ponto de atenção real — `docker-compose.yml`, serviço `postgres`:**
```yaml
POSTGRES_PASSWORD: ${DB_PASSWORD:-senha_local_padrao}
```
Fallback é uma string fixa dentro de arquivo **versionado** (público no repo). Se `DB_PASSWORD` não for carregada na VPS por qualquer motivo (`.env` no lugar errado, compose chamado de outro diretório, typo no nome da var), o Postgres sobe silenciosamente com senha previsível e conhecida por quem vir o repo. Compare com `ADMIN_PASSWORD_HASH`, que não tem fallback — se não setada, fica vazia e o basicauth falha fechado (nega acesso) em vez de abrir com valor conhecido. Vale aplicar o mesmo padrão pro banco: sem default, ou um default que falhe alto, nunca uma senha real-soante.

**Menor, cosmético:**
- `caddy/Caddyfile` mistura `http://localhost` (conveniência de teste local) com o domínio de produção no mesmo bloco de site. Funciona (o `http://` explícito evita que o Caddy tente emitir certificado TLS pra "localhost"), mas ao subir pra VPS esse host de teste vai junto — não é buraco de segurança grave (basicauth ainda protege), mas é sujeira de config que passa despercebida. Vale considerar separar configs de dev/prod.
- `api/Dockerfile` usa `CMD` em forma shell (`CMD npx prisma migrate deploy && node ...`) em vez de forma exec/JSON array — o Docker já avisa disso no build. Efeito prático: sinais como `SIGTERM` (usados no `docker stop`) não chegam limpos ao processo Node, shutdown pode não ser gracioso. Não é falha de segurança, é robustez operacional.

## Status do commit (checado em 2026-08-28)

Tudo já commitado na branch `infra/manual-deploy-setup`:
- `d77fdff Caddyfile`
- `caf9428 Docker` (`.dockerignore`, `.env.example`, `docker-compose.yml`)

Branch ainda não mergeada/pushada.

## Resolução das pontas de configuração (2026-08-28)

Feito depois do review, focado nas inconsistências de env/config (não nos itens
de build/Node, que seguem em aberto):

- **`api/.env.example`** — trocado o placeholder herdado do scaffold
  (`.../sunshine`) por um template que bate com o compose (`root` / `escalador_db`),
  com comentário explicando quando o arquivo é usado (API no host) e quando é
  ignorado (API em container).
- **`CADDY_SITE_ADDRESS`** — antes estava no `.env.example` mas não era lida em
  lugar nenhum. Agora o `Caddyfile` usa `{$CADDY_SITE_ADDRESS}` no lugar do
  `http://localhost, escalador.icnvanil.com.br` hardcoded, e o
  `docker-compose.yml` passa a var pro serviço `caddy`. Resolve também o item
  "cosmético" do review sobre misturar host de teste e domínio de produção no
  mesmo bloco: agora é um valor por ambiente, vindo da `/.env`.
- **`.dockerignore`** — o padrão `.env` só casava com a raiz; `api/.env` entrava
  na imagem via `COPY . .` (a afirmação na seção "Segurança > Bom" acima estava
  errada nesse ponto). Adicionado `**/.env`. Sem mudança de comportamento em
  runtime — o `environment:` do compose já tinha precedência —, mas o segredo
  não vai mais pra dentro da imagem.
- **`docker-compose.override.yml`** — o review notou (corretamente) que tirar
  `5432:5432` do Postgres é o certo pra VPS. Pra não perder o Cenário B de dev
  (API no host contra banco em container), a porta voltou só via override local:
  `docker-compose.override.yml.example` versionado, `docker-compose.override.yml`
  no `.gitignore` e no `.dockerignore`. Nunca vai pra VPS.
- **Documentação** — `README.md` reescrito com os dois cenários de teste local e
  a tabela de "quem lê qual `.env`".

Continua em aberto (não mexido aqui): imagem base Node 18 nos dois `Dockerfile`,
`version: '3.8'` obsoleto, fallback `senha_local_padrao` do `DB_PASSWORD`,
`CMD` em forma shell no `api/Dockerfile`.
