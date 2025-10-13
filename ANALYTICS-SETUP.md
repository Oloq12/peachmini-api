# 📊 Analytics Setup - PostHog / Umami

## Обзор

Приложение поддерживает **2 провайдера аналитики**:
1. **PostHog** (рекомендуется) - самохостинг или облако
2. **Umami** - легковесная self-hosted альтернатива

---

## 🚀 Quick Start

### PostHog (рекомендуется)

1. **Создать аккаунт:** https://posthog.com

2. **Получить API key:** Settings → Project → API Keys

3. **Настроить ENV:**
   ```bash
   # peach-web/.env
   VITE_POSTHOG_KEY=phc_your_key_here
   VITE_POSTHOG_HOST=https://app.posthog.com
   ```

4. **Пересобрать:**
   ```bash
   cd peach-web
   npm run build
   ```

### Umami (альтернатива)

1. **Deploy Umami:** https://umami.is/docs/install

2. **Создать website:** Dashboard → Add Website

3. **Настроить ENV:**
   ```bash
   # peach-web/.env
   VITE_UMAMI_URL=https://your-umami.com/script.js
   VITE_UMAMI_WEBSITE_ID=your-website-id
   ```

4. **Пересобрать:**
   ```bash
   cd peach-web
   npm run build
   ```

---

## 📡 Отслеживаемые события

### Frontend Events

| Event | Описание | Properties |
|-------|----------|-----------|
| `open_app` | Открытие приложения | platform, version, userId |
| `view_home` | Просмотр главной страницы | - |
| `open_persona` | Открытие персонажа | slug, name |
| `start_chat` | Начало чата | slug, name |
| `send_message` | Отправка сообщения | characterId, characterName, messageLength |
| `create_persona` | Создание персонажа | origin, name |
| `purchase_attempt` | Попытка покупки | packId, points, price |
| `purchase_success` | Успешная покупка | packId, amount, balance |

### API Events (console logs)

```javascript
// Компактные логи для ключевых событий:
✅ Auto-provision: tgId=123, code=REF123ABC
📊 /girls: page=1, limit=24
💬 /chat: user=123, girl=1, msg="Hello..."
✅ /chat: OK, reply=Hi there, how are you?...
✅ /ref/apply: 456 used 123's code (+100)
✅ /quests/complete: 123/open_app +20PP → balance=1020
✅ /payments/createInvoice: pay_123, 300⭐ → 300💎
✅ /payments/check (DEV): pay_123 +300💎 → balance=1300
```

---

## 🔧 Environment Variables

### Frontend (peach-web/.env)

```bash
# PostHog (Priority 1)
VITE_POSTHOG_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://app.posthog.com

# Umami (Priority 2, если PostHog не настроен)
VITE_UMAMI_URL=https://your-umami.com/script.js
VITE_UMAMI_WEBSITE_ID=your-website-id

# API
VITE_API_URL=https://your-api.vercel.app
```

### API (api/.env)

```bash
# OpenAI для чатов
OPENAI_KEY=sk-proj-...

# Monitoring (опционально)
NODE_ENV=production
```

---

## ⚙️ Приоритет провайдеров

Система автоматически выбирает провайдера:

1. **PostHog** (если `VITE_POSTHOG_KEY` установлен)
2. **Umami** (если `VITE_UMAMI_URL` и `VITE_UMAMI_WEBSITE_ID` установлены)
3. **None** (только console.log)

```javascript
// Проверка в console:
// ✅ PostHog analytics initialized
// или
// ✅ Umami analytics loaded
// или
// 📊 Analytics not configured
```

---

## 🧪 Тестирование

### Проверка событий (console)

```javascript
// Откройте DevTools → Console
// При навигации вы увидите:

📊 open_app { platform: "web", version: "6.0" }
📊 view_home {}
📊 open_persona { slug: "anna-abc123", name: "Анна" }
📊 start_chat { slug: "anna-abc123", name: "Анна" }
📊 send_message { characterId: "1", messageLength: 15 }
📊 create_persona { origin: "INSPIRED", name: "My Character" }
📊 purchase_attempt { packId: "small", points: 300, price: 300 }
```

### Проверка в PostHog

1. Открыть Dashboard → Events
2. Фильтр по событиям: `open_app`, `send_message`, и т.д.
3. Проверить properties

### Проверка в Umami

1. Открыть Dashboard → Events
2. Все события отображаются в реальном времени

---

## 🔒 Privacy

### Отключение аналитики

Для полного отключения - удалите ENV переменные:

```bash
# peach-web/.env
# VITE_POSTHOG_KEY=        # Закомментируйте
# VITE_UMAMI_URL=          # Закомментируйте
```

Пересоберите:
```bash
cd peach-web && npm run build
```

### GDPR Compliance

PostHog и Umami поддерживают:
- ✅ IP anonymization
- ✅ Cookie-less tracking
- ✅ Self-hosting (Umami)
- ✅ EU hosting (PostHog EU cloud)

---

## 📊 API Status Endpoint

### GET `/api/status`

Endpoint для uptime monitoring.

**Response:**
```json
{
  "ok": true,
  "version": "1.0.0",
  "ts": 1760354332277,
  "uptime": 123456,
  "environment": "production"
}
```

**curl:**
```bash
curl https://your-api.vercel.app/api/status
```

**Использование:**

- UptimeRobot: ping `/api/status` каждые 5 минут
- Betterstack: monitor `/api/status`
- Healthchecks.io: GET `/api/status` → expect `"ok": true`

---

## 🧪 Testing

### Smoke Test

```bash
npm run doctor:smoke

# Проверяет:
# ✓ GET /api/status
# ✓ Все события логируются в console
```

### Manual Test

```bash
# 1. Проверить status endpoint
curl https://your-api.vercel.app/api/status | jq

# 2. Открыть приложение и проверить console
# → 📊 open_app {...}
# → 📊 view_home {}

# 3. Открыть персонажа
# → 📊 open_persona { slug: "...", name: "..." }

# 4. Начать чат
# → 📊 start_chat {...}

# 5. Отправить сообщение
# → 📊 send_message {...}
```

---

## 📁 Файлы

### Изменены:
- `peach-web/src/utils/analytics.js` - поддержка PostHog + Umami
- `peach-web/src/main.jsx` - track('open_app')
- `peach-web/src/pages/Home.jsx` - track('view_home')
- `peach-web/src/pages/Character.jsx` - track('open_persona', 'start_chat')
- `peach-web/src/components/chat/ChatScreen.jsx` - track('send_message')
- `peach-web/src/components/create/InspiredTab.jsx` - track('create_persona')
- `peach-web/src/pages/Store.jsx` - track('purchase_attempt')
- `api/index.js` - компактные логи + /api/status endpoint

### Созданы:
- `ANALYTICS-SETUP.md` - эта документация

---

## ✅ Checklist

- [x] PostHog SDK установлен
- [x] Umami поддержка сохранена
- [x] Автовыбор провайдера (PostHog → Umami → None)
- [x] 8 событий отслеживаются
- [x] Компактные логи в API
- [x] /api/status endpoint
- [x] ENV configuration
- [x] Privacy controls
- [x] Documentation

---

## 💡 Рекомендации

### Development
```bash
# Оставьте аналитику выключенной
# (без ENV переменных)
```

### Staging
```bash
# Используйте отдельный PostHog project
VITE_POSTHOG_KEY=phc_staging_key
```

### Production
```bash
# Production PostHog project
VITE_POSTHOG_KEY=phc_prod_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

---

**Статус:** ✅ Готово к использованию

**Дата:** 2025-10-13

