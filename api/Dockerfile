FROM node:18-alpine

WORKDIR /app

RUN apk add --update --no-cache openssl

COPY package*.json ./
COPY api/package*.json ./api/

RUN npm install

COPY . .

RUN npx prisma generate --schema=./api/prisma/schema.prisma

RUN npm run build --workspace=api

EXPOSE 3000

CMD npx prisma migrate deploy --schema=./api/prisma/schema.prisma && node api/dist/main.js