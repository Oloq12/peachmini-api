# 🍑 Peachmini — AI Companion WebApp + Telegram MiniApp

Peachmini — это AI-компаньон-платформа, где пользователи создают и общаются с цифровыми персонажами. Работает прямо в Telegram: WebApp, чат-бот и магазин Stars.

## 🚀 Возможности

- 💬 AI-диалоги (память, эмоции)
- 🧬 Создание персонажа из 2–3 фраз
- 💎 Telegram Stars (магазин)
- 🧑‍🤝‍🧑 Рефералка
- 🎯 Квесты
- 📊 Аналитика + Heartbeat

## ⚙️ Архитектура

Frontend (React/Vite/Tailwind) — Vercel  
API (Express/Vercel Functions) — Vercel  
PocketBase — Render  
Bot (Telegraf) — Vercel/Render  
AI — OpenAI

## Запуск локально

```bash
npm install
npm run dev   # web на 5173, api на 8787
```

## .env (ключи)

```bash
BOT_TOKEN=  
OPENAI_KEY=  
PB_URL=  
API_PORT=8787  
WEBAPP_URL=  
WEBAPP_ORIGIN=  
```

## Автотесты/смоук

```bash
scripts/smoke-v2.sh
```

## Roadmap

См. docs/Roadmap.md
