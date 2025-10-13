# ⚡ Quick Start - Real Telegram Stars Payments

## Что сделано ✅

### 1. **API обновлен**
- ✅ Заменён STUB на реальный `createInvoiceLink()`
- ✅ Добавлен webhook `/api/payments/webhook`
- ✅ Обработка `pre_checkout_query` и `successful_payment`
- ✅ Автоматическое начисление `users.balance`

### 2. **Bot обновлен**
- ✅ Команда `/store` - магазин кристаллов
- ✅ Обработчик `pre_checkout_query`
- ✅ Обработчик `successful_payment`
- ✅ Уведомление после оплаты

---

## 🚀 Быстрый старт

### Шаг 1: Enable Payments в @BotFather

```
Открыть: https://t.me/BotFather

Команды:
/setinvoice
→ Выбрать вашего бота
→ Stars ⭐

Ответ:
✅ Success! Your bot can now accept payments in Stars.
```

### Шаг 2: Добавить BOT_TOKEN в Vercel

```bash
# В Vercel Dashboard
Settings → Environment Variables → Add

Name: BOT_TOKEN
Value: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
Scope: Production
```

### Шаг 3: Redeploy

```bash
cd /Users/egor/Desktop/peach-mini
npx vercel --prod --yes
```

### Шаг 4: Restart Bot

```bash
cd /Users/egor/Desktop/peach-mini/bot
npm start
```

### Шаг 5: Test

```
В боте:
/store

Выбрать пакет → Оплатить → Готово!
```

---

## 🧪 Проверка работы

### Test команды /store

```
User: /store

Bot показывает:
💎 МАГАЗИН КРИСТАЛЛОВ

[💎 Малый (300⭐ → 300💎)]
[💎 Средний (600⭐ → 549💎) +10%]
[💎 Большой (850⭐ → 799💎) +20%]
```

### Test покупки

```
1. Нажать на пакет
2. Bot обновляет сообщение с кнопкой [💳 Оплатить]
3. Клик → Telegram Stars payment screen
4. Подтвердить оплату
5. Bot отправляет: "✅ +300💎"
```

### Проверка логов

**API logs (Vercel):**
```
✅ Telegram Bot API initialized
✅ /payments/createInvoice: REAL invoice created pay_123
🔍 Pre-checkout query: pay_123
✅ Pre-checkout: OK for pay_123
💰 Successful payment: pay_123
✅ Payment processed: pay_123 +300💎 → balance=1300
```

**Bot logs:**
```
💎 Crystal purchase attempt: 123456789 → small
✅ Invoice sent to 123456789: https://t.me/invoice/...
🔍 Pre-checkout query: pay_123
✅ Pre-checkout: OK for pay_123
💰 Successful payment: pay_123
✅ Crystals credited: 123456789 +300💎
```

---

## 📋 Packages

| Package | Stars | Crystals | Bonus |
|---------|-------|----------|-------|
| Small | 300⭐ | 300💎 | - |
| Medium | 600⭐ | 549💎 | +10% |
| Large | 850⭐ | 799💎 | +20% |

---

## 🔄 Flow Diagram

```
┌─────────────┐
│ User: /store│
└──────┬──────┘
       │
       v
┌─────────────────────┐
│ Bot: show packages  │
│ [Small] [Med] [Lrg] │
└──────┬──────────────┘
       │ Click
       v
┌────────────────────────────┐
│ Bot → API createInvoice    │
└──────┬─────────────────────┘
       │
       v
┌────────────────────────────┐
│ API → Telegram Bot API     │
│ createInvoiceLink()        │
└──────┬─────────────────────┘
       │
       v
┌────────────────────────────┐
│ Bot: [💳 Оплатить] URL btn │
└──────┬─────────────────────┘
       │ Click
       v
┌────────────────────────────┐
│ Telegram Stars payment UI  │
└──────┬─────────────────────┘
       │ Confirm
       v
┌────────────────────────────┐
│ pre_checkout_query         │
│ → Bot → API webhook        │
│ → API validates            │
│ → answerPreCheckoutQuery   │
└──────┬─────────────────────┘
       │
       v
┌────────────────────────────┐
│ successful_payment         │
│ → Bot → API webhook        │
│ → API: balance += amount   │
│ → Bot: notify user         │
└──────┬─────────────────────┘
       │
       v
┌────────────────────────────┐
│ ✅ +300💎                  │
│ Balance: 1300 PP           │
└────────────────────────────┘
```

---

## ⚠️ Troubleshooting

### Invoice не создается

**Проблема:** Dev mode stub вместо реального invoice

**Решение:**
```bash
# Проверить BOT_TOKEN в Vercel
vercel env ls

# Если нет - добавить:
vercel env add BOT_TOKEN production
vercel --prod --yes
```

**Лог должен показать:**
```
✅ Telegram Bot API initialized
✅ /payments/createInvoice: REAL invoice created
```

### pre_checkout_query не работает

**Проблема:** answerPreCheckoutQuery timeout

**Решение:**
- Проверить что API_URL в bot/.env указывает на production
- Проверить что /api/payments/webhook доступен
- Проверить логи Vercel

### Баланс не обновляется

**Проблема:** successful_payment не обработан

**Решение:**
```bash
# Проверить логи бота
# Должно быть:
💰 Successful payment: pay_123
✅ Crystals credited: 123456789 +300💎

# Проверить API logs
✅ Payment processed: pay_123 +300💎 → balance=1300
```

---

## ✅ Checklist

После настройки проверьте:

- [ ] @BotFather: Payments enabled (/setinvoice → Stars)
- [ ] Vercel: BOT_TOKEN добавлен
- [ ] API: redeploy выполнен
- [ ] Bot: перезапущен с BOT_TOKEN
- [ ] Test: /store показывает пакеты
- [ ] Test: клик на пакет → кнопка "Оплатить"
- [ ] Test: оплата → уведомление "✅ +300💎"
- [ ] Test: баланс увеличен через API

---

## 🔗 Endpoints

**API:**
- POST `/api/payments/createInvoice` - создать invoice
- POST `/api/payments/webhook` - обработать платеж
- POST `/api/payments/check` - проверить статус (опционально)

**Bot:**
- `/store` - магазин
- `crystals_small|medium|large` - выбор пакета

---

**Статус:** ✅ Готово! Осталось только добавить BOT_TOKEN и протестировать!

**Дата:** 2025-10-13

