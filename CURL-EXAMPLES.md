# 🚀 API - curl Examples

Готовые примеры для тестирования всех endpoints.

---

## 🔧 Setup

```bash
# Установите API URL (по умолчанию localhost)
export API_URL="http://localhost:8787/api"

# Или для продакшена
export API_URL="https://your-api.vercel.app/api"
```

---

## 1️⃣ Referral System

### Получить статус реферальной программы
```bash
# Auto-provision нового пользователя
curl "$API_URL/ref/status?tgId=123456789"
```

**Ответ:**
```json
{
  "ok": true,
  "data": {
    "referralCode": "REF456789XYZ",
    "refCount": 0,
    "earned": 0,
    "balance": 1000
  }
}
```

### Применить реферальный код
```bash
# Пользователь 2 применяет код пользователя 1
curl -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d '{
    "tgId": "987654321",
    "code": "REF456789XYZ"
  }'
```

**Ответ (успех):**
```json
{
  "ok": true,
  "data": {
    "credited": true,
    "amount": 100,
    "referrerCode": "REF456789XYZ"
  }
}
```

**Ответ (уже применён):**
```json
{
  "ok": true,
  "data": {
    "credited": false,
    "message": "Referral code already applied",
    "alreadyApplied": true
  }
}
```

### Проверить начисление бонуса
```bash
# Проверяем баланс пользователя 1 (должен быть 1100)
curl "$API_URL/ref/status?tgId=123456789"
```

**Ответ:**
```json
{
  "ok": true,
  "data": {
    "referralCode": "REF456789XYZ",
    "refCount": 1,
    "earned": 100,
    "balance": 1100
  }
}
```

---

## 2️⃣ Quests System

### Получить список квестов
```bash
curl "$API_URL/quests/status?tgId=123456789"
```

**Ответ:**
```json
{
  "ok": true,
  "data": {
    "quests": [
      {
        "key": "first_chat",
        "title": "Первый диалог",
        "description": "Начните разговор с любым персонажем",
        "reward": 50,
        "icon": "💬",
        "done": false
      },
      {
        "key": "create_character",
        "title": "Создать персонажа",
        "description": "Создайте своего первого персонажа",
        "reward": 100,
        "icon": "✨",
        "done": false
      },
      {
        "key": "invite_friend",
        "title": "Пригласить друга",
        "description": "Пригласите друга по реферальной ссылке",
        "reward": 150,
        "icon": "👥",
        "done": false
      }
    ],
    "totals": {
      "completed": 0,
      "total": 3,
      "earned": 0
    }
  }
}
```

### Выполнить квест
```bash
curl -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "tgId": "123456789",
    "key": "first_chat"
  }'
```

**Ответ (первое выполнение):**
```json
{
  "ok": true,
  "data": {
    "done": true,
    "reward": 50,
    "newBalance": 1050
  }
}
```

**Ответ (повторное выполнение):**
```json
{
  "ok": true,
  "data": {
    "done": true,
    "alreadyCompleted": true,
    "reward": 0
  }
}
```

### Проверить прогресс
```bash
curl "$API_URL/quests/status?tgId=123456789"
```

**Ответ:**
```json
{
  "ok": true,
  "data": {
    "quests": [
      {
        "key": "first_chat",
        "done": true,
        ...
      },
      {
        "key": "create_character",
        "done": false,
        ...
      },
      ...
    ],
    "totals": {
      "completed": 1,
      "total": 3,
      "earned": 50
    }
  }
}
```

---

## 3️⃣ Full Flow Example

### Сценарий: новый пользователь с рефералом и квестами

```bash
# 1. Пользователь 1 регистрируется
curl "$API_URL/ref/status?tgId=111111111"
# → получает код REF111111ABC

# 2. Пользователь 2 регистрируется
curl "$API_URL/ref/status?tgId=222222222"
# → получает код REF222222XYZ

# 3. Пользователь 2 применяет код пользователя 1
curl -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "code": "REF111111ABC"}'
# → пользователь 1 получает +100 PP

# 4. Пользователь 2 выполняет первый квест
curl -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "key": "first_chat"}'
# → получает +50 PP

# 5. Пользователь 2 выполняет второй квест
curl -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "key": "create_character"}'
# → получает +100 PP

# 6. Проверяем итоговые балансы
curl "$API_URL/ref/status?tgId=111111111"
# → balance: 1100 (1000 + 100 за реферала)

curl "$API_URL/ref/status?tgId=222222222"
# → balance: 1150 (1000 + 50 + 100 за квесты)
```

---

## 4️⃣ Error Handling Examples

### Невалидный реферальный код
```bash
curl -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "123456789", "code": "INVALID123"}'
```

**Ответ:**
```json
{
  "ok": false,
  "error": "Referral code not found",
  "code": "INVALID_CODE"
}
```

### Self-referral (свой код)
```bash
curl -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "123456789", "code": "REF456789XYZ"}'
```

**Ответ:**
```json
{
  "ok": false,
  "error": "Cannot use your own referral code",
  "code": "SELF_REFERRAL"
}
```

### Несуществующий квест
```bash
curl -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "123456789", "key": "invalid_quest"}'
```

**Ответ:**
```json
{
  "ok": false,
  "error": "Quest not found",
  "code": "QUEST_NOT_FOUND"
}
```

### Отсутствует tgId
```bash
curl "$API_URL/ref/status"
```

**Ответ:**
```json
{
  "ok": false,
  "error": "Telegram ID is required",
  "code": "MISSING_TG_ID"
}
```

---

## 5️⃣ Advanced Examples

### Batch operations (несколько пользователей)

```bash
# Создать 5 пользователей
for i in {1..5}; do
  curl "$API_URL/ref/status?tgId=100000000$i"
  echo ""
done

# Применить реферальный код для всех
REF_CODE="REF000001ABC"
for i in {2..5}; do
  curl -X POST "$API_URL/ref/apply" \
    -H "Content-Type: application/json" \
    -d "{\"tgId\": \"100000000$i\", \"code\": \"$REF_CODE\"}"
  echo ""
done

# Проверить статус первого пользователя
curl "$API_URL/ref/status?tgId=1000000001"
# → refCount: 4, earned: 400
```

### Выполнить все квесты
```bash
QUESTS=("first_chat" "create_character" "invite_friend")

for quest in "${QUESTS[@]}"; do
  curl -X POST "$API_URL/quests/complete" \
    -H "Content-Type: application/json" \
    -d "{\"tgId\": \"123456789\", \"key\": \"$quest\"}"
  echo ""
done

# Проверить итоговый баланс
curl "$API_URL/ref/status?tgId=123456789"
# → balance: 1300 (1000 + 50 + 100 + 150)
```

### Получить реферальный код и применить его
```bash
# 1. Получить код пользователя 1
REF_CODE=$(curl -s "$API_URL/ref/status?tgId=111111111" | jq -r '.data.referralCode')
echo "Referral code: $REF_CODE"

# 2. Применить код для пользователя 2
curl -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d "{\"tgId\": \"222222222\", \"code\": \"$REF_CODE\"}"
```

---

## 6️⃣ Testing Script

### Полный автоматический тест
```bash
chmod +x api/test-autoprovision.sh
./api/test-autoprovision.sh
```

### Минимальный тест
```bash
# Проверка auto-provision
curl "$API_URL/ref/status?tgId=999999999"

# Проверка квестов
curl "$API_URL/quests/status?tgId=999999999"

# Выполнение квеста
curl -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "999999999", "key": "first_chat"}'
```

---

## 📊 Response Format

Все ответы в стандартном формате:

**Успех:**
```json
{
  "ok": true,
  "data": { ... }
}
```

**Ошибка:**
```json
{
  "ok": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🔗 Quick Links

- [Полная документация](./API-AUTO-PROVISION.md)
- [Краткая сводка](./AUTOPROVISION-SUMMARY.md)
- [Тестовый скрипт](./api/test-autoprovision.sh)

---

**Дата:** 2025-10-13

