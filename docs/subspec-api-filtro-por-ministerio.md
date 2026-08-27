# Subspec (API) — Filtro de listagens por `ministerioId`

> Branch própria, a partir de `main` (ex.: `feat/api-filtro-por-ministerio`).
> Pré-requisito da Task 2 de `spec-ajustes-perfil-filtro-busca.md`.

## Problema

Hoje as listagens de pessoas só filtram por `funcaoId`. Não há como pedir "todo
mundo que exerce **alguma** função do ministério X". O front precisa disso para que
selecionar só o ministério no `MinisterioFuncaoSelect` já surta efeito.

A relação necessária já existe no schema: `Qualificacao → Funcao → Ministerio`
(`api/prisma/schema.prisma`). Nenhuma migration é necessária — é só um caminho de
`where` novo no Prisma.

## Endpoints afetados

| Endpoint | Arquivo | Hoje | Depois |
|---|---|---|---|
| `GET /pessoa` | `pessoa.controller.ts` / `pessoa.service.ts` (`findAll`) | `funcaoId?`, `incluirInativos?` | `+ ministerioId?` |
| `GET /culto/:id/disponibilidades` | `culto.controller.ts` / `culto.service.ts` (`findDisponibilidade`) | `funcaoId?` | `+ ministerioId?` |

## Contrato

- `ministerioId` é query param opcional, inteiro positivo. Usar
  `new ParseIntPipe({ optional: true })`, igual ao `funcaoId` atual.
- **Precedência:** se `funcaoId` vier, ele manda e `ministerioId` é ignorado
  (função é o filtro mais específico e sempre pertence a um ministério). Só quando
  `funcaoId` está ausente é que `ministerioId` entra.
- Sem nenhum dos dois: comportamento atual, sem filtro de qualificação.
- Filtro no Prisma quando `ministerioId` está ativo:

  ```
  qualificacoes: { some: { funcao: { ministerioId } } }
  ```

  (hoje o filtro por função é `qualificacoes: { some: { funcaoId } }` — mesmo
  formato, só descendo mais um nível.)

- `GET /pessoa` mantém a combinação com `ativo` / `incluirInativos` como está.

## Tasks

### Task A — `PessoaService.findAll` + controller

- `findAll(funcaoId?, incluirInativos?, ministerioId?)`: montar o `where` de
  qualificação escolhendo entre `funcaoId` e `ministerioId` pela regra de
  precedência acima. Cuidar para não montar `qualificacoes: { some: {} }` vazio
  quando nenhum dos dois vier.
- Controller: novo `@Query('ministerioId', new ParseIntPipe({ optional: true }))`
  e novo `@ApiQuery` no Swagger descrevendo o parâmetro e a precedência.

### Task B — `CultoService.findDisponibilidade` + controller

- Mesma mudança de assinatura e de `where` que a Task A.
- Atualizar o `@ApiQuery` / `@ApiOperation` do endpoint em `culto.controller.ts`.

### Task C — Testes

- `pessoa.service.spec.ts` e `culto.service.spec.ts` já cobrem os casos de
  `funcaoId`. Adicionar:
  - `ministerioId` sozinho → `where` com `qualificacoes: { some: { funcao: { ministerioId } } }`.
  - `funcaoId` + `ministerioId` juntos → `where` usa só `funcaoId` (precedência).
- Se houver `*.controller.spec.ts` validando as chamadas ao service, incluir o
  novo argumento.

## Definição de pronto

- `GET /pessoa?ministerioId=1` e `GET /culto/1/disponibilidades?ministerioId=1`
  retornam só pessoas com ao menos uma qualificação em função daquele ministério.
- Passar `funcaoId` junto continua se comportando como antes.
- `npm run test` e `npm run lint` verdes na pasta `api/`.
- Swagger (`/docs`) descreve o novo parâmetro nos dois endpoints.

## Fora de escopo

- Endpoint dedicado tipo `GET /ministerio/:id/pessoa` — o query param resolve.
- Filtrar por múltiplos ministérios de uma vez — a UI seleciona um só.
