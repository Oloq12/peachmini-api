# 💓 Heartbeat Monitor - Complete Summary

**Дата:** 2025-10-13  
**Статус:** ✅ Ready to deploy

---

## 🎯 Что создано

### 1. GitHub Actions Workflow
**Файл:** `.github/workflows/heartbeat.yml`

**Возможности:**
- ⏰ Автоматическая проверка каждые 5 минут (`cron: "*/5 * * * *"`)
- 🔧 Ручной запуск через `workflow_dispatch`
- 🔍 Проверка API health endpoint
- 🌐 Проверка Frontend доступности
- 📱 Telegram уведомления при падении
- ❌ Job failure при ошибках (видимость в GitHub Actions)

---

## 🔍 Мониторинг

### API Health Check
```bash
URL: https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health
Method: curl -fsSL
Frequency: Every 5 minutes
Expected: HTTP 200 + JSON response
```

### Frontend Health Check
```bash
URL: https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app
Method: curl -fsSL -I (headers check)
Frequency: Every 5 minutes
Expected: HTTP 200 OK in headers
```

---

## 📱 Telegram Alerts

### API Down Alert
```
🚨 Peachmini API DOWN

⏰ Time: 2025-10-13 12:00:00 UTC
🔗 URL: https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

❌ Health check failed
```

### Frontend Down Alert
```
🚨 Peachmini Frontend DOWN

⏰ Time: 2025-10-13 12:00:00 UTC
🔗 URL: https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app

❌ Health check failed
```

### Success Alert (Manual Run Only)
```
✅ Peachmini Health Check

⏰ Time: 2025-10-13 12:00:00 UTC

✅ API: UP
✅ Frontend: UP

🎉 All systems operational!
```

---

## ⚙️ Setup Requirements

### GitHub Secrets
Необходимо добавить в **Settings → Secrets → Actions**:

1. **`BOT_TOKEN`**
   - Получить от @BotFather
   - Формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

2. **`ADMIN_TG_ID`**
   - Получить от @userinfobot
   - Формат: `123456789`

### GitHub Actions
Включить в **Settings → Actions → General**:
- ✅ Allow all actions and reusable workflows

---

## 📋 Setup Steps

### Step 1: Add Secrets
```
GitHub → Settings → Secrets and variables → Actions
→ New repository secret

Secret 1:
  Name:  BOT_TOKEN
  Value: (токен от @BotFather)

Secret 2:
  Name:  ADMIN_TG_ID
  Value: (твой ID от @userinfobot)
```

### Step 2: Enable Actions
```
GitHub → Settings → Actions → General
→ ✅ Allow all actions and reusable workflows
→ Save
```

### Step 3: Test Run
```
GitHub → Actions → Heartbeat Monitor
→ Run workflow
→ Select branch: main
→ Run workflow
→ Check Telegram for alert
```

---

## 📊 Workflow Logic

```yaml
jobs:
  ping:
    steps:
      1. Check API Health (continue-on-error: true)
         → if success: api_status=success
         → if failed: api_status=failed
      
      2. Check Frontend Health (continue-on-error: true)
         → if success: front_status=success
         → if failed: front_status=failed
      
      3. If API failed → Send Telegram alert
      4. If Frontend failed → Send Telegram alert
      5. If both success + manual run → Send success alert
      6. If any failed → Fail job (exit 1)
```

---

## 🧪 Testing

### Local Tests
```bash
# Test API
curl -fsSL https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

# Test Frontend
curl -fsSL -I https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app
```

### Manual Workflow Run
```
1. Go to Actions tab
2. Select "Heartbeat Monitor"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button
6. Wait 10-20 seconds
7. Check Telegram for notification
```

### Check Logs
```
GitHub → Actions → Heartbeat Monitor → Latest run
→ Click on job "ping"
→ Expand steps to see logs
```

---

## 📁 Created Files

1. **`.github/workflows/heartbeat.yml`**
   - Main workflow file
   - Cron schedule + manual dispatch
   - Health checks + Telegram notifications

2. **`HEARTBEAT-SETUP.md`**
   - Complete setup guide
   - Troubleshooting section
   - Best practices
   - Advanced monitoring options

3. **`HEARTBEAT-QUICK.md`**
   - Quick reference guide
   - 2-minute setup
   - Common commands

4. **`GITHUB-SECRETS-SETUP.md`**
   - Step-by-step secrets setup
   - Where to get BOT_TOKEN
   - Where to get ADMIN_TG_ID
   - Screenshots and examples

5. **`HEARTBEAT-MONITOR-SUMMARY.md`** (this file)
   - Complete summary
   - All information in one place

---

## ✅ Checklist

### Setup
- [ ] Получен BOT_TOKEN от @BotFather
- [ ] Получен ADMIN_TG_ID от @userinfobot
- [ ] Добавлен secret BOT_TOKEN в GitHub
- [ ] Добавлен secret ADMIN_TG_ID в GitHub
- [ ] Включены GitHub Actions
- [ ] Запущен workflow вручную
- [ ] Получено Telegram уведомление
- [ ] Проверены логи в GitHub Actions

### Verification
- [ ] Workflow показывает success/failure
- [ ] API health check работает
- [ ] Frontend health check работает
- [ ] Telegram alerts приходят при падении
- [ ] Job падает при ошибке (видно в Actions)
- [ ] Автоматический запуск работает (подождать 5 мин)

---

## 🔧 Troubleshooting

### Issue: Workflow не запускается автоматически

**Причина:** GitHub Actions отключены

**Решение:**
```
Settings → Actions → General
→ ✅ Allow all actions
→ Save
```

---

### Issue: Не приходят Telegram уведомления

**Причина 1:** Неверный BOT_TOKEN

**Решение:**
```
1. Проверь токен от @BotFather
2. Обнови secret в GitHub
3. Пере-запусти workflow
```

**Причина 2:** Неверный ADMIN_TG_ID

**Решение:**
```
1. Получи ID от @userinfobot
2. Обнови secret в GitHub
3. Отправь /start боту
4. Пере-запусти workflow
```

---

### Issue: Workflow падает с ошибкой 401 Unauthorized

**Причина:** Неверный или истёкший BOT_TOKEN

**Решение:**
```
1. Получи новый токен от @BotFather
2. Обнови secret BOT_TOKEN
3. Пере-запусти workflow
```

---

### Issue: False positives (ложные срабатывания)

**Причина:** Временные сбои сети

**Решение:** Добавить retry в workflow
```yaml
- name: Check API with Retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 1
    max_attempts: 3
    command: curl -fsSL https://...
```

---

## 📈 Advanced Features

### Add Response Time Monitoring
```yaml
- name: Check Response Time
  run: |
    START=$(date +%s%N)
    curl -fsSL https://...
    END=$(date +%s%N)
    DIFF=$(( ($END - $START) / 1000000 ))
    echo "Response time: ${DIFF}ms"
    
    if [ $DIFF -gt 3000 ]; then
      # Send slow response alert
    fi
```

### Add Status Badge to README
```markdown
![Heartbeat](https://github.com/yourusername/peach-mini/workflows/Heartbeat%20Monitor/badge.svg)
```

### Add Slack Notifications
```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🔗 Useful Links

### Telegram Bots
- [@BotFather](https://t.me/BotFather) - Get BOT_TOKEN
- [@userinfobot](https://t.me/userinfobot) - Get your Telegram ID

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Cron Syntax](https://crontab.guru/)

### Alternative Monitoring Services
- [UptimeRobot](https://uptimerobot.com) - Free monitoring
- [Pingdom](https://www.pingdom.com) - Advanced monitoring
- [Better Uptime](https://betteruptime.com) - Status pages

---

## 📊 Statistics

### Created
- Files: 5 (1 workflow + 4 docs)
- Lines of code: ~120 (workflow YAML)
- Lines of docs: ~1000+

### Monitoring
- Frequency: Every 5 minutes
- Endpoints: 2 (API + Frontend)
- Alerts: Telegram (on failure)
- Manual run: Yes (workflow_dispatch)

---

## 🎯 Next Steps

### Immediate
1. ✅ Setup GitHub Secrets
2. ✅ Test manual run
3. ✅ Verify Telegram alerts
4. ✅ Wait for auto-run (5 min)

### Future Enhancements
- [ ] Add response time monitoring
- [ ] Add retry logic for transient failures
- [ ] Add status badge to README
- [ ] Add Slack/Discord notifications
- [ ] Add custom metrics collection
- [ ] Set up UptimeRobot as backup

---

## 📝 Quick Commands

### Get Telegram IDs
```bash
# Your ID
1. Open @userinfobot
2. Send /start
3. Copy your ID

# Bot Token
1. Open @BotFather
2. /mybots → Your Bot → API Token
3. Copy token
```

### Test Locally
```bash
# API
curl -fsSL https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

# Frontend
curl -I https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app

# Send test Telegram message
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<ID>" \
  -d "text=Test message"
```

### Check Workflow Status
```bash
# Via GitHub CLI
gh run list --workflow=heartbeat.yml

# Via API
curl https://api.github.com/repos/yourusername/peach-mini/actions/workflows
```

---

## ✅ Summary

**Создано:** GitHub Actions workflow для мониторинга API и Frontend

**Функции:**
- ⏰ Автоматическая проверка каждые 5 минут
- 📱 Telegram уведомления при падении
- 🔧 Ручной запуск для тестирования
- 📊 Видимость статуса в GitHub Actions

**Требования:**
- GitHub Secrets: BOT_TOKEN, ADMIN_TG_ID
- GitHub Actions: Enabled

**Документация:**
- HEARTBEAT-SETUP.md - Полная инструкция
- HEARTBEAT-QUICK.md - Quick reference
- GITHUB-SECRETS-SETUP.md - Secrets setup
- HEARTBEAT-MONITOR-SUMMARY.md - This file

---

**Статус:** ✅ Ready to deploy  
**Следующий шаг:** Setup GitHub Secrets → Test run  
**Дата:** 2025-10-13

