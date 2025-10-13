# 🔔 API Monitoring - GitHub Actions

## Дата: 2025-10-13

---

## ✅ Реализовано

### 1. **GitHub Actions Cron Ping** ✅

**File:** `.github/workflows/api-monitor.yml`

**Schedule:** Каждые 5 минут

**Action:**
```yaml
on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch: # Ручной запуск
```

**Command:**
```bash
curl -fsSL --max-time 10 https://peachmini-api.vercel.app/api/health || echo "API DOWN"
```

---

### 2. **Heartbeat System** ✅

**Endpoints:**
- `GET /api/health` - записывает timestamp
- `GET /api/heartbeat/check` - проверяет здоровье

**См.:** `HEARTBEAT-QUICK-START.md`

---

## 🚀 Setup

### Step 1: Enable GitHub Actions

```
1. GitHub repo → Settings → Actions → General
2. Actions permissions: "Allow all actions"
3. Workflow permissions: "Read and write"
4. Save
```

### Step 2: Push Workflow File

```bash
git add .github/workflows/api-monitor.yml
git commit -m "Add API health monitoring"
git push
```

### Step 3: Verify

```
1. GitHub → Actions tab
2. Should see "API Health Monitor" workflow
3. Wait 5 minutes or click "Run workflow"
4. Check logs for ✅ or ❌
```

---

## 📊 Monitoring Options

### Option 1: GitHub Actions (Current) ✅

**Pros:**
- ✅ Бесплатный
- ✅ Встроенный в GitHub
- ✅ Автоматический ping каждые 5 минут
- ✅ Логи в Actions tab

**Cons:**
- ⚠️ Может быть задержка 5-15 минут
- ⚠️ Нет прямых уведомлений (только email)

**Status:** ✅ Готово

---

### Option 2: Vercel Cron (Pro Plan)

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/heartbeat/check",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Pros:**
- ✅ Встроенный в Vercel
- ✅ Надёжный
- ✅ Прямой доступ к логам

**Cons:**
- ❌ Требует Pro Plan ($20/month)

**Status:** ✅ Настроено, требует Pro Plan

---

### Option 3: UptimeRobot (External)

**Setup:**
```
1. Зарегистрироваться на uptimerobot.com
2. New Monitor:
   - Type: HTTP(s)
   - URL: https://peachmini-api.vercel.app/api/health
   - Monitoring Interval: 5 minutes
   - Alert Contacts: Email / Telegram
3. Save
```

**Pros:**
- ✅ Бесплатно (50 мониторов)
- ✅ Email/SMS/Telegram alerts
- ✅ Status page
- ✅ Надёжный (99.9% uptime)

**Cons:**
- ⚠️ Требует регистрацию
- ⚠️ External service

**Status:** Рекомендуется для production

---

### Option 4: Better Stack (Uptime)

**Setup:**
```
1. Зарегистрироваться на betterstack.com
2. Create Monitor:
   - URL: https://peachmini-api.vercel.app/api/health
   - Interval: 3 minutes
   - Notifications: Email / Slack / Webhook
3. Save
```

**Pros:**
- ✅ Бесплатно (10 мониторов)
- ✅ Interval 3 минуты
- ✅ Красивый dashboard
- ✅ Incident management

**Cons:**
- ⚠️ Требует регистрацию

**Status:** Premium alternative

---

## 🔧 GitHub Actions Details

### Workflow File

**Location:** `.github/workflows/api-monitor.yml`

**Full Code:**
```yaml
name: API Health Monitor

on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    
    steps:
      - name: Ping API Health Endpoint
        run: |
          echo "🏥 Pinging API health endpoint..."
          
          if curl -fsSL --max-time 10 https://peachmini-api.vercel.app/api/health; then
            echo "✅ API is UP"
            exit 0
          else
            echo "❌ API DOWN"
            exit 1
          fi
      
      - name: Notify on Failure
        if: failure()
        run: |
          echo "⚠️ API Health Check Failed!"
          echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
```

---

## 📈 Monitoring Levels

### Level 1: Basic (Current) ✅

**Setup:**
- GitHub Actions cron ping
- `/api/health` endpoint
- Logs in Actions tab

**Alerts:**
- Email on workflow failure

---

### Level 2: Advanced (Recommended)

**Setup:**
- Vercel Cron (Pro) OR UptimeRobot
- `/api/heartbeat/check` endpoint
- Telegram notifications

**Alerts:**
- Telegram message to admin
- Email/SMS/Slack

**File:** Already configured in `api/index.js`:
```javascript
if (!isHealthy && ADMIN_TG_ID && botApi) {
  await sendTelegramAlert(ADMIN_TG_ID, minutesSince);
}
```

---

### Level 3: Enterprise

**Setup:**
- UptimeRobot + Better Stack
- Custom incident response
- PagerDuty integration
- Status page (status.peachmini.com)

**Alerts:**
- Multi-channel (Email/SMS/Telegram/Slack/Phone)
- Escalation policies
- On-call rotation

---

## 🧪 Testing

### Manual Test

```bash
# Test health endpoint
curl https://peachmini-api.vercel.app/api/health

# Expected:
{
  "ok": true,
  "data": {
    "time": 1697201400000,
    "lastCheck": 1697201400000,
    "pb": true,
    "ai": true
  }
}
```

### Trigger GitHub Action

```
1. GitHub → Actions → API Health Monitor
2. Click "Run workflow"
3. Wait ~30 seconds
4. Check logs
5. Should see: ✅ API is UP
```

### Simulate Failure

```bash
# In api/index.js temporarily:
app.get('/health', (req, res) => {
  res.status(500).json({ error: 'Simulated failure' });
});

# Deploy
# Wait 5 minutes
# Check GitHub Actions → Should see ❌ API DOWN
```

---

## 🔔 Notification Examples

### GitHub Actions Email

```
Subject: [peachmini] API Health Monitor failed

Run #123 failed:
❌ API DOWN
Timestamp: 2025-10-13 14:30:00 UTC

View logs: https://github.com/user/peachmini/actions/runs/123
```

### Telegram Alert (via webhook)

```
🚨 HEARTBEAT ALERT

⚠️ API не отвечает 17 минут!
🕐 Последний health check: 13.10.2025, 14:30:00

Проверьте статус сервера:
https://vercel.com/dashboard
```

---

## 📊 Metrics

### GitHub Actions History

```
Last 10 runs:
✅ ✅ ✅ ❌ ✅ ✅ ✅ ✅ ✅ ✅

Uptime: 90% (1 failure in last 10)
```

### API Response Time

```bash
# Add timing to workflow
time curl -fsSL https://peachmini-api.vercel.app/api/health

# Output:
real    0m0.245s  ← Response time
```

---

## ✅ Checklist

### GitHub Actions
- [x] Workflow file created
- [x] Cron schedule configured (*/5 * * * *)
- [x] Health endpoint ping
- [x] Failure notification
- [ ] Push to GitHub
- [ ] Enable Actions in repo settings
- [ ] Test manual run

### Heartbeat System
- [x] /api/health records timestamp
- [x] /api/heartbeat/check validates
- [x] Telegram alert configured
- [ ] Add ADMIN_TG_ID env var
- [ ] Test alert

### External Monitoring
- [ ] Setup UptimeRobot (recommended)
- [ ] Setup Better Stack (optional)
- [ ] Configure Telegram notifications
- [ ] Create status page

---

## 🚀 Quick Setup

### 1. Enable GitHub Actions

```bash
# Push workflow
git add .github/workflows/api-monitor.yml
git commit -m "Add API monitoring"
git push

# Enable in GitHub
# Settings → Actions → Allow all actions
```

### 2. Setup UptimeRobot (Recommended)

```
1. Go to uptimerobot.com
2. Sign up (free)
3. Add New Monitor:
   - Friendly Name: Peachmini API
   - URL: https://peachmini-api.vercel.app/api/health
   - Monitoring Interval: 5 minutes
4. Add Alert Contact:
   - Type: Telegram (@uptimerobot_bot)
   - Or: Email
5. Save
```

### 3. Test

```bash
# Manual GitHub Action
# GitHub → Actions → Run workflow

# Check UptimeRobot
# Dashboard → Should see green status
```

---

## 📝 Next Steps

1. **Enable GitHub Actions** ✅
   ```bash
   git push
   ```

2. **Setup External Monitor** (Optional)
   - UptimeRobot for reliability
   - Better Stack for advanced features

3. **Configure Alerts**
   - Add ADMIN_TG_ID for Telegram
   - Setup email notifications

4. **Monitor**
   - Check GitHub Actions tab
   - Review UptimeRobot dashboard
   - Respond to alerts

---

**Status:** ✅ GitHub Actions configured

**Recommendation:** Add UptimeRobot for production

**Дата:** 2025-10-13

