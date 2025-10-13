# API Auto-Provision & Referrals & Quests

## Обзор

Система автоматического создания пользователей по Telegram ID с реферальной программой и квестами.

### Возможности

- ✅ **Auto-provision**: автоматическое создание пользователя при первом запросе
- ✅ **Referral system**: реферальные коды, начисление бонусов
- ✅ **Quests**: система достижений с наградами
- ✅ **Idempotent**: безопасные повторные запросы

---

## 📋 Endpoints

### 1. GET `/api/ref/status?tgId=...`

Получить статус реферальной программы пользователя. **Автоматически создаёт пользователя, если его нет.**

**Query Parameters:**
- `tgId` (required) - Telegram user ID

**Response:**
```json
{
  "ok": true,
  "data": {
    "referralCode": "REF123456ABC",
    "refCount": 0,
    "earned": 0,
    "balance": 1000
  }
}
```

**curl пример:**
```bash
curl "http://localhost:8787/api/ref/status?tgId=123456789"
```

---

### 2. POST `/api/ref/apply`

Применить реферальный код. **Идемпотентно** - повторные применения игнорируются.

**Body:**
```json
{
  "tgId": "987654321",
  "code": "REF123456ABC"
}
```

**Response (успех):**
```json
{
  "ok": true,
  "data": {
    "credited": true,
    "amount": 100,
    "referrerCode": "REF123456ABC"
  }
}
```

**Response (уже применён):**
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

**curl пример:**
```bash
curl -X POST http://localhost:8787/api/ref/apply \
  -H "Content-Type: application/json" \
  -d '{
    "tgId": "987654321",
    "code": "REF123456ABC"
  }'
```

**Ошибки:**
```json
// Код не найден (404)
{
  "ok": false,
  "error": "Referral code not found",
  "code": "INVALID_CODE"
}

// Попытка использовать свой код (400)
{
  "ok": false,
  "error": "Cannot use your own referral code",
  "code": "SELF_REFERRAL"
}
```

---

### 3. GET `/api/quests/status?tgId=...`

Получить список квестов с их статусом. **Автоматически создаёт пользователя, если его нет.**

**Query Parameters:**
- `tgId` (required) - Telegram user ID

**Response:**
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

**curl пример:**
```bash
curl "http://localhost:8787/api/quests/status?tgId=123456789"
```

---

### 4. POST `/api/quests/complete`

Отметить квест как выполненный. **Идемпотентно** - повторные вызовы не дают награду.

**Body:**
```json
{
  "tgId": "123456789",
  "key": "first_chat"
}
```

**Response (первое выполнение):**
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

**Response (уже выполнен):**
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

**curl пример:**
```bash
curl -X POST http://localhost:8787/api/quests/complete \
  -H "Content-Type: application/json" \
  -d '{
    "tgId": "123456789",
    "key": "first_chat"
  }'
```

**Ошибка (квест не найден):**
```json
{
  "ok": false,
  "error": "Quest not found",
  "code": "QUEST_NOT_FOUND"
}
```

---

## 🎯 Сценарии использования

### Сценарий 1: Новый пользователь

```bash
# 1. Пользователь открывает приложение
curl "http://localhost:8787/api/ref/status?tgId=123456789"

# Ответ: пользователь создан автоматически
{
  "ok": true,
  "data": {
    "referralCode": "REF456789XYZ",
    "refCount": 0,
    "earned": 0,
    "balance": 1000
  }
}

# 2. Получаем квесты
curl "http://localhost:8787/api/quests/status?tgId=123456789"

# Ответ: 3 квеста, все не выполнены
{
  "ok": true,
  "data": {
    "quests": [...],
    "totals": {
      "completed": 0,
      "total": 3,
      "earned": 0
    }
  }
}
```

### Сценарий 2: Применение реферального кода

```bash
# 1. У пользователя 1 есть код
curl "http://localhost:8787/api/ref/status?tgId=111111111"
# → { referralCode: "REF111111ABC", ... }

# 2. Пользователь 2 применяет код
curl -X POST http://localhost:8787/api/ref/apply \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "code": "REF111111ABC"}'

# Ответ:
{
  "ok": true,
  "data": {
    "credited": true,
    "amount": 100
  }
}

# 3. Проверяем баланс пользователя 1
curl "http://localhost:8787/api/ref/status?tgId=111111111"
# → { refCount: 1, earned: 100, balance: 1100 }
```

### Сценарий 3: Выполнение квестов

```bash
# 1. Пользователь выполнил первый чат
curl -X POST http://localhost:8787/api/quests/complete \
  -H "Content-Type: application/json" \
  -d '{"tgId": "123456789", "key": "first_chat"}'

# Ответ:
{
  "ok": true,
  "data": {
    "done": true,
    "reward": 50,
    "newBalance": 1050
  }
}

# 2. Проверяем статус квестов
curl "http://localhost:8787/api/quests/status?tgId=123456789"

# Ответ:
{
  "ok": true,
  "data": {
    "quests": [
      { "key": "first_chat", "done": true, ... },
      { "key": "create_character", "done": false, ... },
      { "key": "invite_friend", "done": false, ... }
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

## 🔐 Валидация

### Обязательные поля

| Endpoint | Обязательные поля |
|----------|-------------------|
| GET /api/ref/status | `tgId` (query) |
| POST /api/ref/apply | `tgId`, `code` |
| GET /api/quests/status | `tgId` (query) |
| POST /api/quests/complete | `tgId`, `key` |

### Коды ошибок

| Код | Описание |
|-----|----------|
| `MISSING_TG_ID` | Отсутствует Telegram ID |
| `MISSING_FIELDS` | Отсутствуют обязательные поля |
| `INVALID_CODE` | Реферальный код не найден |
| `SELF_REFERRAL` | Попытка использовать свой код |
| `QUEST_NOT_FOUND` | Квест не найден |
| `REF_STATUS_FAIL` | Ошибка получения статуса |
| `REF_APPLY_FAIL` | Ошибка применения кода |
| `QUESTS_STATUS_FAIL` | Ошибка получения квестов |
| `QUEST_COMPLETE_FAIL` | Ошибка выполнения квеста |

---

## 💾 Структура данных

### User Object
```javascript
{
  tgId: "123456789",
  referralCode: "REF456789XYZ",
  refCount: 0,           // Количество приглашённых
  earned: 0,             // Заработано с рефералов
  balance: 1000,         // Текущий баланс
  completedQuests: [],   // Массив ключей выполненных квестов
  referredBy: null,      // tgId пригласившего
  createdAt: 1234567890
}
```

### Quest Object
```javascript
{
  key: "first_chat",
  title: "Первый диалог",
  description: "Начните разговор с любым персонажем",
  reward: 50,
  icon: "💬"
}
```

---

## 🧪 Тестирование

### Полный flow test

```bash
# Создать двух пользователей
curl "http://localhost:8787/api/ref/status?tgId=111111111"
curl "http://localhost:8787/api/ref/status?tgId=222222222"

# Пользователь 2 использует код пользователя 1
REF_CODE=$(curl -s "http://localhost:8787/api/ref/status?tgId=111111111" | jq -r '.data.referralCode')

curl -X POST http://localhost:8787/api/ref/apply \
  -H "Content-Type: application/json" \
  -d "{\"tgId\": \"222222222\", \"code\": \"$REF_CODE\"}"

# Пользователь 2 выполняет квест
curl -X POST http://localhost:8787/api/quests/complete \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "key": "first_chat"}'

# Проверяем балансы
curl "http://localhost:8787/api/ref/status?tgId=111111111" | jq '.data.balance'
# → 1100 (1000 + 100 за реферала)

curl "http://localhost:8787/api/ref/status?tgId=222222222" | jq '.data.balance'
# → 1050 (1000 + 50 за квест)
```

---

## ✅ Checklist

- [x] Auto-provision пользователей по tgId
- [x] Генерация уникальных реферальных кодов
- [x] Идемпотентное применение реферальных кодов
- [x] Начисление +100 автору кода
- [x] Система квестов (3 базовых квеста)
- [x] Идемпотентное выполнение квестов
- [x] Начисление наград за квесты
- [x] Валидация всех endpoints
- [x] Дружелюбные коды ошибок
- [x] curl примеры для всех endpoints

**Статус:** ✅ ГОТОВО

