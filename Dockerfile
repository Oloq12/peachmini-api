FROM node:20-alpine
WORKDIR /app

# Копируем package.json из bot папки
COPY bot/package*.json ./
RUN npm install --omit=dev

# Копируем весь проект
COPY . .

# Устанавливаем PocketBase
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v0.21.3/pocketbase_0.21.3_linux_amd64.zip \
    && unzip pocketbase_0.21.3_linux_amd64.zip -d /app \
    && rm pocketbase_0.21.3_linux_amd64.zip \
    && chmod +x /app/pocketbase

EXPOSE 8787
CMD ["sh", "-c", "/app/pocketbase serve --http 0.0.0.0:8090 --dir /app/pb_data & cd bot && node api.cjs"]