# 🔑 Environment Variables Guide

## Структура переменных

### Корневой .env (Backend/Bot)
```bash
# API Configuration
API_URL=https://peachmini-api.onrender.com    # URL API сервера
API_PORT=8787                                 # Порт API (локально)

# Database
PB_URL=http://127.0.0.1:8090                 # PocketBase URL

# External Services
OPENAI_KEY=sk-proj-...                       # OpenAI API ключ
BOT_TOKEN=your_telegram_bot_token            # Telegram Bot Token

# Frontend URLs
WEBAPP_URL=https://your-frontend.vercel.app  # Основной URL фронтенда
WEBAPP_ORIGIN=https://your-frontend.vercel.app # CORS origin для API

# Development
NODE_ENV=development                          # Режим разработки
DEBUG=false                                   # Отладка
```

### peach-web/.env (Frontend)
```bash
# API Configuration
VITE_API_URL=https://peachmini-api.onrender.com # API URL для фронтенда

# PocketBase (optional)
VITE_PB_URL=http://127.0.0.1:8090            # Прямое подключение к PB

# Analytics (optional)
VITE_UMAMI_URL=https://your-analytics.com    # Umami Analytics URL
VITE_UMAMI_WEBSITE_ID=your_website_id        # Umami Website ID
```

## Назначение переменных

| Переменная | Назначение | Где используется |
|------------|------------|------------------|
| `API_URL` | URL API сервера | Bot, Backend scripts |
| `VITE_API_URL` | API URL для фронтенда | React app (Vite) |
| `PB_URL` | PocketBase URL | API server, Bot |
| `VITE_PB_URL` | PocketBase для фронтенда | React app (опционально) |
| `WEBAPP_URL` | Основной URL фронтенда | Telegram bot |
| `WEBAPP_ORIGIN` | CORS origin | API server |
| `OPENAI_KEY` | OpenAI API ключ | API server |
| `BOT_TOKEN` | Telegram Bot Token | Telegram bot |

## Развертывание

### Render (API)
- `API_URL` → URL Render API
- `PB_URL` → URL PocketBase
- `OPENAI_KEY` → OpenAI API ключ
- `BOT_TOKEN` → Telegram Bot Token
- `WEBAPP_URL` → Vercel URL фронтенда
- `WEBAPP_ORIGIN` → Vercel URL для CORS

### Vercel (Frontend)
- `VITE_API_URL` → Render API URL
- `VITE_PB_URL` → PocketBase URL (опционально)

## Безопасность

⚠️ **НЕ КОММИТЬТЕ** файлы `.env` в Git!
✅ Используйте `.env.example` как шаблон
✅ Добавьте `.env` в `.gitignore`
