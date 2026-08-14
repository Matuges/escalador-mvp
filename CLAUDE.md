# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This repo currently contains a single project: `api/`, a NestJS backend (freshly scaffolded via `nest new`, not yet built out). Root-level `package.json` is an unrelated empty stub — all real work happens inside `api/`.

## Commands

Run all commands from the `api/` directory.

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

## Architecture

Standard NestJS module/controller/service structure:
- `src/main.ts` — entrypoint, bootstraps the Nest app via `NestFactory`, listens on `process.env.PORT` (defaults to 3000)
- `src/app.module.ts` — root module; register new feature modules here as the app grows
- `src/*.controller.ts` / `src/*.service.ts` — controller/service pairs per Nest convention

Environment variables live in `api/.env` (see `api/.env.example` for the expected shape); `api/.env` is not loaded automatically yet — no `@nestjs/config` setup is present in `app.module.ts`.

Jest config for unit tests lives inline in `api/package.json` (`rootDir: src`, matches `*.spec.ts`). E2E tests use the separate config at `api/test/jest-e2e.json`.

# Projeto: sistema de escalas de serviço de igreja — MVP inicial

Estou construindo, como desenvolvedor solo, um sistema web que futuramente vai gerar escalas de serviço de uma igreja automaticamente. Este é o primeiro MVP, deliberadamente mínimo. Não implemente nada além do escopo abaixo.

Escopo do MVP: apenas registrar e consultar a disponibilidade de pessoas para cultos. Três entidades: Pessoa (só nome), Culto (data e um rótulo opcional) e uma Indisponibilidade que liga pessoa a culto (a existência do registro significa "não pode servir"; a ausência significa disponível). A tela central é: seleciono uma pessoa e vejo todos os cultos, cada um com um estado "pode / não pode" que alterno clicando — alternar cria ou remove o registro de indisponibilidade.

Fora do escopo (não implemente): ministérios, funções, qualificações, geração de escala, alocação, formulário público, tokens, limite de carga, preferências, exportação. Nada disso entra neste MVP.

## Stack:

API: NestJS + Prisma
Banco: PostgreSQL (rodando em container Docker local durante o desenvolvimento)
Front (fase posterior deste MVP): React + Vite + Tailwind + shadcn/ui, como SPA estática
Node 22 (já instalado e em uso)

## Estrutura — monorepo com npm workspaces:

raiz/                 (git, .nvmrc, .gitignore, package.json de orquestração com workspaces)
└── api/              (NestJS; package.json próprio; prisma/schema.prisma; .env e .env.example)

O front virá em /front depois. /solver (Python) e /caddy são fases futuras — não crie ainda.

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