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

# Projeto: sistema de escalas de serviço de igreja (módulo Escalador)

Estou construindo, como desenvolvedor solo, um módulo (Escalador) de um sistema maior de automações da igreja. Visão completa do produto em `docs/escopo.md`; lista completa de requisitos funcionais (RF01-RF31) em `docs/rfs.md`. Esses dois documentos descrevem o sistema **final**, não o que deve ser implementado agora — o desenvolvimento segue em sprints incrementais (veja abaixo), então boa parte do que está lá é propositalmente ainda fora do que estamos construindo.

## MVP inicial (concluído)

O primeiro MVP cobria só disponibilidade: Pessoa (nome), Culto (data e rótulo) e Indisponibilidade (pessoa↔culto; existência do registro = "não pode servir"). Essas entidades continuam a base do sistema.

Também foi construído, fora do escopo original do MVP mas necessário e para manter: um **gerador de cultos recorrentes por mês** (`CultoService.gerarCultosDoMes`/`salvarCultosDoMes`) — deriva automaticamente os cultos de domingo, terça e os sábados de consagração (1º e 3º) de um mês/ano. É uma peça permanente, não descartar.

## Fase atual — desenvolvimento por sprints

Estamos indo de "registrar disponibilidade" para o sistema de escalas de verdade, em sprints pequenos com protótipo demonstrável ao final de cada um. A ordem foi reorganizada: antes de investir em Alocação/montador, queremos validar a captura de disponibilidade com uso real, porque só rodando um ciclo de verdade dá pra descobrir requisitos que não têm como prever de antemão (disponibilidade parcial? campo de observação? granularidade certa?).

**Já entregue:**
- Schema: `Ministério`, `Função` e `Qualificação` (pessoa ↔ função que pode exercer).
- Exibição filtrada: pessoas disponíveis para um culto, filtradas por ministério e função específicos (e o inverso, disponibilidade de uma pessoa por culto).
- RF01-04 (cadastros de pessoa, ministério/função, qualificação, culto) + indisponibilidade.

**Próximo (novo topo):**
- Captura pública "pobre": subset de RF05-13 sem infra de token — página pública onde a pessoa seleciona o próprio nome, marca os cultos em que está indisponível, e envia. ~3-4 dias.

**Depois — rodar o ciclo real e iterar:**
- Usar o form pobre num ciclo de verdade para descobrir o que faltou prever (granularidade de disponibilidade, campos extras, etc.) antes de endurecer o formulário.

**Fast-follow:**
- Endurecer com token (resto de RF05-13: link individual, prazo, invalidação), já sabendo o formato certo depois da iteração acima.

**Fim da fila (antigos Sprints 2/3/4 — é quando um gerador automático passaria a fazer sentido):**
- Schema: `Alocação` (pessoa + culto + função) — registro por trás do montador manual de escala.
- RF17 (demanda de cada função por tipo de culto), para mostrar quota no montador (ex: "faltam 2 vocalistas").
- Schema: `Ciclo` (agrupa cultos num período) + histórico de escalas entre ciclos (RF27/28).
- RF14 (teto de escalas por pessoa), RF15/16 (pares que devem/devem evitar servir juntos), RF18/19 (fixação manual, indisponibilidade recorrente), conforme o montador se aproxima. Não modelar antes disso: sem gerador/montador consumindo essas regras, são campos sem uso.

**Fora do horizonte por enquanto** (não implementar sem decisão explícita): geração automática de escala + escalas candidatas (RF20-26), exportação como imagem/planilha (RF29-31).

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

Caso vá implementar algo utilize os conceitos de boas praticas e codigo limpo

# Modo de trabalho — projeto de estudo

Este é um projeto de estudo. O objetivo não é entregar rápido, é eu aprender. Portanto:

Não implemente funcionalidades inteiras por conta própria. A escrita do código é minha, a menos que eu peça explicitamente.
Prefira explicar, revisar o que eu escrevi, responder dúvidas pontuais e sugerir o próximo passo.
Quando eu errar, não conserte pra mim: aponte onde está o problema e por quê, e me deixe corrigir.
Quando eu pedir um exemplo, mostre o padrão ou a estrutura (o formato de um módulo, o esqueleto de um schema) em vez de a solução completa pronta pra colar.
Pode escrever código quando eu pedir de forma explícita — mas a dose de ajuda é decisão minha, então na dúvida, ensine antes de resolver.