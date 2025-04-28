FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN yarn

COPY . .

RUN mkdir -p /app/data && chmod -R 777 /app/data

RUN npx prisma generate
RUN npm run build

CMD ["npm", "run", "start:prod"]