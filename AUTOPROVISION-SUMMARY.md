# ✅ Auto-Provision API - Краткая сводка

## Что реализовано

### 1. **Auto-Provision пользователей** ✅
- Автоматическое создание пользователя по `tgId` при первом запросе
- Генерация уникального реферального кода (формат: `REF{tgId-last6}{random3}`)
- Начальный баланс: 1000 PP

### 2. **Реферальная система** ✅
- `GET /api/ref/status?tgId=...` - получить код, статистику
- `POST /api/ref/apply` - применить код, +100 PP автору
- Идемпотентность - код можно применить только 1 раз
- Защита от self-referral

### 3. **Система квестов** ✅
- `GET /api/quests/status?tgId=...` - список из 3 базовых квестов
- `POST /api/quests/complete` - выполнить квест, получить награду
- Идемпотентность - награда начисляется только 1 раз

### 4. **Базовые квесты**
| Квест | Награда | Описание |
|-------|---------|----------|
| `first_chat` | 50 PP | 💬 Первый диалог |
| `create_character` | 100 PP | ✨ Создать персонажа |
| `invite_friend` | 150 PP | 👥 Пригласить друга |

---

## 📡 API Endpoints

### GET `/api/ref/status?tgId=...`
```bash
curl "http://localhost:8787/api/ref/status?tgId=123456789"

# Response:
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

### POST `/api/ref/apply`
```bash
curl -X POST http://localhost:8787/api/ref/apply \
  -H "Content-Type: application/json" \
  -d '{"tgId": "987654321", "code": "REF456789XYZ"}'

# Response:
{
  "ok": true,
  "data": {
    "credited": true,
    "amount": 100
  }
}
```

### GET `/api/quests/status?tgId=...`
```bash
curl "http://localhost:8787/api/quests/status?tgId=123456789"

# Response:
{
  "ok": true,
  "data": {
    "quests": [
      {
        "key": "first_chat",
        "title": "Первый диалог",
        "reward": 50,
        "icon": "💬",
        "done": false
      },
      ...
    ],
    "totals": {
      "completed": 0,
      "total": 3,
      "earned": 0
    }
  }
}
```

### POST `/api/quests/complete`
```bash
curl -X POST http://localhost:8787/api/quests/complete \
  -H "Content-Type: application/json" \
  -d '{"tgId": "123456789", "key": "first_chat"}'

# Response:
{
  "ok": true,
  "data": {
    "done": true,
    "reward": 50,
    "newBalance": 1050
  }
}
```

---

## 🔐 Особенности

### Идемпотентность

**Реферальный код:**
- ✅ Первое применение → +100 PP автору кода
- ✅ Повторное применение → `{ alreadyApplied: true, credited: false }`

**Квест:**
- ✅ Первое выполнение → награда начисляется
- ✅ Повторное выполнение → `{ alreadyCompleted: true, reward: 0 }`

### Валидация

**Реферальные коды:**
- ❌ `INVALID_CODE` - код не найден
- ❌ `SELF_REFERRAL` - попытка использовать свой код

**Квесты:**
- ❌ `QUEST_NOT_FOUND` - квест не существует
- ❌ `MISSING_TG_ID` - отсутствует Telegram ID

---

## 🧪 Тестирование

### Автоматические тесты
```bash
chmod +x api/test-autoprovision.sh
./api/test-autoprovision.sh
```

**Что тестируется:**
1. ✅ Auto-provision двух пользователей
2. ✅ Применение реферального кода
3. ✅ Идемпотентность реферального кода
4. ✅ Проверка начисления +100 PP
5. ✅ Загрузка квестов
6. ✅ Выполнение квеста
7. ✅ Идемпотентность квестов
8. ✅ Проверка начисления наград
9. ✅ Отклонение невалидного кода
10. ✅ Отклонение self-referral
11. ✅ Отклонение невалидного квеста

### Ручное тестирование

**Сценарий: полный flow**
```bash
# 1. Создать пользователя 1
curl "http://localhost:8787/api/ref/status?tgId=111111111"
# → { referralCode: "REF111111ABC", balance: 1000 }

# 2. Создать пользователя 2
curl "http://localhost:8787/api/ref/status?tgId=222222222"

# 3. Пользователь 2 применяет код
curl -X POST http://localhost:8787/api/ref/apply \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "code": "REF111111ABC"}'

# 4. Пользователь 2 выполняет квест
curl -X POST http://localhost:8787/api/quests/complete \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "key": "first_chat"}'

# 5. Проверяем балансы
curl "http://localhost:8787/api/ref/status?tgId=111111111"
# → { balance: 1100, refCount: 1, earned: 100 }

curl "http://localhost:8787/api/ref/status?tgId=222222222"  
# → { balance: 1050 } (1000 + 50 за квест)
```

---

## 📁 Файлы

### Изменены:
- `/api/index.js` - добавлены endpoints для auto-provision, рефералов и квестов

### Созданы:
- `API-AUTO-PROVISION.md` - полная документация с примерами
- `api/test-autoprovision.sh` - автоматические тесты
- `AUTOPROVISION-SUMMARY.md` - эта сводка

---

## 💡 Структура данных

### User (автоматически создаётся)
```javascript
{
  tgId: "123456789",
  referralCode: "REF456789XYZ",  // Уникальный код
  refCount: 0,                    // Приглашено людей
  earned: 0,                      // Заработано PP
  balance: 1000,                  // Текущий баланс
  completedQuests: [],            // ['first_chat', ...]
  referredBy: null,               // tgId пригласившего
  createdAt: 1234567890
}
```

### Quest (базовые)
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

## ✅ Checklist

- [x] Auto-provision по tgId
- [x] Генерация реферальных кодов
- [x] GET /api/ref/status - статус рефералов
- [x] POST /api/ref/apply - применить код (+100 PP)
- [x] GET /api/quests/status - список квестов
- [x] POST /api/quests/complete - выполнить квест
- [x] Идемпотентность всех операций
- [x] Валидация и коды ошибок
- [x] curl примеры
- [x] Автоматические тесты
- [x] Документация

**Статус:** ✅ ГОТОВО

**Дата:** 2025-10-13

