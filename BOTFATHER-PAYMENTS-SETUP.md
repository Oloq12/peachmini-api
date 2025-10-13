# 🤖 @BotFather - Включение Telegram Stars

## Шаги настройки

### 1. Открыть @BotFather

```
https://t.me/BotFather
```

### 2. Включить Payments

```
/mybots
→ Выбрать вашего бота (например @Amourath_ai_bot)
→ Bot Settings
→ Payments
→ Select Stars as Payment Provider
```

**Или напрямую:**
```
/setinvoice
→ Выбрать бота
→ Stars ⭐
```

### 3. Подтверждение

После настройки BotFather ответит:
```
✅ Success! Your bot can now accept payments in Stars.
The Stars provider doesn't require any additional configuration.
```

### 4. Проверка

Ваш бот теперь может:
- ✅ Создавать invoice links через `createInvoiceLink()`
- ✅ Отправлять invoices через `sendInvoice()`
- ✅ Получать события `pre_checkout_query`
- ✅ Получать события `successful_payment`

---

## ⚠️ Важно

**Telegram Stars:**
- Встроенная валюта Telegram
- Не требует дополнительной настройки
- Комиссия ~0% (Telegram может меняться)
- Автоматическая конвертация в разных странах

**Тестирование:**
- В dev можно использовать test payment mode
- Telegram предоставляет test invoices для разработки

---

**Статус:** После выполнения этих шагов можно использовать реальные платежи!

