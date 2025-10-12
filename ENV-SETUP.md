# 🔧 Настройка переменных окружения (.env)

## Создайте файл `.env` в корне проекта

```bash
# В корне проекта /Users/egor/Desktop/peach-mini/
touch .env
```

## Содержимое файла `.env`:

```env
# Telegram Bot Configuration
BOT_TOKEN=your_bot_token_here

# Admin User ID (optional)
ADMIN_ID=your_telegram_user_id

# WebApp URL - замените на URL вашего задеплоенного приложения
# Примеры:
# - Для локальной разработки (через ngrok):
#   WEBAPP_URL=https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
# - GitHub Pages: 
#   WEBAPP_URL=https://username.github.io/repo-name
# - Vercel: 
#   WEBAPP_URL=https://your-app.vercel.app
# - Netlify: 
#   WEBAPP_URL=https://your-app.netlify.app
WEBAPP_URL=http://localhost:5173

# PocketBase URL (optional)
PB_URL=http://127.0.0.1:8090
```

## 📝 Как получить BOT_TOKEN:

1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен и вставьте в `.env`

## 🌐 Как получить WEBAPP_URL:

### Для локальной разработки (используйте ngrok):

```bash
# Установите ngrok: https://ngrok.com/download
# Запустите ваш WebApp:
cd vite-project
npm run dev

# В другом терминале запустите ngrok:
ngrok http 5173

# Скопируйте HTTPS URL (например: https://xxxx.ngrok-free.app)
# И вставьте в .env как WEBAPP_URL
```

### Для production:

1. Задеплойте ваш WebApp (см. vite-project/QUICK-START.md)
2. Скопируйте URL
3. Вставьте в `.env`

## ⚠️ Важно:

- **НЕ** коммитьте файл `.env` в git!
- Файл `.env` должен быть в `.gitignore`
- Для production используйте HTTPS URL (обязательно для Telegram WebApp)

