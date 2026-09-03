# Spec — Captura pública de disponibilidade (versão "pobre")

> Status: proposta. Documento de planejamento, não de implementação.
> Relacionado: `docs/rfs.md` (RF06–12; RF09/RF10; **RF05 e RF13 descartados** — token abandonado; RF36 cor por tipo), `docs/rns.md` (RN02), `docs/escopo.md`.
> Depende operacionalmente de os cultos do horizonte já estarem gerados (RF33/RF34).
> Supersede a ordem dos Sprints 2/3/4 do `CLAUDE.md` (ver memória "Roadmap reprioritized 2026-08-31").

## 1. Objetivo

Permitir que um voluntário, **sem login**, abra uma página pública, selecione o
próprio nome, navegue por um **calendário** dos meses à frente, marque em quais
cultos está **indisponível** (quantos cultos e dias quiser) e envie. O líder passa
a coletar disponibilidade por formulário em vez de perguntar pessoa a pessoa.

O painel admin ganha **uma tela de configuração do formulário** (§3.4, §6.2).
Nesta fase ela guarda um único parâmetro: o **dia de corte** que trava o mês
seguinte (RF12, §2.1).

É a versão **pobre** de propósito: sem entidade `Ciclo`, sem prazo global de
resposta, sem noção de "pendente para o mês X" (só "nunca respondeu", §2.2). O
objetivo é rodar **um ciclo real** e descobrir requisitos que não dá para prever
no papel (granularidade da disponibilidade, campos extras, observação livre) antes
de endurecer.

O token individual por pessoa (RF05) e a invalidação de token (RF13) foram
**descartados** (marcados `DESCARTADO` em `docs/rfs.md`): o modelo em que a pessoa
se identifica escolhendo o próprio nome numa lista deixa de ser um estágio
temporário e passa a ser o desenho permanente da captura.

### Não-objetivos (fora desta spec)

- Token/link individual por pessoa: **descartado de vez** (RF05 e RF13). Sem
  autenticação real de voluntário — a identificação é a escolha do nome numa
  lista, permanentemente.
- Entidade `Ciclo` e histórico entre ciclos (RF27/28).
- Prazo global de resposta ("o formulário fecha dia X"). O único fechamento é a
  trava por mês da regra de corte (§2.1).
- Pendência por mês (RF11 granular) — nesta fase "pendente" = "nunca enviou o
  formulário". Ver tradeoff em §2.2.
- Geração dos cultos do ano (RF33/RF34) — pré-condição, assumida pronta (§8).
- Qualquer coisa de alocação/montador/geração de escala.

## 2. Glossário e decisões de modelagem

### 2.1 Horizonte do formulário e regra de corte (RF12)

Não há `Ciclo` nem "período aberto" único. O formulário oferece **todos os cultos
do mês vigente até 31/dez do ano corrente** — o voluntário navega mês a mês num
seletor. (Assunção; ver questão em aberto §11.3 sobre a virada de ano.)

Cada culto está num de dois estados para **marcação**:

- **Editável** — a pessoa pode marcar/desmarcar indisponibilidade nele.
- **Travado** — aparece no calendário só para contexto ("outubro já fechou"),
  mas não aceita mudança.

**Regra de corte:**

> Um culto é **editável** ⟺ `hoje < (diaCorte) do mês imediatamente anterior ao mês do culto`.

```ts
function cultoEditavel(dataCulto: Date, diaCorte: number, hoje = new Date()): boolean {
  // trava a partir do diaCorte do mês ANTERIOR ao mês do culto
  const inicioTrava = new Date(dataCulto.getFullYear(), dataCulto.getMonth() - 1, diaCorte);
  return hoje < inicioTrava;
}
```

- `diaCorte` vem da `ConfiguracaoFormulario` (§2.4), default **20**.
- Consequência prática com `diaCorte = 20`, hoje = 20/set: os cultos de **outubro**
  (mês seguinte) travam; **novembro em diante seguem editáveis** (novembro trava
  em 20/out). A cada dia 20, o próximo mês entra na trava e o resto do ano
  continua livre — que é exatamente "bloqueia somente o próximo mês".
- Cultos do **mês vigente** e de meses passados já estão travados (a trava deles
  caiu no dia de corte do mês anterior).
- Comparar por início do dia; o resto do sistema já lida com `data` de culto.

**Upgrade path:** quando `Ciclo` existir, a trava passa a ser derivada do estado
do ciclo (aberto/fechado), não da regra de calendário. Não implementar agora.

### 2.2 "Enviou sem indisponibilidade" ≠ "não enviou" — e o tradeoff do "pendente"

`Indisponibilidade` (par pessoa↔culto) não distingue "respondeu, está livre" de
"nunca respondeu": zero linhas serve para os dois. O RF09 (data/hora do envio) e
o RF11 (quem respondeu / quem está pendente) exigem um registro **por resposta**.

**Decisão (opção B dos tradeoffs avaliados):** um **carimbo único por pessoa**.

```prisma
model RespostaDisponibilidade {
  id        Int      @id @default(autoincrement())
  pessoa    Pessoa   @relation(fields: [pessoaId], references: [id])
  pessoaId  Int      @unique
  enviadoEm DateTime @updatedAt        // RF09/RF10 — última vez que enviou o formulário
  criadoEm  DateTime @default(now())

  @@map("resposta_disponibilidade")
}
```

- Uma linha por pessoa. `pessoaId @unique`.
- **RF11 nesta fase:** "pendente" = pessoa ativa **sem** linha em
  `RespostaDisponibilidade`. Não existe "pendente para novembro".
- **Limitação aceita:** o carimbo diz "mexeu no formulário alguma vez", não
  "confirmou o mês X". Com o formulário sendo um calendário de vários meses num
  envio só, um carimbo por mês (opção C) só funcionaria com um gesto explícito
  "confirmo novembro / nada a declarar em novembro" por mês — cerimônia que o
  calendário justamente elimina. Depois de rodar **um ciclo real**, reavaliar se
  a granularidade por mês vale o custo, já sabendo qual gesto pedir.
- `Indisponibilidade` **não muda de forma** — continua a verdade sobre "quem não
  pode em qual culto" (consumida pela RN02 e pelas telas de disponibilidade que
  já existem).

### 2.3 Submeter é *replace com escopo*, não upsert linha a linha

Uma resposta é o *conjunto* de cultos marcados. Desmarcar um culto tem que ser
representável. O escopo do replace são os **cultos editáveis** (nunca os
travados). Numa transação:

1. Resolver o conjunto de **cultos editáveis** = cultos no horizonte (§2.1) com
   `cultoEditavel(...) === true`.
2. `deleteMany` em `Indisponibilidade` onde `pessoaId = X` **e** `cultoId ∈ editáveis`.
3. `createMany` em `Indisponibilidade` para cada `cultoId` marcado no payload —
   todos devem `∈ editáveis` (senão `422`, rejeita o payload inteiro; ver §4).
4. `upsert` em `RespostaDisponibilidade` por `pessoaId` — dispara `enviadoEm`.

Propriedades:

- Idempotente.
- Representa desmarcação (culto editável que sumiu do payload → apagado no passo 2).
- Representa "sem indisponibilidade" (passo 3 insere zero linhas, passo 4 grava o carimbo).
- **Nunca toca mês travado.** Um envio atrasado — a pessoa reabre o formulário em
  novembro, quando outubro já travou — não apaga o que ela marcou para outubro,
  porque o passo 2 é escopado aos editáveis. O front, por sua vez, manda no
  payload só o que é editável (§6.1).

## 3. Arquitetura

### 3.1 Módulo público (Nest) isolado

Concerns públicos ficam **separados** dos controllers de admin. Novo módulo:

```
src/disponibilidade-publica/
  disponibilidade-publica.module.ts
  disponibilidade-publica.controller.ts   // rotas /disp-publica/*
  disponibilidade-publica.service.ts      // orquestra a transação do §2.3
  corte.ts                                // cultoEditavel() (§2.1) — helper puro, testável
  dto/
    enviar-resposta.dto.ts
  guards/
    senha-formulario.guard.ts             // só se opção B (§5)
```

- **Reúso, sem duplicar regra de negócio:** importar `PessoaModule`,
  `CultoModule` e `ConfiguracaoFormularioModule` (§3.4); ler pessoas por
  `PessoaService.findAll()` (já filtra `ativo`), cultos por
  `CultoService.listarPorIntervalo(inicio, fim)` (§3.3), `diaCorte` pelo service
  de configuração.
- A escrita (transação) mora no `DisponibilidadePublicaService`. Ele injeta
  `PrismaService` para o `$transaction` e chama os services de leitura para
  montar o escopo. Não chamar `IndisponibilidadeService.setIndisponibilidade`
  em loop — é N queries e não é transacional.

### 3.2 Contrato da API — público

Prefixo: `/disp-publica` (fácil de casar no Caddyfile, §5).

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/disp-publica/formulario` | Horizonte + cultos: `{ ano, cultos: [{ id, nome, data, tipo, editavel: boolean }] }`, ordenado por data | pública |
| `GET` | `/disp-publica/pessoas` | Pessoas ativas: `[{ id, nome }]` | pública (ver risco §7) |
| `GET` | `/disp-publica/pessoas/:id/resposta` | `{ enviadoEm, cultosIndisponiveis: number[] }` (todos os marcados, editáveis ou não) ou `204` se nunca enviou | pública |
| `POST` | `/disp-publica/respostas` | Envia/reenvia (replace com escopo, §2.3) | senha (§5) |

- `GET /formulario` marca `editavel` por culto — o servidor é dono do relógio e do
  `diaCorte`; o front só renderiza.
- `GET /pessoas/:id/resposta` devolve **todos** os cultos marcados da pessoa
  dentro do horizonte, inclusive de meses travados (para o calendário mostrar).
  O front cruza com `formulario.cultos[].editavel` para saber o que é enviável.
- `POST /respostas` não aceita `ano/mes` nem escopo do cliente — o escopo é sempre
  "cultos editáveis agora".

### 3.3 Ajuste em `CultoService`

Não existe listagem de cultos por intervalo (o `findAll` traz tudo). Adicionar
algo genérico e reusável:

```ts
listarPorIntervalo(inicio: Date, fim: Date) {   // [inicio, fim)
  return this.prisma.culto.findMany({
    where: { data: { gte: inicio, lt: fim } },
    orderBy: { data: 'asc' },
  });
}
```

O cálculo do horizonte (`inicio = 1º dia do mês vigente`, `fim = 1º dia do próximo
ano`) mora no `DisponibilidadePublicaService`, não aqui.

Pré-condição operacional: os cultos do horizonte precisam **já estar salvos**
(`salvarCultosDoMes` rodado para cada mês) antes do formulário abrir. Não gerar
on-the-fly no endpoint público. Checklist do líder (§8).

### 3.4 Módulo de configuração (Nest) — admin

```
src/configuracao-formulario/
  configuracao-formulario.module.ts
  configuracao-formulario.controller.ts   // GET / PUT  (rota fora de /disp-publica → já protegida pela basicauth de admin, §5)
  configuracao-formulario.service.ts      // singleton: sempre id = 1
  dto/atualizar-configuracao.dto.ts
```

```prisma
model ConfiguracaoFormulario {
  id           Int      @id @default(1)   // singleton — sempre 1
  diaCorte     Int      @default(20)      // 1–28 (§4)
  criadoEm     DateTime @default(now())
  atualizadoEm DateTime @updatedAt

  @@map("configuracao_formulario")
}
```

- **Singleton:** o service sempre lê/grava `id = 1` (`upsert` com `where: { id: 1 }`).
  Seed inicial (`diaCorte = 20`) na própria migration ou no bootstrap.
- Endpoints: `GET /config-formulario` → `{ diaCorte }`; `PUT /config-formulario`
  com `{ diaCorte }`. Sem prefixo `/disp-publica`, então caem na `basicauth` de
  admin automaticamente (§5.2).

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/config-formulario` | `{ diaCorte }` | basicauth admin |
| `PUT` | `/config-formulario` | atualiza `{ diaCorte }` | basicauth admin |

## 4. DTOs e validação

`ValidationPipe({ whitelist: true })` já é global (`main.ts`).

```ts
// enviar-resposta.dto.ts
export class EnviarRespostaDto {
  @IsInt() @Min(1)
  pessoaId: number;

  @IsArray() @ArrayUnique()
  @IsInt({ each: true }) @Min(1, { each: true })
  cultosIndisponiveis: number[];   // [] → "não tenho indisponibilidade"
}

// atualizar-configuracao.dto.ts
export class AtualizarConfiguracaoDto {
  @IsInt() @Min(1) @Max(28)         // 28 evita ambiguidade em meses curtos
  diaCorte: number;
}
```

Regras que o **service** valida (não expressáveis no DTO):

- `pessoaId` existe **e** `ativo === true` → senão `404`/`422`.
- Todo `cultoId ∈ cultosIndisponiveis` está no conjunto de **cultos editáveis**
  agora → senão `422` (rejeita o payload inteiro, não descarta id inválido em
  silêncio). Isso cobre tanto id inexistente quanto culto de mês travado.
- `cultosIndisponiveis` sem duplicatas (DTO, `@ArrayUnique`).

Erros com mensagem em português, formato consistente com o resto da API.

## 5. Proteção da rota

### 5.1 Estado atual

`caddy/Caddyfile` tem `basicauth` **fora dos `handle`** → protege o subdomínio
inteiro (front + API) com um único par `admin` + `ADMIN_PASSWORD_HASH`.
**Hoje nada no Escalador é público.** Adicionar um `handle` novo não basta: a
diretiva `basicauth` no nível do site roda para toda requisição.

### 5.2 Furo no Caddy (obrigatório nos dois caminhos)

Escopar o `basicauth` de admin para "tudo **exceto** os paths públicos". As rotas
de configuração (`/config-formulario`, `/api/config-formulario`) **não** entram na
lista pública — continuam atrás da senha de admin.

```caddyfile
{$CADDY_SITE_ADDRESS} {
    @publico path /api/disp-publica/* /disp-publica/*
    @privado not path /api/disp-publica/* /disp-publica/*

    basicauth @privado {
        admin {$ADMIN_PASSWORD_HASH}
    }

    handle /api/* {
        uri strip_prefix /api
        reverse_proxy api:3000
    }
    handle {
        reverse_proxy front:80
    }
}
```

**Gotcha do front (SPA):** a página pública é uma rota React servida do mesmo
`index.html` + bundle em `/assets/*`. Se a página é pública, os assets
compartilhados ficam alcançáveis → o bundle do admin passa a ser baixável. Não é
segredo (é JS que já vai para o browser; a API continua protegida), mas **entra
no aceite escrito do §7**. Alternativas (não decidir agora): front público
inteiro e confiar na API como portão; ou build separado só do formulário.

### 5.3 Como proteger o path já furado — escolher A ou B

**Opção A — segundo `basicauth` no Caddy, credencial compartilhável, escopada ao path público.**

```caddyfile
basicauth @publico {
    voluntario {$FORM_PASSWORD_HASH}
}
```

- Prós: zero código na API; protege **também** o `GET /pessoas` (lista de nomes) de graça.
- Contras: popup do browser (UX ruim no celular); sem mensagem custom; rate limit e log só no nível do Caddy.

**Opção B — path aberto no Caddy + senha única como campo do formulário, validada no Nest no `POST`.**

- `SenhaFormularioGuard` lê `FORM_PASSWORD` via config e compara com um header/campo do body.
- Prós: mensagem de erro em português; `@nestjs/throttler` e log de tentativas no mesmo lugar da análise de risco; controla exatamente o que a senha libera (só o `POST`).
- Contras: `GET /pessoas` e `GET /formulario` ficam públicos, a menos que você também os proteja em código.

**Recomendação:** **B**, *se* a lista pública de nomes for aceitável — conversa com
o líder, **puxe-a para antes** de fechar a escolha. Se o líder não quiser a lista
de nomes exposta, **A** é mais rápido e casa com o "já usamos caddy auth".

Nos dois casos: `ADMIN_PASSWORD_HASH` continua sendo só o portão do admin; o
segredo do formulário é **separado** (`FORM_PASSWORD_HASH` para o Caddy, ou
`FORM_PASSWORD` para o Nest) e documentado no `.env.example`.

## 6. Front

### 6.1 Página pública (`/disp-publica`)

Rota React fora da IA de admin (Escala/Pessoas/Cadastros).

Fluxo:

1. `GET /disp-publica/formulario` + `GET /disp-publica/pessoas`.
2. Pessoa escolhe o nome (combobox com busca — dezenas de nomes).
3. Ao escolher → `GET /disp-publica/pessoas/:id/resposta` → carrega o conjunto já
   marcado no estado local.
4. **Seletor de mês** (‹ setembro 2026 ›) navegando pelos meses do horizonte.
5. **Calendário em grade** do mês selecionado: dias com culto destacados; tipo de
   culto diferenciado por cor (RF36); dias de meses/cultos **travados** aparecem
   esmaecidos e não clicáveis.
6. Clique num dia com culto → **lista curta** dos cultos daquele dia → toggle
   "não posso" por culto.
7. Resumo persistente do que está marcado (somando todos os meses).
8. Atalho "não tenho nenhuma indisponibilidade" → envia `cultosIndisponiveis: []`.
9. Enviar → `POST /disp-publica/respostas` (com a senha, §5), mandando **só os
   cultos marcados que são editáveis** (`marcados ∩ editáveis`). Tela de
   confirmação com `enviadoEm` + resumo do que foi enviado; botão "corrigir"
   volta ao calendário.

Estado central = o conjunto de `cultoId` marcados, chaveado por id. `useState`
resolve; sem estado global.

### 6.2 Tela admin de configuração do formulário

Dentro da IA de admin — sugestão: entrada "Configurações" ou dentro de Cadastros
(questão em aberto §11.4).

- Formulário simples: campo **"dia de corte"** (inteiro 1–28).
- Texto explicando a regra: *"A partir deste dia do mês, os cultos do mês seguinte
  deixam de aceitar mudanças no formulário público."*
- Exemplo calculado ao vivo: *"Hoje é 03/09. Com dia de corte 20, os cultos de
  outubro travam em 20/09."*
- `GET /config-formulario` no load, `PUT` ao salvar.

## 7. Análise de risco e aceite (Slice 3)

Threat model baixo: voluntários de igreja, dado é "fulano não pode no dia X"
(sem nada sensível). Registrar por escrito, com o líder ciente:

| Risco | Mitigação | Aceite |
|---|---|---|
| Lista de nomes de membros ativos exposta publicamente (`GET /pessoas`) | Opção A fecha; opção B deixa aberto | **decisão do líder** — pré-requisito da escolha A/B |
| Calendário de cultos do ano exposto publicamente (`GET /formulario`) | cultos são públicos por natureza (data + rótulo) | aceitar |
| Bundle do front admin baixável (§5.2) | API continua protegida | aceitar (JS público por natureza) ou build separado |
| Impersonação intra-congregação (qualquer um escolhe qualquer nome) | reenvio corrige; log de `enviadoEm` + IP dá rastro | **aceite permanente** — RF05 (token) foi descartado; se virar problema real no ciclo, reabrir a decisão de projeto |
| Senha compartilhada vaza (grupo de WhatsApp) | rate limit; senha só libera `POST`; **rotacionar a senha a cada ciclo** | aceitar |
| Flood de submissões / DoS | `@nestjs/throttler` no módulo público + limites do Caddy | aceitar |
| Admin põe `diaCorte` fora de faixa ou "esvazia" o formulário todo cedo demais | DTO valida 1–28; sem risco de segurança, só operacional | aceitar |
| LGPD "leve" | nome + indisponibilidade por data; sem contato, sem dado sensível | documentar finalidade |

## 8. Pré-requisitos técnicos

- [ ] `@nestjs/config` — hoje `main.ts` usa `dotenv/config` + `process.env` direto. Introduzir `ConfigModule` para ler `FORM_PASSWORD` tipado/validado (opção B).
- [ ] `@nestjs/throttler` — não instalado.
- [ ] Migration Prisma: `RespostaDisponibilidade` (com `pessoaId @unique`) + `ConfiguracaoFormulario` (singleton) + relações em `Pessoa`.
- [ ] Seed inicial da `ConfiguracaoFormulario` (`diaCorte = 20`).
- [ ] `.env.example` (raiz e/ou `api/`) com o novo segredo do formulário, documentado.
- [ ] `CultoService.listarPorIntervalo` (§3.3).
- [ ] **Cultos do horizonte gerados** (RF33/RF34): o líder precisa ter rodado `salvarCultosDoMes` para cada mês entre o mês vigente e dezembro. Se ainda não existe "gerar o ano inteiro" (RF34), isso é fricção operacional — avaliar (§11.5).

## 9. Plano de execução

### Slice 1 — captura pública + config (~3–4 dias) — o miolo

- [ ] Migration: `RespostaDisponibilidade` + `ConfiguracaoFormulario` + seed `diaCorte = 20`.
- [ ] `CultoService.listarPorIntervalo`.
- [ ] Módulo `configuracao-formulario`: `GET` / `PUT` (atrás da basicauth de admin).
- [ ] `corte.ts` — `cultoEditavel()` (§2.1), com testes unitários próprios.
- [ ] Furo no Caddyfile (§5.2) + escolha A/B (§5.3) implementada.
- [ ] Módulo `disponibilidade-publica`: `GET /formulario`, `GET /pessoas`, `POST /respostas`.
- [ ] DTOs + validação de domínio (§4).
- [ ] Transação replace-com-escopo (§2.3), escopo = cultos editáveis.
- [ ] `@nestjs/throttler` no `POST`.
- [ ] Front público: combobox de nome → calendário com seletor de mês → marcar → enviar → confirmação.
- [ ] Front admin: tela do dia de corte (§6.2).
- [ ] Testes: unit do service + unit da regra de corte + e2e do `POST` e do `GET /config-formulario`.

### Slice 2 — reenvio + estados (~1 dia)

- [ ] `GET /pessoas/:id/resposta` + pré-carga do conjunto marcado no front.
- [ ] Atalho "não tenho indisponibilidade" (`cultosIndisponiveis: []`).
- [ ] Tela de confirmação com `enviadoEm` e resumo; botão "corrigir".
- [ ] Teste: reenvio atualiza `enviadoEm`; reenvio atrasado **não** toca mês travado.

### Slice 3 — endurecer + aceite (~1 dia)

- [ ] Rate limit calibrado (limites reais).
- [ ] Fuzz de input: ids grandes/negativos, arrays enormes, `cultoId` de mês travado, `diaCorte` fora de 1–28.
- [ ] Tabela de risco do §7 preenchida e **aceita por escrito pelo líder**, em especial a exposição da lista de nomes.
- [ ] Log de tentativas de senha inválida (opção B).

### Depois (fora desta spec)

- Rodar um ciclo real, coletar o que faltou prever, iterar o formato.
- Reavaliar RF11 granular (pendência por mês) com base no que o ciclo mostrar.
- Quando `Ciclo` existir: trava derivada do estado do ciclo, não da regra de calendário (§2.1).

## 10. Testes

**Unitário — `cultoEditavel()` (§2.1):**

- hoje = 19/09, `diaCorte` 20, culto em outubro → editável.
- hoje = 20/09, `diaCorte` 20, culto em outubro → **não** editável; culto em novembro → editável.
- hoje = 03/09, culto no próprio setembro → não editável (travou em 20/08).
- `diaCorte` 25, hoje = 22/09, culto em outubro → ainda editável.
- culto em janeiro, hoje = dezembro do ano anterior → trava atravessa a virada de ano corretamente.

**Unitário — `DisponibilidadePublicaService` (replace com escopo, §2.3):**

- marca 3 cultos editáveis → 3 linhas de `Indisponibilidade` + 1 `RespostaDisponibilidade`.
- reenvia com 1 culto (2 fora do payload) → sobra 1 linha; `enviadoEm` avança.
- reenvia com `[]` → 0 linhas de `Indisponibilidade`, `RespostaDisponibilidade` continua.
- `cultoId` de mês travado no payload → `422`, nada gravado (transação aborta).
- reenvio **não** apaga `Indisponibilidade` que a pessoa já tinha num mês agora travado.
- `pessoaId` inativo → rejeita.

**e2e:**

- `POST /disp-publica/respostas` sem senha → `401` (opção B) / bloqueado no Caddy (opção A).
- com senha → `201` e corpo esperado.
- `GET /disp-publica/pessoas` não retorna inativos.
- `GET /config-formulario` sem basicauth → `401`.
- `PUT /config-formulario` com `diaCorte = 40` → `422`.

## 11. Questões em aberto

1. **A ou B** para proteger o path público — depende do aceite do líder sobre a lista de nomes pública (§5.3, §7).
2. Front do formulário: rota dentro do bundle atual (assets públicos) ou build separado (§5.2)?
3. Horizonte exato: "mês vigente → 31/dez do ano corrente" é a assunção. Como tratar a virada de ano — em dezembro o formulário mostra só dezembro, ou já janeiro do ano seguinte se os cultos existirem? (§2.1)
4. Onde a tela de configuração entra na IA de admin: nova entrada "Configurações" ou dentro de Cadastros? (§6.2)
5. RF33/RF34: existe (ou vai existir a tempo) geração de cultos do ano inteiro? Se o líder gera mês a mês, o horizonte do formulário fica limitado ao que já foi gerado. (§8)
6. `diaCorte`: faixa 1–28 assumida. Faz sentido permitir "sem corte" (formulário sempre aberto o ano todo) como um valor especial? Por ora, não.
