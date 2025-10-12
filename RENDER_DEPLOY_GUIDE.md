# 🚀 Деплой API на Render

## Шаг 1: Создание Web Service

1. Открой https://dashboard.render.com/
2. Нажми **"New +"** → **"Web Service"**
3. Подключи репозиторий **Oloq12/peachmini-api**
4. Render автоматически обнаружит `render.yaml`

## Шаг 2: Настройка переменных окружения

Добавь следующие переменные в Render Dashboard:

```
PB_URL=http://127.0.0.1:8090
OPENAI_KEY=<твой OpenAI ключ из .env>
BOT_TOKEN=<твой Telegram бот токен из .env>
WEBAPP_URL=https://peach-mini.vercel.app
WEBAPP_ORIGIN=https://peach-mini.vercel.app
```

**Примечание:** Используй значения из локального `.env` файла.

## Шаг 3: Деплой

1. Нажми **"Create Web Service"**
2. Дождись завершения деплоя (~5 минут)
3. Получи URL: `https://peachmini-api.onrender.com`

## Шаг 4: Проверка

```bash
curl https://peachmini-api.onrender.com/api/health
```

Ожидаемый ответ:
```json
{
  "ok": true,
  "time": 1234567890,
  "pb": true,
  "ai": true
}
```

## Шаг 5: Обновление фронта

Запусти скрипт:
```bash
./update-api-url.sh
```

Введи Render URL и скрипт автоматически:
- Обновит `peach-web/.env`
- Пересоберет фронт
- Задеплоит на Vercel

## Проверка чата

```bash
curl -X POST https://peachmini-api.onrender.com/api/chat/reply \
  -H "Content-Type: application/json" \
  -d '{"girlId":"1","userMsg":"Привет!","userId":"test"}'
```

Ожидаемый ответ:
```json
{
  "ok": true,
  "reply": "Привет! Как дела?...",
  "balance": 998
}
```

## ✅ Готово!

Теперь у тебя:
- API на Render (с OpenAI)
- Frontend на Vercel
- Полностью работающий чат
