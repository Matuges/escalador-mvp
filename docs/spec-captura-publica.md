# Spec — Captura pública de disponibilidade (versão "pobre")

> Status: proposta. Documento de planejamento, não de implementação.
> Relacionado: `docs/rfs.md` (RF05–13, RF09), `docs/rns.md` (RN02), `docs/escopo.md`.
> Supersede a ordem dos Sprints 2/3/4 do `CLAUDE.md` (ver memória "Roadmap reprioritized 2026-08-31").

## 1. Objetivo

Permitir que um voluntário, **sem login**, abra uma página pública, selecione o
próprio nome, marque em quais cultos do mês está **indisponível** e envie. O líder
passa a coletar disponibilidade por formulário em vez de perguntar pessoa a pessoa.

É a versão **pobre** de propósito: sem token individual (RF05), sem prazo
configurável (RF12), sem invalidação de token (RF13). O objetivo é rodar **um
ciclo real** e descobrir requisitos que não dá para prever no papel (granularidade
da disponibilidade, campos extras, observação livre) antes de endurecer.

### Não-objetivos (fora desta spec)

- Token/link individual por pessoa (RF05) — fast-follow, depois da iteração.
- Prazo de resposta e invalidação (RF12, RF13).
- Entidade `Ciclo` e histórico entre ciclos (RF27/28).
- Qualquer coisa de alocação/montador/geração.
- Autenticação real de voluntário (a pessoa continua "se identificando" ao escolher o nome numa lista).

## 2. Glossário e decisões de modelagem

### 2.1 Âncora de período (não há `Ciclo`)

O formulário é sempre de **um mês/ano**. Sem entidade `Ciclo`, o período é
apenas um par `(ano, mes)`.

**Decisão:** o **servidor** decide qual período está aberto — por padrão, o
**próximo mês** (`ano`/`mes` derivados de `new Date()`), sem o cliente poder
escolher. Um único período aberto por vez. Simples, poucos modos de falha, casa
com "pobre".

- Upgrade path (quando precisar de 2 meses abertos ou reabrir um passado):
  aceitar `?ano=&mes=` no link e validar contra uma janela permitida
  (mês atual ou próximo). **Não implementar agora.**

### 2.2 "Enviou sem indisponibilidade" ≠ "não enviou"

Hoje `Indisponibilidade` (par pessoa↔culto) não distingue os dois casos: zero
linhas pode ser "respondeu, livre o mês todo" ou "nunca respondeu". O RF09
(data/hora **do envio**) e o RF11 (quem respondeu / quem está pendente) exigem
um registro **por resposta**, não por linha.

**Decisão:** nova entidade `RespostaDisponibilidade`:

```prisma
model RespostaDisponibilidade {
  id        Int      @id @default(autoincrement())
  pessoa    Pessoa   @relation(fields: [pessoaId], references: [id])
  pessoaId  Int
  ano       Int
  mes       Int      // 1–12
  enviadoEm DateTime @updatedAt   // RF09; atualiza a cada reenvio (RF10)
  criadoEm  DateTime @default(now())

  @@unique([pessoaId, ano, mes])   // uma resposta por pessoa por período
  @@map("resposta_disponibilidade")
}
```

- `Indisponibilidade` **não muda de forma**. Continua sendo a verdade sobre
  "quem não pode em qual culto" (consumida pela RN02 e pelas telas de
  disponibilidade que já existem).
- A `RespostaDisponibilidade` é só o "carimbo" do envio + âncora para pendências.

### 2.3 Submeter é *replace com escopo*, não upsert linha a linha

O "upsert" mencionado no plano não representa **desmarcar** um culto. Uma
resposta é o *conjunto* de cultos marcados naquele período. A operação correta,
numa transação:

1. Resolver o conjunto de cultos do período `(ano, mes)`.
2. `deleteMany` em `Indisponibilidade` onde `pessoaId = X` **e** `cultoId ∈ cultos do período`.
3. `createMany` em `Indisponibilidade` para cada `cultoId` marcado (todos ∈ cultos do período).
4. `upsert` em `RespostaDisponibilidade` por `(pessoaId, ano, mes)` — dispara `enviadoEm`.

Propriedades: idempotente, representa desmarcação, representa "sem
indisponibilidade" (passo 3 insere zero linhas, mas o passo 4 grava a resposta).
O escopo do `deleteMany` (só cultos daquele mês) evita apagar indisponibilidade
que a pessoa tenha em outros meses.

## 3. Arquitetura

### 3.1 Módulo Nest isolado

Concerns públicos ficam **separados** dos controllers de admin. Novo módulo:

```
src/disponibilidade-publica/
  disponibilidade-publica.module.ts
  disponibilidade-publica.controller.ts   // rotas /disp-publica/*
  disponibilidade-publica.service.ts      // orquestra a transação do §2.3
  dto/
    enviar-resposta.dto.ts
  guards/
    senha-formulario.guard.ts              // só se opção B (§5)
```

- **Reúso, sem duplicar regra de negócio:** importar `PessoaModule` e
  `CultoModule`; ler pessoas por `PessoaService.findAll()` (já filtra `ativo`),
  cultos por um novo `CultoService.listarPorPeriodo(ano, mes)` (ver §3.3).
- A escrita (transação) mora no `DisponibilidadePublicaService`. Ele injeta
  `PrismaService` para o `$transaction` e chama os services de leitura para
  montar o escopo. Não chamar `IndisponibilidadeService.setIndisponibilidade`
  em loop — é N queries e não é transacional.

### 3.2 Contrato da API

Prefixo sugerido: `/disp-publica` (fácil de casar no Caddyfile, ver §5).

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/disp-publica/periodo` | Período aberto: `{ ano, mes, cultos: [{ id, nome, data }] }` | pública |
| `GET` | `/disp-publica/pessoas` | Pessoas ativas: `[{ id, nome }]` | pública (ver risco §7) |
| `GET` | `/disp-publica/pessoas/:id/resposta` | Resposta atual da pessoa no período aberto: `{ enviadoEm, cultosIndisponiveis: number[] }` ou `204` | pública |
| `POST` | `/disp-publica/respostas` | Envia/reenvia (replace com escopo) | senha (§5) |

`GET /pessoas/:id/resposta` serve o Slice 2 (reabrir e ver o que já foi marcado).
Retorna sempre o período **aberto**; não aceita `ano/mes` do cliente.

### 3.3 Ajuste em `CultoService`

Não existe listagem de cultos por mês (o `findAll` traz tudo, o
`gerarCultosDoMes` gera mas não lê). Adicionar:

```ts
listarPorPeriodo(ano: number, mes: number) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1);
  return this.prisma.culto.findMany({
    where: { data: { gte: inicio, lt: fim } },
    orderBy: { data: 'asc' },
  });
}
```

Pré-condição operacional: os cultos do mês precisam **já ter sido salvos**
(`salvarCultosDoMes`) antes do formulário abrir. Documentar no checklist do líder
(§8). Não gerar on-the-fly no endpoint público.

## 4. DTO e validação (Slice 1 — não é "endurecimento")

`ValidationPipe({ whitelist: true })` já é global (`main.ts`). Falta o DTO e as
regras de domínio.

```ts
// enviar-resposta.dto.ts
export class EnviarRespostaDto {
  @IsInt() @Min(1)
  pessoaId: number;

  @IsArray() @ArrayUnique()
  @IsInt({ each: true }) @Min(1, { each: true })
  cultosIndisponiveis: number[];   // pode ser [] → "não tenho indisponibilidade"
}
```

Regras que o **service** valida (não dá para expressar no DTO):

- `pessoaId` existe **e** `ativo === true` → senão `404`/`422`.
- Todo `cultoId ∈ cultosIndisponiveis` pertence ao conjunto de cultos do
  período aberto → senão `422` (rejeita a resposta inteira, não silenciosamente
  descarta o id inválido).
- `cultosIndisponiveis` sem duplicatas (já no DTO via `@ArrayUnique`).

Erros com mensagem em português, formato consistente com o resto da API.

## 5. Proteção da rota

### 5.1 Estado atual

`caddy/Caddyfile` tem `basicauth` **fora dos `handle`** → protege o subdomínio
inteiro (front + API) com um único par `admin` + `ADMIN_PASSWORD_HASH`.
**Hoje nada no Escalador é público.** Adicionar um `handle` novo não basta: a
diretiva `basicauth` no nível do site roda para toda requisição.

### 5.2 Furo no Caddy (obrigatório nos dois caminhos)

Escopar o `basicauth` de admin para "tudo **exceto** os paths públicos", via
matcher:

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
- Contras: `GET /pessoas` fica público, a menos que você também o proteja em código.

**Recomendação:** **B**, *se* a lista pública de nomes for aceitável — e essa é a
conversa com o líder que estava no Slice 3; **puxe-a para antes** de fechar a
escolha. Se o líder não quiser a lista de nomes exposta, **A** é mais rápido e
correto, e casa com o "já usamos caddy auth".

Nos dois casos: `ADMIN_PASSWORD_HASH` continua sendo só o portão do admin; o
segredo do formulário é **separado** (`FORM_PASSWORD_HASH` para o Caddy, ou
`FORM_PASSWORD` para o Nest) e documentado no `.env.example`.

## 6. Front (página pública)

Rota React fora da IA de admin (Escala/Pessoas/Cadastros). Sugestão: `/disp-publica`.

Fluxo:

1. `GET /disp-publica/periodo` + `GET /disp-publica/pessoas`.
2. Pessoa escolhe o nome (combobox com busca — a lista pode ter dezenas de nomes).
3. Ao escolher, `GET /disp-publica/pessoas/:id/resposta` → pré-marca o que já foi enviado (Slice 2).
4. Lista de cultos do mês, cada um com toggle "não posso". Ordenados por data, tipo de culto diferenciado por cor (RF36).
5. Checkbox/atalho "não tenho nenhuma indisponibilidade neste mês" → envia `cultosIndisponiveis: []`.
6. Submit → `POST /disp-publica/respostas` (com a senha, conforme §5). Tela de confirmação com o `enviadoEm` e um resumo do que foi enviado. Botão "corrigir" volta ao passo 4.

Sem estado global sofisticado; um componente com `useState` e as 3 chamadas resolve.

## 7. Análise de risco e aceite (Slice 3)

Threat model baixo: voluntários de igreja, dado é "fulano não pode no dia X"
(sem nada sensível). Registrar por escrito, com o líder ciente:

| Risco | Mitigação | Aceite |
|---|---|---|
| Lista de nomes de membros ativos exposta publicamente (`GET /pessoas`) | Opção A fecha; opção B deixa aberto | **decisão do líder** — pré-requisito da escolha A/B |
| Bundle do front admin baixável (§5.2) | API continua protegida | aceitar (é JS público por natureza) ou build separado |
| Impersonação intra-congregação (qualquer um escolhe qualquer nome) | reenvio corrige; log de `enviadoEm` + IP; sem token é explícito nesta fase | aceitar até o fast-follow com token (RF05) |
| Senha compartilhada vaza (grupo de WhatsApp) | rate limit; senha só libera `POST`, não leitura; **rotacionar a senha a cada ciclo** | aceitar |
| Flood de submissões / DoS | `@nestjs/throttler` no módulo público + limites do Caddy | aceitar |
| LGPD "leve" | nome + indisponibilidade por data; sem contato, sem dado sensível | documentar finalidade |

## 8. Pré-requisitos técnicos

- [ ] `@nestjs/config` — hoje `main.ts` usa `dotenv/config` + `process.env` direto. Introduzir `ConfigModule` para ler `FORM_PASSWORD` de forma tipada/validada (opção B).
- [ ] `@nestjs/throttler` — não instalado.
- [ ] Migration Prisma para `RespostaDisponibilidade` + relação em `Pessoa`.
- [ ] `.env.example` (raiz e/ou `api/`) com o novo segredo do formulário, documentado.
- [ ] `CultoService.listarPorPeriodo` (§3.3).

## 9. Plano de execução

### Slice 1 — captura pública (~2–3 dias) — o miolo

- [ ] Migration `RespostaDisponibilidade` + `listarPorPeriodo`.
- [ ] Furo no Caddyfile (§5.2) + escolha A/B (§5.3) implementada.
- [ ] Módulo `disponibilidade-publica`: `GET /periodo`, `GET /pessoas`, `POST /respostas`.
- [ ] DTO + validação de domínio (§4).
- [ ] Transação replace-com-escopo (§2.3) no service.
- [ ] `@nestjs/throttler` no `POST`.
- [ ] Front: escolher nome → marcar cultos → enviar → confirmação.
- [ ] Testes unitários do service (§10) + e2e do `POST`.

### Slice 2 — reenvio + estados (~1 dia)

- [ ] `GET /pessoas/:id/resposta` + pré-marcação no front.
- [ ] Atalho "não tenho indisponibilidade" (`cultosIndisponiveis: []`).
- [ ] Tela de confirmação com `enviadoEm` e resumo; botão "corrigir".
- [ ] Teste: reenvio atualiza `enviadoEm` e o conjunto de `Indisponibilidade`.

### Slice 3 — endurecer + aceite (~1 dia)

- [ ] Rate limit calibrado (limites reais).
- [ ] Revisão da validação de input (fuzz nos ids, arrays grandes, tipos errados).
- [ ] Tabela de risco do §7 preenchida e **aceita por escrito pelo líder**, em especial a exposição da lista de nomes.
- [ ] Log de tentativas de senha inválida (opção B).

### Depois (fora desta spec)

- Rodar um ciclo real, coletar o que faltou prever, iterar o formato.
- Fast-follow: token individual (RF05), prazo (RF12), invalidação (RF13).

## 10. Testes

**Unitário — `DisponibilidadePublicaService` (replace com escopo):**

- marca 3 cultos → 3 linhas de `Indisponibilidade` + 1 `RespostaDisponibilidade`.
- reenvia com 1 culto (2 desmarcados) → sobra 1 linha; `enviadoEm` avança.
- reenvia com `[]` → 0 linhas de `Indisponibilidade`, `RespostaDisponibilidade` continua.
- `cultoId` fora do período → `422`, nada gravado (transação aborta).
- `pessoaId` inativo → rejeita.
- indisponibilidade da pessoa em **outro mês** não é tocada pelo `deleteMany`.

**e2e:**

- `POST /disp-publica/respostas` sem senha → `401` (opção B) / bloqueado no Caddy (opção A).
- com senha → `201` e corpo esperado.
- `GET /disp-publica/pessoas` não retorna inativos.

## 11. Questões em aberto

1. **A ou B** para proteger o path público — depende do aceite do líder sobre a lista de nomes pública (§5.3, §7).
2. Front do formulário: rota dentro do bundle atual (assets públicos) ou build separado (§5.2)?
3. `RespostaDisponibilidade.mes` como `Int` (1–12) vs. `DateTime` no 1º dia do mês — a spec assume `Int` por legibilidade; revisar se o upgrade path de `Ciclo` pedir `DateTime`.
