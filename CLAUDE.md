# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

Monorepo with npm workspaces, two real projects:
- `api/` — NestJS + Prisma backend
- `front/` — React + Vite + Tailwind SPA (shadcn/ui is planned in the Stack section below but **not installed yet**: no `components.json`, no `src/components/ui/`, no `src/lib/utils.ts`. All inputs are hand-styled raw `<input>`/`<select>` using Tailwind utility classes.)

Root-level `package.json` is workspace orchestration only, no real scripts.

## Commands — api/

Run from the `api/` directory.

```bash
npm run start:dev      # dev server with watch mode
npm run start:debug     # dev server with debugger + watch mode
npm run build            # compile via nest build
npm run start:prod      # run compiled output from dist/main

npm run lint              # eslint --fix on src, apps, libs, test
npm run format            # prettier --write on src and test

npm run test               # unit tests (jest)
npm run test:watch      # unit tests, watch mode
npm run test:cov         # unit tests with coverage
npm run test:e2e         # e2e tests, uses test/jest-e2e.json config
```

Run a single unit test file: `npx jest src/app.controller.spec.ts`
Run a single test by name: `npx jest -t "test name"`

Node version is pinned via `.nvmrc` (v22.23.2).

## Commands — front/

Run from the `front/` directory.

```bash
npm run dev        # vite dev server (proxies /api -> http://localhost:3000, see vite.config.ts)
npm run build       # tsc -b && vite build
npm run preview    # preview the production build
```

No test runner configured yet in `front/`.

Type-check without emitting: `npx tsc --noEmit -p tsconfig.app.json`

## Architecture — api/

Standard NestJS module/controller/service structure, one module per entity:
- `src/main.ts` — entrypoint, bootstraps the Nest app via `NestFactory`, listens on `process.env.PORT` (defaults to 3000)
- `src/app.module.ts` — root module; register new feature modules here as the app grows
- `src/pessoa/` — `pessoa.controller.ts` / `pessoa.service.ts` / `dto/{create,update}-pessoa.dto.ts`. Also owns `GET pessoa/:id/disponibilidades` — for a pessoa, returns every culto with a `disponivel` flag.
- `src/culto/` — `culto.controller.ts` / `culto.service.ts` / `dto/{create,update,mes}-culto.dto.ts`. Also owns `gerarCultosDoMes`/`salvarCultosDoMes` (auto-generates the month's cultos from a fixed weekly pattern — Sunday AM/PM, Tuesday, 1st/3rd Saturday).
- `src/indisponibilidade/` — `indisponibilidade.controller.ts` / `indisponibilidade.service.ts`, no DTOs (route params only). Routes are nested under `pessoa/:pessoaId/indisponibilidade/:cultoId` (`PUT` upserts = mark unavailable, `DELETE` = mark available again). Symmetric/idempotent, callable from either the "by pessoa" or "by culto" direction.
- `src/prisma/` — `PrismaService`/`PrismaModule`, injected into the other services.
- Each entity module follows the same `*.controller.ts` / `*.service.ts` / `dto/` layout; new entities should mirror this.

Environment variables live in `api/.env` (see `api/.env.example` for the expected shape); `api/.env` is not loaded automatically yet — no `@nestjs/config` setup is present in `app.module.ts`.

Jest config for unit tests lives inline in `api/package.json` (`rootDir: src`, matches `*.spec.ts`). E2E tests use the separate config at `api/test/jest-e2e.json`.

## Architecture — front/

Flat structure, no subdirectories under `src/` yet, no router (tabs are plain `useState`), no global state library:
- `src/api.ts` — every fetch call to the API plus the shared TS types (`Pessoa`, `Culto`, `DisponibilidadeItem`, `CultoDisponibilidadeItem`, `CultoPreview`). Each function is a standalone `fetch` against `BASE = '/api'` with its own `if (!res.ok) throw new Error(...)`, no shared request helper. Add new API calls here following that same pattern.
- `src/App.tsx` — root; `useState<Tab>` where `Tab = 'disponibilidade' | 'pessoas' | 'cultos'` switches between the three pages below. No URL routing.
- `src/DisponibilidadePage.tsx` — the MVP's central screen: pick a Pessoa, see every Culto with a "Pode/Não pode" toggle pill (toggling calls the indisponibilidade PUT/DELETE endpoints).
- `src/CultosPage.tsx` — Culto CRUD (create/edit/delete), the "gerar cultos do mês" preview/save panel, and a search bar filtering the list by substring on `nome`. Clicking a culto's name swaps the whole page to `CultoDisponibilidadesPage` (local `cultoSelecionado` state, not a new tab).
- `src/CultoDisponibilidadesPage.tsx` — inverse of `DisponibilidadePage`: given one culto, lists every pessoa with the same toggle pill, keyed by `pessoaId` instead of `cultoId`. Depends on `GET culto/:id/disponibilidades`, which does **not exist in the backend yet** (mirrors `PessoaService.findDisponibilidade` but inverted — see that method for the pattern to copy when implementing it).
- `src/PessoasPage.tsx` — Pessoa CRUD.
- `src/index.css` — Tailwind v4 theme tokens (`@theme` block): `navy`, `steel`, `mist`, `sand`, `caramel`, `espresso`, `ivory`. No dedicated danger/red color — the existing "unavailable" state reuses `sand`/`caramel`/`espresso` (warm/muted tones), not red.

# Projeto: sistema de escalas de serviço de igreja — MVP inicial

Estou construindo, como desenvolvedor solo, um sistema web que futuramente vai gerar escalas de serviço de uma igreja automaticamente. Este é o primeiro MVP, deliberadamente mínimo. Não implemente nada além do escopo abaixo.

Escopo do MVP: apenas registrar e consultar a disponibilidade de pessoas para cultos. Três entidades: Pessoa (só nome), Culto (data e um rótulo) e uma Indisponibilidade que liga pessoa a culto (a existência do registro significa "não pode servir"; a ausência significa disponível). A tela central é: seleciono uma pessoa e vejo todos os cultos, cada um com um estado "pode / não pode" que alterno clicando — alternar cria ou remove o registro de indisponibilidade.

Fora do escopo (não implemente): ministérios, funções, qualificações, geração de escala, alocação, formulário público, tokens, limite de carga, preferências, exportação. Nada disso entra neste MVP.

## Stack:

API: NestJS + Prisma
Banco: PostgreSQL (rodando em container Docker local durante o desenvolvimento)
Front (fase posterior deste MVP): React + Vite + Tailwind + shadcn/ui, como SPA estática
Node 22 (já instalado e em uso)

## Estrutura — monorepo com npm workspaces:

raiz/                 (git, .nvmrc, .gitignore, package.json de orquestração com workspaces)
├── api/              (NestJS; package.json próprio; prisma/schema.prisma; .env e .env.example)
└── front/            (React + Vite + Tailwind; package.json próprio — ver "Architecture — front/" acima para o mapa de arquivos)

/solver (Python) e /caddy são fases futuras — não crie ainda.

## Convenções e decisões já tomadas:

Modelos do Prisma em português (Pessoa, Culto, Indisponibilidade), tabelas em snake_case.
Disponibilidade registrada por culto (não por data): o culto já carrega a data.
.env fica em /api/.env (contém DATABASE_URL), nunca versionado. Versione um .env.example com as chaves vazias.
.gitignore na raiz cobre o monorepo inteiro (node_modules, dist, .env).

# Modo de trabalho — projeto de estudo

Este é um projeto de estudo. O objetivo não é entregar rápido, é eu aprender. Portanto:

Não implemente funcionalidades inteiras por conta própria. A escrita do código é minha, a menos que eu peça explicitamente.
Prefira explicar, revisar o que eu escrevi, responder dúvidas pontuais e sugerir o próximo passo.
Quando eu errar, não conserte pra mim: aponte onde está o problema e por quê, e me deixe corrigir.
Quando eu pedir um exemplo, mostre o padrão ou a estrutura (o formato de um módulo, o esqueleto de um schema) em vez de a solução completa pronta pra colar.
Pode escrever código quando eu pedir de forma explícita — mas a dose de ajuda é decisão minha, então na dúvida, ensine antes de resolver.