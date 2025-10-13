# 💓 Heartbeat Monitor - Quick Reference

## ⚙️ Setup (2 минуты)

### 1. Add GitHub Secrets

**GitHub → Settings → Secrets → New repository secret**

```bash
BOT_TOKEN        # Токен от @BotFather
ADMIN_TG_ID      # Твой Telegram ID (@userinfobot)
```

### 2. Enable Actions

**GitHub → Settings → Actions → General**

✅ Allow all actions and reusable workflows

### 3. Test Run

**GitHub → Actions → Heartbeat Monitor → Run workflow**

---

## 📊 What's Monitored

| Service | URL | Frequency |
|---------|-----|-----------|
| **API** | https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health | Every 5 min |
| **Frontend** | https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app | Every 5 min |

---

## 📱 Telegram Alerts

### API DOWN
```
🚨 Peachmini API DOWN
⏰ Time: 2025-10-13 12:00:00 UTC
🔗 URL: https://...
❌ Health check failed
```

### Frontend DOWN
```
🚨 Peachmini Frontend DOWN
⏰ Time: 2025-10-13 12:00:00 UTC
🔗 URL: https://...
❌ Health check failed
```

### Manual Test (Success)
```
✅ Peachmini Health Check
⏰ Time: 2025-10-13 12:00:00 UTC
✅ API: UP
✅ Frontend: UP
🎉 All systems operational!
```

---

## 🔍 Check Status

### GitHub
```
GitHub → Actions → Heartbeat Monitor → Latest runs
```

### Local Test
```bash
# API
curl -fsSL https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

# Frontend
curl -I https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| No Telegram alerts | 1. Check BOT_TOKEN secret<br>2. Check ADMIN_TG_ID secret<br>3. Send /start to bot |
| Workflow doesn't run | 1. Enable Actions in Settings<br>2. Check cron syntax |
| False positives | Add retry logic (see full guide) |

---

## 📁 Files

- **Workflow:** `.github/workflows/heartbeat.yml`
- **Setup Guide:** [HEARTBEAT-SETUP.md](HEARTBEAT-SETUP.md)
- **Quick Ref:** This file

---

## ✅ Checklist

- [ ] GitHub Secrets added (BOT_TOKEN, ADMIN_TG_ID)
- [ ] GitHub Actions enabled
- [ ] Workflow tested manually
- [ ] Telegram alert received
- [ ] Auto-run verified (wait 5 min)

---

**Status:** ✅ Ready  
**Schedule:** Every 5 minutes  
**Alert:** Telegram (on failure)

