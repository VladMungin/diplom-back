FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .

RUN npx prisma generate
RUN npm run build

RUN mkdir -p /app/data && chmod -R 777 /app/data

CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]