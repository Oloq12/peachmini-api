# 💎 Telegram Stars Payment System

## Обзор

Система покупки кристаллов через **Telegram Stars** - встроенный платежный метод Telegram.

### Возможности

- ✅ 3 пакета кристаллов (Small/Medium/Large)
- ✅ Оплата через Telegram Stars
- ✅ Auto-provision пользователя
- ✅ Dev режим для тестирования
- ✅ Идемпотентность начислений
- ✅ Webhook готовность (TODO в продакшене)

---

## 📦 Пакеты

| ID | Stars | Crystals | Bonus | Title |
|----|-------|----------|-------|-------|
| `small` | 300 | 300 | - | Малый пакет |
| `medium` | 600 | 549 | +10% | Средний пакет |
| `large` | 850 | 799 | +20% | Большой пакет |

---

## 🔧 API Endpoints

### 1. GET `/api/payments/packages`

Получить список доступных пакетов.

**Response:**
```json
{
  "ok": true,
  "data": {
    "packages": [
      {
        "id": "small",
        "stars": 300,
        "amount": 300,
        "title": "Малый пакет",
        "description": "300 кристаллов"
      },
      ...
    ]
  }
}
```

**curl:**
```bash
curl https://your-api.vercel.app/api/payments/packages
```

---

### 2. POST `/api/payments/createInvoice`

Создать инвойс для оплаты.

**Request:**
```json
{
  "tgId": "123456789",
  "packId": "small"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "invoiceLink": "https://t.me/$TEST_INVOICE_LINK?start=pay_...",
    "paymentId": "pay_1760352109_abc123",
    "pack": {
      "id": "small",
      "title": "Малый пакет",
      "description": "300 кристаллов",
      "stars": 300,
      "amount": 300
    }
  }
}
```

**curl:**
```bash
curl -X POST https://your-api.vercel.app/api/payments/createInvoice \
  -H "Content-Type: application/json" \
  -d '{
    "tgId": "123456789",
    "packId": "small"
  }'
```

**Errors:**
- `MISSING_TG_ID` - отсутствует tgId
- `MISSING_PACK_ID` - отсутствует packId
- `PACK_NOT_FOUND` - пакет не найден
- `INVOICE_CREATE_FAIL` - ошибка создания

---

### 3. POST `/api/payments/check`

Проверить статус оплаты и начислить кристаллы.

**Request:**
```json
{
  "paymentId": "pay_1760352109_abc123",
  "dev": true
}
```

**Response (успех):**
```json
{
  "ok": true,
  "data": {
    "credited": true,
    "amount": 300,
    "balance": 1300,
    "dev": true
  }
}
```

**Response (уже начислено):**
```json
{
  "ok": true,
  "data": {
    "credited": true,
    "alreadyCredited": true,
    "amount": 300,
    "balance": 1300
  }
}
```

**curl:**
```bash
curl -X POST https://your-api.vercel.app/api/payments/check \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_1760352109_abc123",
    "dev": true
  }'
```

**Errors:**
- `MISSING_PAYMENT_ID` - отсутствует paymentId
- `PAYMENT_NOT_FOUND` - платеж не найден
- `PAYMENT_CHECK_FAIL` - ошибка проверки

---

## 🗄️ Database Schema

### Collection: `users`
```javascript
{
  tgId: "123456789",          // unique
  balance: 1000,               // int, default 0
  referralCode: "REF123...",
  refCount: 0,
  earned: 0,
  appliedRefCode: []
}
```

### Collection: `payments`
```javascript
{
  id: "pay_1760352109_abc123",
  userId: "123456789",
  invoiceId: "inv_1760352109",
  status: "pending|paid|failed",
  amount: 300,                  // crystals to credit
  stars: 300,                   // stars cost
  created: "2025-10-13T..."
}
```

**Indexes:**
- `userId` - быстрый поиск платежей пользователя
- `invoiceId` - поиск по Telegram invoice
- `status` - фильтрация по статусу

---

## 🔄 Payment Flow

### Frontend (WebApp)

```javascript
// 1. Получить пакеты
const packages = await fetch('/api/payments/packages')
  .then(r => r.json())

// 2. Создать инвойс
const invoice = await fetch('/api/payments/createInvoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tgId: window.Telegram.WebApp.initDataUnsafe.user.id,
    packId: 'small'
  })
}).then(r => r.json())

// 3. Открыть оплату
window.Telegram.WebApp.openInvoice(invoice.data.invoiceLink)

// 4. После возврата - проверить оплату
window.Telegram.WebApp.onEvent('invoiceClose', async (event) => {
  if (event.status === 'paid') {
    const result = await fetch('/api/payments/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: invoice.data.paymentId,
        dev: true // remove in production
      })
    }).then(r => r.json())
    
    if (result.data.credited) {
      toast.success(`+${result.data.amount} 💎`)
      updateBalance(result.data.balance)
    }
  }
})
```

### Bot (Telegraf)

```javascript
// Команда /store
bot.command('store', async (ctx) => {
  const keyboard = [
    [
      { text: '💎 Малый (300⭐)', callback_data: 'buy_small' },
      { text: '💎 Средний (600⭐)', callback_data: 'buy_medium' }
    ],
    [
      { text: '💎 Большой (850⭐)', callback_data: 'buy_large' }
    ]
  ]
  
  await ctx.reply('Выберите пакет:', {
    reply_markup: { inline_keyboard: keyboard }
  })
})

// Обработка покупки
bot.action(/^buy_(.+)$/, async (ctx) => {
  const packId = ctx.match[1]
  const tgId = ctx.from.id
  
  // Создать инвойс через наш API
  const response = await fetch('https://your-api.vercel.app/api/payments/createInvoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tgId, packId })
  })
  
  const { data } = await response.json()
  
  // Отправить кнопку оплаты
  await ctx.reply('Оплатите заказ:', {
    reply_markup: {
      inline_keyboard: [[
        { text: '💳 Оплатить', url: data.invoiceLink }
      ]]
    }
  })
})

// Обработка successful_payment
bot.on('successful_payment', async (ctx) => {
  const paymentId = ctx.message.successful_payment.invoice_payload
  
  // Проверить и зачислить через API
  const response = await fetch('https://your-api.vercel.app/api/payments/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, dev: true })
  })
  
  const { data } = await response.json()
  
  if (data.credited) {
    await ctx.reply(`✅ Баланс пополнен: +${data.amount} 💎\nТекущий баланс: ${data.balance} 💎`)
  }
})
```

---

## 🧪 Testing

### Dev Mode (auto-approve)

```bash
# 1. Создать инвойс
PAYMENT_ID=$(curl -s -X POST https://your-api.vercel.app/api/payments/createInvoice \
  -H "Content-Type: application/json" \
  -d '{"tgId":"dev_user","packId":"small"}' | jq -r '.data.paymentId')

echo "Payment ID: $PAYMENT_ID"

# 2. Проверить и зачислить (dev=true)
curl -X POST https://your-api.vercel.app/api/payments/check \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"dev\":true}" | jq

# Response:
# {
#   "ok": true,
#   "data": {
#     "credited": true,
#     "amount": 300,
#     "balance": 1300,
#     "dev": true
#   }
# }
```

### Smoke Test

```bash
npm run doctor:smoke

# Проверяет:
# ✓ POST /api/payments/createInvoice
# ✓ POST /api/payments/check (dev mode)
```

---

## ⚠️ Production Setup

### Убрать dev-stub

В `api/index.js`:

```javascript
// ❌ УДАЛИТЬ в продакшене:
if (dev === true || dev === 'true') {
  // auto-approve
}

// ✅ ДОБАВИТЬ в продакшене:
// Проверка через Telegram Bot API
const transactions = await bot.telegram.getStarTransactions({
  offset: 0,
  limit: 100
})

const transaction = transactions.find(t => 
  t.invoice_payload === paymentId && 
  t.status === 'successful'
)

if (transaction) {
  // Зачислить
  payment.status = 'paid'
  user.balance += payment.amount
}
```

### Webhook для pre_checkout_query

```javascript
bot.on('pre_checkout_query', async (ctx) => {
  // Валидация перед оплатой
  const paymentId = ctx.preCheckoutQuery.invoice_payload
  const payment = await findPayment(paymentId)
  
  if (payment && payment.status === 'pending') {
    await ctx.answerPreCheckoutQuery(true)
  } else {
    await ctx.answerPreCheckoutQuery(false, {
      error_message: 'Payment not found or already processed'
    })
  }
})
```

### Создание реального инвойса

```javascript
// Вместо mock link
const invoiceLink = await bot.telegram.createInvoiceLink({
  title: pack.title,
  description: pack.description,
  payload: paymentId,
  provider_token: '', // пусто для Stars
  currency: 'XTR',
  prices: [{ label: pack.title, amount: pack.stars }]
})
```

---

## 📋 Checklist

### Development ✅
- [x] API endpoints (create/check/packages)
- [x] Mock invoice links
- [x] Dev mode auto-approve
- [x] PocketBase schema
- [x] Smoke tests
- [x] Documentation

### Production TODO ⚠️
- [ ] Удалить `dev=true` stub
- [ ] Интегрировать `bot.telegram.createInvoiceLink()`
- [ ] Добавить `getStarTransactions()` проверку
- [ ] Настроить `pre_checkout_query` webhook
- [ ] Добавить `successful_payment` обработчик
- [ ] Логирование транзакций
- [ ] Мониторинг и алерты

---

## 🔗 Полезные ссылки

- [Telegram Stars API](https://core.telegram.org/bots/payments#stars)
- [Bot API: createInvoiceLink](https://core.telegram.org/bots/api#createinvoicelink)
- [Bot API: getStarTransactions](https://core.telegram.org/bots/api#getstartransactions)

---

**Статус:** ✅ Dev режим готов | ⚠️ Production требует настройки

**Дата:** 2025-10-13

