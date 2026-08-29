FROM node:22-alpine

WORKDIR /app

RUN apk add --update --no-cache openssl

COPY package*.json ./
COPY api/package*.json ./api/

RUN npm install

COPY . .

RUN npx prisma generate --schema=./api/prisma/schema.prisma

RUN npm run build --workspace=api

EXPOSE 3000

CMD sh -c 'echo "DATABASE_URL=$DATABASE_URL" > /app/api/.env && cd /app/api && npx prisma migrate deploy && node /app/api/dist/src/main.js'