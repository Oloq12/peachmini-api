# 💓 Heartbeat Monitoring - README

Система автоматического мониторинга API с уведомлениями в Telegram.

---

## 🎯 Что это делает

- ✅ **Ping каждые 5 минут** → `/api/health`
- ✅ **Проверка здоровья** → `/api/heartbeat/check`
- ✅ **Telegram alert** → если API не отвечает >15 минут

---

## ⚡ Quick Start (3 шага)

### 1. Узнать свой Telegram ID
```
Открыть: @userinfobot
Отправить: /start
Скопировать: Id: 123456789
```

### 2. Добавить в Vercel
```
Vercel Dashboard → Settings → Environment Variables

ADMIN_TG_ID = 123456789
```

### 3. Deploy
```bash
npx vercel --prod --yes
```

**Готово!** ✅ Monitoring работает автоматически.

---

## 📊 Monitoring Options

### Vercel Cron (Рекомендуется)
- Pro Plan только ($20/month)
- Автоматически активен после deploy
- Status: ✅ Настроено

### GitHub Actions (Free)
- Push код на GitHub
- Settings → Actions → Allow all
- Status: ✅ Готово

### UptimeRobot (Free)
- uptimerobot.com
- Add Monitor: /api/health
- Status: Manual setup

---

## 🧪 Test

```bash
# Health check
curl https://your-api.vercel.app/api/health

# Heartbeat
curl https://your-api.vercel.app/api/heartbeat/check

# All tests
npm run doctor:smoke
```

---

## 📖 Documentation

- **HEARTBEAT-QUICK-START.md** - Быстрый старт
- **HEARTBEAT-SETUP.md** - Полная документация
- **HEARTBEAT-SUMMARY.md** - Краткая сводка

---

## ⚙️ Configuration

```bash
# Required
ADMIN_TG_ID=123456789

# Optional (defaults)
# HEARTBEAT_TIMEOUT=900000  # 15 minutes
```

---

## 🔔 Alert Example

```
🚨 HEARTBEAT ALERT

⚠️ API не отвечает 17 минут!
🕐 Последний health check: 13.10.2025, 14:30:00

Проверьте статус сервера:
https://vercel.com/dashboard
```

---

**Status:** ✅ Ready for production

**Date:** 2025-10-13

