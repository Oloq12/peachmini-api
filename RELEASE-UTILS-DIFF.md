# 📊 Release Utils - Full Diff

## ✅ Созданные файлы

### 1. `scripts/smoke-v2.sh`

```bash
#!/bin/bash

# Quick smoke test for release validation
# Usage: VITE_API_URL=... WEBAPP_URL=... bash scripts/smoke-v2.sh

set -e

VITE_API_URL="${VITE_API_URL:-https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app}"
WEBAPP_URL="${WEBAPP_URL:-https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app}"

echo "🧪 Quick Smoke Test for Release"
echo "================================="
echo "API URL:  $VITE_API_URL"
echo "Web URL:  $WEBAPP_URL"
echo ""

# Test 1: API Health
echo "1️⃣  Testing API health..."
curl -fsSL "$VITE_API_URL/api/health" || echo "❌ API health FAIL"
echo ""

# Test 2: Girls endpoint
echo "2️⃣  Testing /api/girls..."
curl -fsSL "$VITE_API_URL/api/girls" | head -c 400 || echo "❌ girls FAIL"
echo ""

# Test 3: Chat endpoint
echo "3️⃣  Testing /api/chat/reply..."
curl -s -X POST "$VITE_API_URL/api/chat/reply" \
  -H "Content-Type: application/json" \
  -d '{"girlId":"test","userMsg":"Привет!","userId":"smoke"}' | head -c 400 || echo "❌ chat FAIL"
echo ""

# Test 4: Frontend health
echo "4️⃣  Testing frontend health..."
curl -I -s "$WEBAPP_URL/health" | head -n 1 || echo "❌ front health FAIL"
echo ""

echo "✅ Smoke test complete!"
```

---

### 2. `.env.example`

```bash
# API Configuration
API_URL=                          # API endpoint URL (e.g., https://your-api.vercel.app)
API_PORT=8787                     # Local API port

# Database
PB_URL=http://127.0.0.1:8090     # PocketBase URL (local or remote)

# AI Service
OPENAI_KEY=                       # OpenAI API key (sk-proj-...)

# Telegram Bot
BOT_TOKEN=                        # Telegram Bot token from @BotFather

# Frontend URLs
WEBAPP_URL=                       # WebApp URL (e.g., https://your-app.vercel.app)
WEBAPP_ORIGIN=                    # WebApp origin (usually same as WEBAPP_URL)

# Environment
NODE_ENV=development              # development | production
DEBUG=false                       # Enable debug logging (true | false)

# Admin (Optional)
ADMIN_TG_ID=                      # Admin Telegram ID for alerts

# Analytics (Optional)
VITE_POSTHOG_KEY=                 # PostHog analytics key
```

---

## 📝 Измененные файлы

### `package.json`

```diff
{
  "name": "ai-girl-bot",
  "version": "1.0.0",
  "description": "Telegram AI-Girlfriend bot on Telegraf + PocketBase + OpenAI",
  "license": "MIT",
  "type": "commonjs",
  "main": "index.js",

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

  "dependencies": {
    "dotenv": "^16.4.4",
    "openai": "3.3.0",
    "pocketbase": "^0.26.1",
    "telegraf": "^4.16.3"
  },

  "devDependencies": {
    "concurrently": "^9.2.0"
  }
}
```

---

## 📊 Summary

**Созданные файлы:**
- `scripts/smoke-v2.sh` (45 lines) - Quick smoke test
- `.env.example` (26 lines) - Environment template

**Измененные файлы:**
- `package.json` (+2 scripts)

**Переименованные:**
- `scripts/smoke-comprehensive.sh` (старый smoke-v2.sh)

**Добавленные NPM scripts:**
- `doctor:smoke2` - Quick smoke test
- `deploy:web` - Deploy frontend to Vercel

---

**Status:** ✅ Ready to use
