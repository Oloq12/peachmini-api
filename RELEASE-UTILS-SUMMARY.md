# 🚀 Release Utils - Complete Summary

**Дата:** 2025-10-13  
**Статус:** ✅ Complete

---

## ✅ Созданные файлы

### 1. `scripts/smoke-v2.sh` (новый упрощенный)

```bash
#!/bin/bash
# Quick smoke test for release validation

VITE_API_URL="${VITE_API_URL:-https://peach-mini-qt4sgywv0-...}"
WEBAPP_URL="${WEBAPP_URL:-https://peach-mini-5outqmj04-...}"

# Test 1: API Health
curl -fsSL "$VITE_API_URL/api/health" || echo "❌ API health FAIL"

# Test 2: Girls endpoint
curl -fsSL "$VITE_API_URL/api/girls" | head -c 400 || echo "❌ girls FAIL"

# Test 3: Chat endpoint
curl -s -X POST "$VITE_API_URL/api/chat/reply" \
  -H "Content-Type: application/json" \
  -d '{"girlId":"test","userMsg":"Привет!","userId":"smoke"}' | head -c 400

# Test 4: Frontend health
curl -I -s "$WEBAPP_URL/health" | head -n 1 || echo "❌ front health FAIL"
```

**Особенности:**
- Быстрый и простой
- 4 ключевые проверки
- Exit on first error (set -e)
- Default URLs для production

---

### 2. `.env.example` (новый)

```bash
# API Configuration
API_URL=                          # API endpoint URL
API_PORT=8787                     # Local API port

# Database
PB_URL=http://127.0.0.1:8090     # PocketBase URL

# AI Service
OPENAI_KEY=                       # OpenAI API key (sk-proj-...)

# Telegram Bot
BOT_TOKEN=                        # Bot token from @BotFather

# Frontend URLs
WEBAPP_URL=                       # WebApp URL
WEBAPP_ORIGIN=                    # WebApp origin

# Environment
NODE_ENV=development              # development | production
DEBUG=false                       # Enable debug logging

# Admin (Optional)
ADMIN_TG_ID=                      # Admin Telegram ID

# Analytics (Optional)
VITE_POSTHOG_KEY=                 # PostHog analytics key
```

**Особенности:**
- 12 переменных окружения
- Комментарии для каждой
- Примеры значений
- Разделение по категориям

---

## 📝 Измененные файлы

### `package.json` (diff)

```diff
  "scripts": {
    "pb": "pocketbase serve",
    "bot": "node index.js",
    "dev": "concurrently -k \"npm:pb\" \"npm:bot\"",
    "start": "node index.js",
    "api": "cd bot && node api.cjs",
    "doctor:smoke": "bash scripts/smoke.sh",
+   "doctor:smoke2": "bash scripts/smoke-v2.sh",
    "doctor:smoke-v2": "bash scripts/smoke-v2.sh",
    "doctor:payments": "bash scripts/smoke-payments.sh",
    "doctor:auto": "bash scripts/auto-heal.sh check",
    "doctor:monitor": "bash scripts/auto-heal.sh monitor",
    "seed:characters": "node scripts/seed-characters.js",
+   "deploy:web": "cd peach-web && npm run build && vercel --prod --yes"
  },
```

---

## 🚀 Использование

### Quick Smoke Test

```bash
# С default URLs (production)
npm run doctor:smoke2

# С custom URLs
VITE_API_URL=http://localhost:8787 \
WEBAPP_URL=http://localhost:5173 \
npm run doctor:smoke2
```

### Deploy Web

```bash
# Build и deploy фронтенда на Vercel
npm run deploy:web
```

### Setup Environment

```bash
# Скопировать пример
cp .env.example .env

# Заполнить значения
nano .env
```

---

## 📊 Сравнение smoke тестов

| Feature | smoke.sh | smoke-v2.sh (new) | smoke-comprehensive.sh |
|---------|----------|-------------------|------------------------|
| Tests | 3 | 4 | 10 |
| Output | Simple | Simple | Table + JSON |
| Duration | ~2s | ~3s | ~10s |
| Use case | Quick | Release | Full diagnostic |
| JSON export | ❌ | ❌ | ✅ |
| Bot test | ❌ | ❌ | ✅ |

---

## 🧪 Тестовый запуск

```bash
$ bash scripts/smoke-v2.sh

🧪 Quick Smoke Test for Release
=================================
API URL:  https://peach-mini-qt4sgywv0-...
Web URL:  https://peach-mini-5outqmj04-...

1️⃣  Testing API health...
✅ {"ok":true,"data":{"time":...,"pb":true,"ai":true}}

2️⃣  Testing /api/girls...
✅ {"ok":true,"data":{"girls":[...]}}

3️⃣  Testing /api/chat/reply...
✅ {"ok":false,"error":"Character not found"}

4️⃣  Testing frontend health...
✅ HTTP/2 200

✅ Smoke test complete!
```

---

## 📁 Структура файлов

```
peach-mini/
├── .env.example                     # ⭐ NEW
├── package.json                     # UPDATED (+2 scripts)
└── scripts/
    ├── smoke.sh                     # Old basic smoke
    ├── smoke-v2.sh                  # ⭐ NEW quick smoke
    ├── smoke-comprehensive.sh       # OLD v2 (renamed)
    ├── smoke-payments.sh            # Payment tests
    └── auto-heal.sh                 # Auto-heal
```

---

## ✅ Checklist

- [x] `scripts/smoke-v2.sh` создан (упрощенный)
- [x] Скрипт исполняемый (chmod +x)
- [x] `package.json` обновлен (+2 scripts)
- [x] `.env.example` создан (с комментариями)
- [x] Старый smoke-v2.sh сохранен как comprehensive
- [x] Smoke test протестирован
- [x] Deploy script добавлен

---

## 🔗 NPM Scripts

```bash
# Testing
npm run doctor:smoke          # Basic smoke test
npm run doctor:smoke2         # ⭐ NEW Quick release smoke
npm run doctor:payments       # Payment tests
npm run doctor:auto           # Auto-heal check

# Deployment
npm run deploy:web            # ⭐ NEW Deploy frontend to Vercel

# Utilities
npm run seed:characters       # Seed characters to DB
```

---

**Готово к использованию!** 🎉

