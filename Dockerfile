FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["sh", "-c", "npm run start:prod"]