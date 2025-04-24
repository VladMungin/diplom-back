# Базовый образ Node.js
FROM node:20

# Устанавливаем необходимые зависимости для Prisma (openssl и другие)
RUN apt-get update && apt-get install -y \
    openssl \
    curl \
    bash \
    && apt-get clean

# Создаем рабочую директорию
WORKDIR /app

# Копируем только Prisma файлы сначала (чтобы использовать кеширование)
COPY prisma ./prisma/

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Генерируем Prisma клиент
RUN npx prisma generate

# Копируем остальные файлы проекта
COPY . .

# Собираем проект (если используется TypeScript)
RUN npm run build:nest

# Открываем порт, который использует приложение
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "run", "start:nest"]
