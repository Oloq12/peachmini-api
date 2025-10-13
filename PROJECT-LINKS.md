# 🔗 Peachmini - Project Links

## Дата: 2025-10-13

---

## 🌐 Production URLs

### Frontend
```
https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app
```

### API
```
https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app
```

### Telegram Bot
```
@Amourath_ai_bot
https://t.me/Amourath_ai_bot
```

---

## 📡 API Endpoints

### Base URL
```
https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app
```

### Key Endpoints

**Characters:**
```
GET  /api/girls?limit=24&page=1
GET  /api/girls/:slug
POST /api/girls
```

**Chat:**
```
POST /api/chat/reply
```

**Payments:**
```
GET  /api/payments/packages
POST /api/payments/createInvoice
POST /api/payments/check
POST /api/payments/webhook
```

**Referrals:**
```
GET  /api/ref/status?tgId=123
POST /api/ref/apply
```

**Quests:**
```
GET  /api/quests/status?tgId=123
POST /api/quests/complete
```

**Monitoring:**
```
GET /api/health
GET /api/heartbeat/check
GET /api/status
```

---

## 🔧 Development URLs

### Local Frontend
```
http://localhost:5173
```

### Local API
```
http://localhost:8787
```

### PocketBase Admin
```
http://127.0.0.1:8090/_/
```

---

## 📊 External Services

### Analytics
**PostHog:**
```
https://app.posthog.com
Project: Peachmini
```

**Umami (Alternative):**
```
https://umami.is
```

### Monitoring
**GitHub Actions:**
```
https://github.com/yourusername/peach-mini/actions
```

**Vercel Dashboard:**
```
https://vercel.com/dashboard
Project: peach-mini
```

**UptimeRobot (Recommended):**
```
https://uptimerobot.com
Monitor: Peachmini API
```

---

## 🤖 Telegram Bot Setup

### @BotFather Links

**Bot Settings:**
```
https://t.me/BotFather
Commands:
  /setinvoice → Enable Stars payments
  /setcommands → Set bot commands
  /setdescription → Set description
```

**Other Bots:**
```
@userinfobot - Get your Telegram ID
@uptimerobot_bot - Setup uptime monitoring
```

---

## 📦 Deployment Dashboards

### Vercel
**Main Dashboard:**
```
https://vercel.com/dashboard
```

**Project Settings:**
```
https://vercel.com/yourusername/peach-mini/settings
```

**Environment Variables:**
```
https://vercel.com/yourusername/peach-mini/settings/environment-variables
```

**Logs:**
```
https://vercel.com/yourusername/peach-mini/logs
```

### Render (PocketBase)
**Dashboard:**
```
https://dashboard.render.com
```

**PocketBase Service:**
```
https://dashboard.render.com/web/your-service-id
```

### Railway (Alternative)
**Dashboard:**
```
https://railway.app/dashboard
```

---

## 🧪 Testing Links

### Smoke Tests

**Local:**
```bash
npm run doctor:smoke
npm run doctor:payments
npm run doctor:auto
```

**Production:**
```bash
API_URL=https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app npm run doctor:smoke
```

---

## 📚 Documentation Links

### Main Docs
- [README.md](README.md) - Project overview
- [landing.md](landing.md) - Marketing page
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide

### Technical
- [API-SYSTEM-IMPLEMENTED.md](API-SYSTEM-IMPLEMENTED.md)
- [PAYMENTS-PRODUCTION-SETUP.md](PAYMENTS-PRODUCTION-SETUP.md)
- [AUTO-HEAL-QUICK.md](AUTO-HEAL-QUICK.md)
- [ANALYTICS-EVENTS.md](ANALYTICS-EVENTS.md)

### Setup Guides
- [ENV_GUIDE.md](ENV_GUIDE.md)
- [BOTFATHER-PAYMENTS-SETUP.md](BOTFATHER-PAYMENTS-SETUP.md)
- [HEARTBEAT-QUICK-START.md](HEARTBEAT-QUICK-START.md)

### Checklists
- [FINAL-CHECKLIST.md](FINAL-CHECKLIST.md)

---

## 🔑 Quick Access Commands

### Deploy
```bash
npx vercel --prod --yes
```

### Test API
```bash
curl https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health
```

### Check Logs
```bash
npx vercel logs production
```

### Set Env Var
```bash
vercel env add KEY_NAME production
```

---

## 📱 Telegram Bot Commands

### User Commands
```
/start - Start bot
/store - Buy PeachPoints
/ref - Referral program
/help - Get help
```

### Admin Commands (if configured)
```
/stats - View statistics
/broadcast - Send message to all users
```

---

## 🌐 Social Media

### Official Channels
- **Telegram Channel:** [@peachmini_news](https://t.me/peachmini_news)
- **Twitter:** [@peachmini](https://twitter.com/peachmini)
- **Discord:** [discord.gg/peachmini](https://discord.gg/peachmini)

### GitHub
- **Repository:** [github.com/yourusername/peach-mini](https://github.com/yourusername/peach-mini)
- **Issues:** [github.com/yourusername/peach-mini/issues](https://github.com/yourusername/peach-mini/issues)
- **Actions:** [github.com/yourusername/peach-mini/actions](https://github.com/yourusername/peach-mini/actions)

---

## 📧 Contact

### Support
- **Email:** support@peachmini.app
- **Telegram:** [@peachmini_support](https://t.me/peachmini_support)

### Business
- **Partnerships:** partnerships@peachmini.app
- **Press:** press@peachmini.app
- **Enterprise:** enterprise@peachmini.app

---

## 🔄 Update URLs

**Note:** После deploy на Vercel, обновите следующие файлы с актуальными URL:

```bash
# Files to update:
- bot/.env → API_URL
- peach-web/.env → VITE_API_URL
- scripts/smoke.sh → API_URL, FRONT_URL
- .github/workflows/*.yml → API URLs
```

---

**Last Updated:** 2025-10-13

**Version:** 1.0.0

