# --- Dockerfile для Peachmini API ---
FROM node:20-alpine

# Установка рабочей директории
WORKDIR /app

# Копируем package.json из корня и bot/
COPY package*.json ./
COPY bot/package*.json ./bot/

# Устанавливаем зависимости в bot/
WORKDIR /app/bot
RUN npm install --omit=dev

# Возвращаемся в корень
WORKDIR /app

# Копируем все файлы проекта
COPY . .

# Переходим в bot/ для запуска
WORKDIR /app/bot

# Открываем порт
EXPOSE 8787

# Запуск API сервера
CMD ["node", "api.cjs"]

