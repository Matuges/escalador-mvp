1. Subir o banco (Docker):
docker compose up -d
Rode da raiz do projeto, onde está o docker-compose.yml.

2. Rodar as migrations (dentro de api/):
npx prisma migrate dev