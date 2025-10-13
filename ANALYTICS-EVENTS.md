# 📊 Analytics Events - PostHog/Umami

## Дата: 2025-10-13

---

## ✅ Реализованные события

### 1. **open_app** ✅

**Где:** `peach-web/src/main.jsx`

**Когда:** При открытии приложения

**Параметры:**
```javascript
{
  platform: 'ios' | 'android' | 'web',
  version: '7.0',
  userId: '123456789'
}
```

**Пример:**
```javascript
track('open_app', {
  platform: window.Telegram?.WebApp?.platform || 'web',
  version: window.Telegram?.WebApp?.version || 'unknown',
  userId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown'
});
```

---

### 2. **view_home** ✅

**Где:** `peach-web/src/pages/Home.jsx`

**Когда:** Открытие главной страницы

**Параметры:** Нет

**Пример:**
```javascript
track('view_home');
```

---

### 3. **start_chat** ✅

**Где:** `peach-web/src/pages/Character.jsx`

**Когда:** Начало чата с персонажем

**Параметры:**
```javascript
{
  slug: 'character-slug',
  name: 'Character Name'
}
```

**Пример:**
```javascript
track('start_chat', { 
  slug: character.slug, 
  name: character.name 
});
```

---

### 4. **create_persona** ✅

**Где:** `peach-web/src/components/create/InspiredTab.jsx`

**Когда:** Создание персонажа

**Параметры:**
```javascript
{
  origin: 'INSPIRED',
  name: 'Character Name'
}
```

**Пример:**
```javascript
track('create_persona', { 
  origin: 'INSPIRED',
  name: name 
});
```

---

### 5. **complete_payment** ✅

**Где:** `peach-web/src/pages/Store.jsx`

**Когда:** Успешная оплата Stars

**Параметры:**
```javascript
{
  packId: 'small' | 'medium' | 'large',
  amount: 300,
  stars: 300,
  balance: 1300
}
```

**Пример:**
```javascript
track('complete_payment', {
  packId: pack.id,
  amount: pack.amount,
  stars: pack.stars,
  balance: checkResult.data.balance
});
```

---

## 📋 Дополнительные события

### 6. **send_message** ✅

**Где:** `peach-web/src/components/chat/ChatScreen.jsx`

**Когда:** Отправка сообщения в чат

**Параметры:**
```javascript
{
  characterId: '1',
  characterName: 'Алиса',
  messageLength: 15
}
```

---

### 7. **open_persona** ✅

**Где:** `peach-web/src/pages/Character.jsx`

**Когда:** Открытие страницы персонажа

**Параметры:**
```javascript
{
  slug: 'character-slug',
  name: 'Character Name'
}
```

---

### 8. **purchase_attempt** ✅

**Где:** `peach-web/src/pages/Store.jsx`

**Когда:** Попытка покупки (до оплаты)

**Параметры:**
```javascript
{
  packId: 'small',
  points: 300,
  price: 300
}
```

---

### 9. **quest_completed** ✅

**Где:** `peach-web/src/pages/Quests.jsx`

**Когда:** Выполнение квеста

**Параметры:**
```javascript
{
  questKey: 'open_app',
  reward: 20
}
```

---

### 10. **quest_claimed** ✅

**Где:** `peach-web/src/pages/Quests.jsx`

**Когда:** Получение награды за квест

**Параметры:**
```javascript
{
  questKey: 'open_app',
  reward: 20
}
```

---

## 🔧 Setup PostHog

### 1. Получить API Key

```
1. Зарегистрироваться на posthog.com
2. Create Project
3. Copy API Key (phc_...)
```

### 2. Добавить в .env

```bash
# peach-web/.env
VITE_POSTHOG_KEY=phc_your_key_here
```

### 3. Deploy

```bash
cd peach-web
npm run build
cd ..
npx vercel --prod --yes
```

---

## 📊 Analytics Dashboard

### PostHog Insights

**1. User Journey:**
```
open_app → view_home → open_persona → start_chat → send_message
```

**2. Conversion Funnel:**
```
view_home (100%)
  ↓
open_persona (60%)
  ↓
start_chat (40%)
  ↓
send_message (35%)
```

**3. Revenue Analytics:**
```
purchase_attempt (50 users)
  ↓
complete_payment (30 users) = 60% conversion
```

### Key Metrics

- **DAU** (Daily Active Users): `open_app` count
- **Retention**: `open_app` by day
- **Engagement**: `send_message` per user
- **Revenue**: `complete_payment` sum(amount)
- **Character Popularity**: `open_persona` group by slug

---

## 🔍 Event Tracking Code

### Analytics Utility

**File:** `peach-web/src/utils/analytics.js`

```javascript
import posthog from 'posthog-js';

export function initAnalytics() {
  const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
  
  if (POSTHOG_KEY && POSTHOG_KEY.startsWith('phc_')) {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      autocapture: false,
      capture_pageview: false
    });
    console.log('✅ PostHog initialized');
  }
}

export function track(event, props = {}) {
  console.log(`📊 Analytics: ${event}`, props);
  
  if (window.posthog) {
    posthog.capture(event, props);
  }
  
  // Fallback: Umami or console
  if (window.umami) {
    window.umami.track(event, props);
  }
}
```

---

## 🧪 Testing Events

### Manual Test

```javascript
// В browser console
track('test_event', { foo: 'bar' });

// Check PostHog dashboard
// Events → Recent events → Should see 'test_event'
```

### Automated Test

```bash
# Run app
cd peach-web
npm run dev

# Open browser → Perform actions
# Check console for 📊 Analytics logs
```

---

## 📈 Event Flow Examples

### User Registration Flow

```
1. open_app (platform: 'ios')
2. view_home
3. create_persona (origin: 'INSPIRED', name: 'Алиса')
4. start_chat (slug: 'alisa-xyz')
5. send_message (characterId: '1')
```

### Purchase Flow

```
1. view_home
2. open_persona (slug: 'mila-abc')
3. start_chat
4. send_message
5. purchase_attempt (packId: 'small')
6. complete_payment (amount: 300, stars: 300)
```

### Quest Flow

```
1. open_app
2. quest_completed (questKey: 'open_app', reward: 20)
3. quest_claimed (questKey: 'open_app', reward: 20)
```

---

## 🔗 Integration Points

### PostHog

```javascript
// Identify user
posthog.identify(userId, {
  email: user.email,
  name: user.name
});

// Set user properties
posthog.people.set({
  balance: 1000,
  plan: 'free'
});

// Track event
posthog.capture('complete_payment', {
  amount: 300,
  stars: 300
});
```

### Umami

```javascript
// Track pageview
umami.track('view_home');

// Track event with data
umami.track('complete_payment', {
  amount: 300
});
```

---

## ✅ Checklist

### Events
- [x] open_app
- [x] view_home
- [x] start_chat
- [x] create_persona
- [x] complete_payment
- [x] send_message
- [x] open_persona
- [x] purchase_attempt
- [x] quest_completed
- [x] quest_claimed

### Setup
- [ ] Get PostHog API key
- [ ] Add VITE_POSTHOG_KEY to .env
- [ ] Deploy frontend
- [ ] Test events in dashboard
- [ ] Create insights & funnels

---

## 📊 PostHog Queries

### Top Events

```sql
SELECT
  event,
  count(*) as count
FROM events
WHERE timestamp > now() - interval 7 days
GROUP BY event
ORDER BY count DESC
LIMIT 10
```

### User Retention

```sql
SELECT
  date_trunc('day', timestamp) as day,
  count(DISTINCT person_id) as dau
FROM events
WHERE event = 'open_app'
  AND timestamp > now() - interval 30 days
GROUP BY day
ORDER BY day
```

### Purchase Conversion

```sql
WITH funnel AS (
  SELECT
    person_id,
    max(CASE WHEN event = 'purchase_attempt' THEN 1 END) as attempted,
    max(CASE WHEN event = 'complete_payment' THEN 1 END) as completed
  FROM events
  WHERE timestamp > now() - interval 7 days
  GROUP BY person_id
)
SELECT
  count(*) FILTER (WHERE attempted = 1) as attempts,
  count(*) FILTER (WHERE completed = 1) as completions,
  round(100.0 * count(*) FILTER (WHERE completed = 1) / 
        count(*) FILTER (WHERE attempted = 1), 2) as conversion_rate
FROM funnel
```

---

**Status:** ✅ All events implemented

**Next:** Add VITE_POSTHOG_KEY and deploy

**Дата:** 2025-10-13

