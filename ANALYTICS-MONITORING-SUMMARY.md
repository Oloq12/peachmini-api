# 📊 Analytics & Monitoring - Summary

## Дата: 2025-10-13

---

## ✅ PostHog Events (Frontend)

### Implemented Events

1. **open_app** ✅
   - **Где:** `main.jsx`
   - **Когда:** App opens
   - **Props:** `{ platform, version, userId }`

2. **view_home** ✅
   - **Где:** `Home.jsx`
   - **Когда:** Home page view
   - **Props:** None

3. **start_chat** ✅
   - **Где:** `Character.jsx`
   - **Когда:** Chat started
   - **Props:** `{ slug, name }`

4. **create_persona** ✅
   - **Где:** `InspiredTab.jsx`
   - **Когда:** Character created
   - **Props:** `{ origin, name }`

5. **complete_payment** ✅
   - **Где:** `Store.jsx`
   - **Когда:** Payment successful
   - **Props:** `{ packId, amount, stars, balance }`

### Bonus Events

- **send_message** (ChatScreen.jsx)
- **open_persona** (Character.jsx)
- **purchase_attempt** (Store.jsx)
- **quest_completed** (Quests.jsx)
- **quest_claimed** (Quests.jsx)

---

## 🔔 API Monitoring

### GitHub Actions Cron ✅

**File:** `.github/workflows/api-monitor.yml`

**Schedule:** `*/5 * * * *` (every 5 minutes)

**Action:**
```bash
curl -fsSL --max-time 10 https://peachmini-api.vercel.app/api/health
```

**On Success:** ✅ API is UP

**On Failure:** ❌ API DOWN + email notification

---

## 🚀 Setup

### PostHog Analytics

```bash
# 1. Get API key from posthog.com
# 2. Add to .env
echo "VITE_POSTHOG_KEY=phc_..." >> peach-web/.env

# 3. Build & deploy
cd peach-web && npm run build
cd .. && npx vercel --prod --yes
```

### GitHub Actions

```bash
# 1. Push workflow
git add .github/workflows/api-monitor.yml
git commit -m "Add API monitoring"
git push

# 2. Enable in GitHub
# Settings → Actions → Allow all actions

# 3. Test
# Actions → API Health Monitor → Run workflow
```

---

## 📊 Event Flow Examples

### User Journey
```
open_app
  ↓
view_home
  ↓
open_persona (slug: 'alice-abc')
  ↓
start_chat (slug: 'alice-abc')
  ↓
send_message (characterId: '1')
```

### Purchase Flow
```
view_home
  ↓
purchase_attempt (packId: 'small')
  ↓
complete_payment (amount: 300, stars: 300, balance: 1300)
```

### Creation Flow
```
view_home
  ↓
create_persona (origin: 'INSPIRED', name: 'Мила')
  ↓
start_chat (slug: 'mila-xyz')
```

---

## 📁 Modified Files

```
✅ peach-web/src/pages/Store.jsx          - Added complete_payment event
✅ .github/workflows/api-monitor.yml       - New (cron ping)
✅ ANALYTICS-EVENTS.md                     - New (events docs)
✅ API-MONITORING-SETUP.md                 - New (monitoring docs)
✅ ANALYTICS-MONITORING-SUMMARY.md         - This file
```

---

## 🔧 Key Code Changes

### Store.jsx - complete_payment
```javascript
if (checkResult.ok && checkResult.data?.credited) {
  track('complete_payment', {
    packId: pack.id,
    amount: pack.amount,
    stars: pack.stars,
    balance: checkResult.data.balance
  });
  
  toast.success(`✅ Оплата успешна! +${pack.amount}💎`);
}
```

### api-monitor.yml - Cron ping
```yaml
on:
  schedule:
    - cron: '*/5 * * * *'

jobs:
  ping:
    steps:
      - run: curl -fsSL https://peachmini-api.vercel.app/api/health
```

---

## 📈 Metrics Available

### User Engagement
- **DAU:** `open_app` unique users per day
- **Retention:** `open_app` returning users
- **Chat Activity:** `send_message` per user
- **Character Views:** `open_persona` by slug

### Revenue
- **Conversion Rate:** `complete_payment` / `purchase_attempt`
- **Revenue:** Sum of `complete_payment.amount`
- **ARPU:** Revenue / unique users

### Content
- **Character Creation:** `create_persona` count
- **Popular Characters:** `open_persona` by slug
- **Quest Completion:** `quest_completed` rate

---

## 🎯 PostHog Dashboard Queries

### Top Events (Last 7 Days)
```sql
SELECT event, count(*) as count
FROM events
WHERE timestamp > now() - interval 7 days
GROUP BY event
ORDER BY count DESC
```

### Conversion Funnel
```
view_home (100%)
  ↓ 60%
open_persona
  ↓ 40%
start_chat
  ↓ 35%
send_message
```

### Purchase Conversion
```
purchase_attempt (100%)
  ↓ 60%
complete_payment
```

---

## ✅ Checklist

### Analytics
- [x] All 5 required events implemented
- [x] PostHog integration code ready
- [ ] Get PostHog API key
- [ ] Add VITE_POSTHOG_KEY to env
- [ ] Deploy frontend
- [ ] Test events in dashboard

### Monitoring
- [x] GitHub Actions workflow created
- [x] Cron schedule configured
- [ ] Push to GitHub
- [ ] Enable Actions in repo
- [ ] Test manual run
- [ ] Setup UptimeRobot (optional)

---

## 🚀 Quick Commands

```bash
# Build frontend
cd peach-web && npm run build

# Deploy
npx vercel --prod --yes

# Push monitoring
git add .github/workflows/api-monitor.yml
git push

# Test GitHub Action
# GitHub → Actions → Run workflow

# Test analytics (browser console)
track('test_event', { foo: 'bar' })
```

---

## 📝 Next Steps

1. **Get PostHog Key**
   ```
   posthog.com → Create Project → Copy API key
   ```

2. **Add to Vercel**
   ```bash
   vercel env add VITE_POSTHOG_KEY production
   ```

3. **Deploy**
   ```bash
   npx vercel --prod --yes
   ```

4. **Enable GitHub Actions**
   ```bash
   git push
   # Settings → Actions → Enable
   ```

5. **Monitor**
   - PostHog dashboard for events
   - GitHub Actions for API health
   - UptimeRobot for uptime (optional)

---

**Status:** ✅ Code ready

**Build:** ✅ Success (631ms)

**Need:** PostHog API key + GitHub Actions enable

**Дата:** 2025-10-13

