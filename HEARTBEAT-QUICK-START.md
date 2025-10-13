# ⚡ Heartbeat Monitoring - Quick Start

## Дата: 2025-10-13

---

## ✅ Что сделано

### API
- ✅ `/api/health` - записывает timestamp
- ✅ `/api/heartbeat/check` - проверяет здоровье + alert

### Cron Ping (каждые 5 минут)
- ✅ Vercel Cron (Pro Plan)
- ✅ GitHub Actions (Free)

### Telegram Alert
- ✅ Если >15 минут без ответа → уведомление админу

---

## 🚀 Setup (3 шага)

### 1. Узнать свой Telegram ID

```
Открыть: https://t.me/userinfobot
Отправить: /start
Скопировать: Id: 123456789
```

### 2. Добавить в Vercel

```bash
# Vercel Dashboard
Settings → Environment Variables → Add

Name: ADMIN_TG_ID
Value: 123456789  # Ваш ID
Scope: Production

# Также нужен BOT_TOKEN (если ещё не добавлен)
Name: BOT_TOKEN
Value: 1234567890:ABC...
```

### 3. Deploy

```bash
cd /Users/egor/Desktop/peach-mini
npx vercel --prod --yes
```

**Готово!** ✅

---

## 🧪 Test

```bash
# Test 1: Health check
curl https://your-api.vercel.app/api/health

# Test 2: Heartbeat
curl https://your-api.vercel.app/api/heartbeat/check

# Test 3: Smoke tests
npm run doctor:smoke
```

---

## 📊 Monitoring Options

### Option 1: Vercel Cron (Рекомендуется)

**Требует:** Vercel Pro Plan ($20/month)

**Настройка:**
- ✅ Автоматически активируется после deploy
- ✅ Конфигурация в `vercel.json`
- ✅ Логи: Vercel Dashboard → Crons

**Status:** ✅ Настроено в vercel.json

### Option 2: GitHub Actions (Free)

**Требует:** GitHub репозиторий

**Настройка:**
1. Push код на GitHub
2. Settings → Actions → Allow all actions
3. ✅ Готово! Workflow запустится автоматически

**Status:** ✅ Файл `.github/workflows/heartbeat.yml` создан

### Option 3: UptimeRobot (External, Free)

**Требует:** Регистрация на uptimerobot.com

**Настройка:**
1. Зарегистрироваться
2. Add Monitor: https://your-api.vercel.app/api/health
3. Interval: 5 minutes
4. Alert: Telegram (@uptimerobot_bot)

**Status:** Manual setup required

---

## 🔔 Alert Example

Когда API не отвечает >15 минут, админ получит:

```
🚨 HEARTBEAT ALERT

⚠️ API не отвечает 17 минут!
🕐 Последний health check: 13.10.2025, 14:30:00

Проверьте статус сервера:
https://vercel.com/dashboard
```

---

## 📋 Checklist

- [ ] ADMIN_TG_ID добавлен в Vercel
- [ ] BOT_TOKEN установлен
- [ ] Deploy выполнен
- [ ] Test: `/api/health` → 200
- [ ] Test: `/api/heartbeat/check` → healthy: true
- [ ] Выбран метод мониторинга:
  - [ ] Vercel Cron (Pro)
  - [ ] GitHub Actions (Free)
  - [ ] UptimeRobot (External)

---

## ⚙️ Customization

### Change alert threshold (15m → 10m)

**api/index.js:**
```javascript
const HEARTBEAT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

### Change ping interval (5m → 3m)

**vercel.json:**
```json
{
  "crons": [
    { "path": "/api/health", "schedule": "*/3 * * * *" }
  ]
}
```

**GitHub Actions (.github/workflows/heartbeat.yml):**
```yaml
on:
  schedule:
    - cron: '*/3 * * * *'
```

---

## 🚀 Quick Commands

```bash
# Deploy
npx vercel --prod --yes

# Test health
curl https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

# Test heartbeat
curl https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/heartbeat/check

# Run smoke tests
npm run doctor:smoke

# Check Vercel logs
npx vercel logs production

# Trigger GitHub Action manually
# GitHub → Actions → Heartbeat Monitor → Run workflow
```

---

**Статус:** ✅ Готово! Осталось только добавить ADMIN_TG_ID и задеплоить.

**Дата:** 2025-10-13

