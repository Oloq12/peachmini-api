# 🔐 GitHub Secrets Setup - Step by Step

## Зачем нужны секреты?

GitHub Secrets используются для безопасного хранения конфиденциальных данных (токенов, API ключей) в GitHub Actions workflows.

---

## 📋 Необходимые секреты для Heartbeat Monitor

### 1. `BOT_TOKEN` - Telegram Bot Token
### 2. `ADMIN_TG_ID` - Ваш Telegram ID

---

## 🔑 Получение значений

### BOT_TOKEN (Telegram Bot Token)

**Где найти:**
1. Открой Telegram
2. Найди бота **@BotFather**
3. Отправь команду `/mybots`
4. Выбери своего бота: **@Amourath_ai_bot**
5. Нажми **API Token**
6. Скопируй токен (формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

**Альтернатива:** Посмотри в файле `.env`:
```bash
cat .env | grep BOT_TOKEN
```

---

### ADMIN_TG_ID (Your Telegram ID)

**Где найти:**
1. Открой Telegram
2. Найди бота **@userinfobot**
3. Отправь ему `/start`
4. Скопируй свой ID (формат: `123456789`)

**Пример ответа:**
```
Id: 123456789
First name: Егор
Username: @your_username
```

---

## ⚙️ Добавление секретов в GitHub

### Шаг 1: Открой Settings

1. Перейди в свой репозиторий на GitHub
2. Нажми **Settings** (в верхнем меню)

```
https://github.com/yourusername/peach-mini/settings
```

---

### Шаг 2: Перейди в Secrets

1. В левом меню найди **Secrets and variables**
2. Нажми **Actions**

```
Settings → Secrets and variables → Actions
```

---

### Шаг 3: Добавь секрет BOT_TOKEN

1. Нажми **"New repository secret"** (зелёная кнопка)
2. Заполни поля:

```
Name:  BOT_TOKEN
Value: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
       (твой токен от @BotFather)
```

3. Нажми **"Add secret"**

---

### Шаг 4: Добавь секрет ADMIN_TG_ID

1. Снова нажми **"New repository secret"**
2. Заполни поля:

```
Name:  ADMIN_TG_ID
Value: 123456789
       (твой Telegram ID от @userinfobot)
```

3. Нажми **"Add secret"**

---

## ✅ Проверка

### Список секретов должен выглядеть так:

```
Repository secrets

BOT_TOKEN              Updated 1 minute ago      [Update] [Remove]
ADMIN_TG_ID            Updated 1 minute ago      [Update] [Remove]
```

---

## 🧪 Тестирование

### 1. Включи GitHub Actions

**Settings → Actions → General**

✅ Allow all actions and reusable workflows

---

### 2. Запусти Workflow вручную

**Actions → Heartbeat Monitor → Run workflow**

1. Выбери ветку: `main` (или `master`)
2. Нажми **"Run workflow"**
3. Подожди 10-20 секунд

---

### 3. Проверь Telegram

Ты должен получить сообщение:

```
✅ Peachmini Health Check

⏰ Time: 2025-10-13 12:00:00 UTC

✅ API: UP
✅ Frontend: UP

🎉 All systems operational!
```

---

## ⚠️ Troubleshooting

### Секрет не работает

**Проблема:** Workflow не видит секрет

**Решение:**
1. Проверь имя секрета (точное совпадение)
2. Проверь, что секрет добавлен в **Repository secrets**, а не **Environment secrets**
3. Пере-запусти workflow

---

### Неправильный BOT_TOKEN

**Ошибка в логах:**
```
{"ok":false,"error_code":401,"description":"Unauthorized"}
```

**Решение:**
1. Получи новый токен от @BotFather
2. Обнови secret в GitHub
3. Пере-запусти workflow

---

### Неправильный ADMIN_TG_ID

**Проблема:** Уведомления не приходят

**Решение:**
1. Проверь ID от @userinfobot
2. Убедись, что отправил `/start` боту
3. Обнови secret в GitHub

---

## 🔒 Безопасность

### ✅ DO:
- Храни секреты только в GitHub Secrets
- Используй разные токены для dev/prod
- Регулярно ротируй токены

### ❌ DON'T:
- Не коммить секреты в код
- Не показывай секреты в логах
- Не шарь секреты в issue/PR

---

## 📊 Использование секретов в workflow

```yaml
steps:
  - name: Notify Telegram
    env:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      ADMIN_TG_ID: ${{ secrets.ADMIN_TG_ID }}
    run: |
      curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
        -d "chat_id=${ADMIN_TG_ID}" \
        -d "text=Hello from GitHub Actions!"
```

---

## 🔄 Обновление секретов

### Если нужно изменить значение:

1. **Settings** → **Secrets and variables** → **Actions**
2. Найди секрет (например, `BOT_TOKEN`)
3. Нажми **"Update"**
4. Введи новое значение
5. Нажми **"Update secret"**

**Примечание:** После обновления секрета нужно пере-запустить workflow

---

## ✅ Checklist

### Подготовка
- [ ] Получен BOT_TOKEN от @BotFather
- [ ] Получен ADMIN_TG_ID от @userinfobot
- [ ] Открыт раздел Secrets в GitHub

### Настройка
- [ ] Добавлен секрет BOT_TOKEN
- [ ] Добавлен секрет ADMIN_TG_ID
- [ ] Секреты отображаются в списке

### Тестирование
- [ ] GitHub Actions включены
- [ ] Workflow запущен вручную
- [ ] Telegram уведомление получено
- [ ] Workflow показывает success

---

## 📚 Дополнительно

### Другие полезные секреты для проекта:

```bash
# OpenAI API
OPENAI_KEY              # API ключ для GPT

# Vercel
VERCEL_TOKEN            # Для автоматического деплоя

# Analytics
VITE_POSTHOG_KEY        # PostHog analytics

# Database
PB_ADMIN_EMAIL          # PocketBase admin
PB_ADMIN_PASSWORD       # PocketBase password
```

---

## 🔗 Полезные ссылки

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [@BotFather](https://t.me/BotFather)
- [@userinfobot](https://t.me/userinfobot)

---

**Статус:** ✅ Ready  
**Обновлено:** 2025-10-13  
**Следующий шаг:** Запустить Heartbeat Monitor

