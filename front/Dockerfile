FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY front/package*.json ./front/
RUN npm install

COPY . .
RUN npm run build --workspace=front

# ==========================================

FROM nginx:alpine

COPY --from=builder /app/front/dist /usr/share/nginx/html

COPY front/nginx.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]