FROM node:22

WORKDIR /app

COPY . .

RUN yarn 

RUN npm run build:nest

RUN rm -rf ./src

EXPOSE 3000

CMD ["npm", "run", "start:prod"]