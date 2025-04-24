FROM node:18-alpine AS builder

RUN apk add --no-cache openssl python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Копируем ВСЕ файлы, включая prisma/schema.prisma
COPY . .

# Теперь schema.prisma уже на месте — можно вызывать generate
RUN npx prisma generate

RUN npm run build

FROM node:18-alpine AS production

RUN apk add --no-cache openssl sqlite

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

ENV DATABASE_URL="file:/data/dev.db"

EXPOSE 3000

USER node

CMD ["node", "dist/main"]
