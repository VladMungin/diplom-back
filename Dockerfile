FROM node:22

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build:nest

RUN rm -rf ./src

EXPOSE 3000

CMD ["npm", "run", "start:prod"]