# Escalador — MVP

Monorepo (npm workspaces): `api/` (NestJS + Prisma), `front/` (React + Vite),
`caddy/` (proxy reverso). Orquestração via `docker-compose.yml` na raiz.

## Variáveis de ambiente

São dois arquivos, com consumidores diferentes. Nenhum é versionado — cada um
tem um `.example` ao lado, com as chaves e instruções.

| Arquivo | Quem lê | Para quê |
|---|---|---|
| `/.env` | **só** o `docker-compose.yml` (interpolação `${VAR}`) | senha do Postgres, hash do basicauth do Caddy, hostname do Caddy |
| `/api/.env` | `api/prisma.config.ts` e `api/src/main.ts` (via `dotenv/config`); `PrismaService` em runtime | `DATABASE_URL` — **só** quando a API roda no host |

Quando a API roda em container, o `docker-compose.yml` injeta `DATABASE_URL`
direto no serviço `api` e o `/api/.env` é ignorado (está no `.dockerignore`).

O `front/` não usa env: em dev o Vite faz proxy de `/api` para `localhost:3000`;
em produção o Nginx serve o estático e o Caddy roteia `/api/*`.

---

## Cenário A — stack inteira em container

Tudo sobe junto (front + api + banco + Caddy). É o que mais se aproxima da VPS.

```bash
cp .env.example .env
```

Preencha `/.env`:

- `DB_PASSWORD` — escolha uma senha local.
- `ADMIN_PASSWORD_HASH` — gere o hash:
  ```bash
  docker run --rm caddy:2-alpine caddy hash-password --plaintext 'suasenha'
  ```
- `CADDY_SITE_ADDRESS` — deixe `http://localhost`.

```bash
docker compose up --build
```

Acesse `http://localhost` (basicauth: `admin` / a senha que você usou no hash).
Swagger em `http://localhost/api/docs`.

> As migrations rodam sozinhas: o `CMD` do `api/Dockerfile` faz
> `prisma migrate deploy` antes de subir a API.

---

## Cenário B — API e front no host (loop de dev)

Só o Postgres em container; API e front rodam no host com watch/HMR.

**1. Habilite a porta do Postgres no host** (o `docker-compose.yml` base não
publica — é o certo para a VPS):

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
```

**2. Configure os envs** (a senha tem que ser a mesma nos dois):

```bash
cp .env.example .env                 # preencha DB_PASSWORD
cp api/.env.example api/.env         # ajuste a senha na DATABASE_URL
```

**3. Suba o banco e rode as migrations:**

```bash
docker compose up -d postgres
cd api
npx prisma migrate dev
npm run start:dev                    # API em :3000
```

**4. Em outro terminal, o front:**

```bash
cd front
npm run dev                          # Vite em :5173, proxy /api -> :3000
```

Acesse `http://localhost:5173`. Sem Caddy nesse fluxo, então sem basicauth.

---

## Prisma Studio

Da pasta `api/`, com o `api/.env` apontando para um banco alcançável
(Cenário B, ou Cenário A com o override da porta ativo):

```bash
npx prisma studio
```
