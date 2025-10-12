# 🤖 Руководство по запуску бота

## ✅ Бот готов к работе!

**Имя бота**: @Amourath_ai_bot
**ID**: 7617756531
**Статус**: Настроен и готов к запуску

---

## 🚀 Способы запуска

### Способ 1: Интерактивный запуск (с логами в терминале)

```bash
cd /Users/egor/Desktop/peach-mini/bot
node index.cjs
```

**Что увидите:**
```
✅ Bot запустился — готов к общению с девушками!
✅ Меню команд установлено
```

**Как остановить:** `Ctrl+C`

**Плюсы:** Видны все логи в реальном времени
**Минусы:** Терминал занят, при закрытии бот остановится

---

### Способ 2: Фоновый запуск (через скрипт)

```bash
cd /Users/egor/Desktop/peach-mini/bot
./start-bot.sh
```

Или в фоне:
```bash
cd /Users/egor/Desktop/peach-mini/bot
nohup node index.cjs > bot.log 2>&1 &
```

**Как проверить статус:**
```bash
ps aux | grep "node.*index.cjs" | grep -v grep
```

**Как остановить:**
```bash
pkill -f "node.*index.cjs"
```

**Как смотреть логи:**
```bash
tail -f /Users/egor/Desktop/peach-mini/bot/bot.log
```

---

### Способ 3: С автозапуском (PM2)

Установите PM2:
```bash
npm install -g pm2
```

Запустите бота:
```bash
cd /Users/egor/Desktop/peach-mini/bot
pm2 start index.cjs --name peachmini-bot
```

**Полезные команды PM2:**
```bash
pm2 status              # Статус
pm2 logs peachmini-bot  # Логи в реальном времени
pm2 restart peachmini-bot  # Перезапуск
pm2 stop peachmini-bot     # Остановить
pm2 delete peachmini-bot   # Удалить из PM2
pm2 save               # Сохранить конфигурацию
pm2 startup            # Автозапуск при старте системы
```

---

## 🔍 Диагностика проблем

### Проблема: "Бот не реагирует на команды"

#### Шаг 1: Проверьте, запущен ли бот
```bash
ps aux | grep "node.*index.cjs" | grep -v grep
```

**Если не запущен** → Запустите способом 1 или 2

---

#### Шаг 2: Проверьте webhook
```bash
cd /Users/egor/Desktop/peach-mini
BOT_TOKEN=$(grep "^BOT_TOKEN=" .env | cut -d '=' -f2 | tr -d ' ')
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool
```

**Если `url` не пустой** → Удалите webhook:
```bash
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook"
```

Затем перезапустите бота.

---

#### Шаг 3: Проверьте токен
```bash
cd /Users/egor/Desktop/peach-mini
BOT_TOKEN=$(grep "^BOT_TOKEN=" .env | cut -d '=' -f2 | tr -d ' ')
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe" | python3 -m json.tool
```

**Должно вернуть:**
```json
{
    "ok": true,
    "result": {
        "username": "Amourath_ai_bot",
        ...
    }
}
```

**Если ошибка** → Проверьте `BOT_TOKEN` в `.env`

---

#### Шаг 4: Проверьте логи
```bash
# Если запущен через nohup:
tail -50 /Users/egor/Desktop/peach-mini/bot/bot.log

# Если запущен через PM2:
pm2 logs peachmini-bot --lines 50
```

---

#### Шаг 5: Тест обновлений
Отправьте боту `/start` в Telegram, затем:
```bash
cd /Users/egor/Desktop/peach-mini
BOT_TOKEN=$(grep "^BOT_TOKEN=" .env | cut -d '=' -f2 | tr -d ' ')
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=5" | python3 -m json.tool
```

**Должно показать ваше сообщение** → Значит бот получает обновления

---

### Проблема: "WebApp не открывается"

#### Проверьте WEBAPP_URL:
```bash
grep "WEBAPP_URL" /Users/egor/Desktop/peach-mini/.env
```

**Должно быть:**
- `https://...` (HTTPS обязателен для Telegram)
- Не `http://localhost` (не работает в Telegram)

**Для локальной разработки используйте ngrok:**
```bash
# В одном терминале:
cd /Users/egor/Desktop/peach-mini/vite-project
npm run dev

# В другом терминале:
ngrok http 5173

# Скопируйте HTTPS URL из ngrok и обновите .env:
# WEBAPP_URL=https://xxxx.ngrok-free.app
```

Затем перезапустите бота.

---

## 📋 Чек-лист перед запуском

- [ ] Файл `.env` существует
- [ ] `BOT_TOKEN` заполнен в `.env`
- [ ] `WEBAPP_URL` указан (для WebApp функций)
- [ ] Webhook не настроен (проверьте командой выше)
- [ ] Бот не запущен в другом месте
- [ ] Node.js установлен (`node --version`)
- [ ] Зависимости установлены (`cd bot && npm install`)

---

## 🎯 Быстрый запуск (команды по порядку)

```bash
# 1. Перейдите в папку бота
cd /Users/egor/Desktop/peach-mini/bot

# 2. Остановите старые процессы (если есть)
pkill -f "node.*index.cjs"

# 3. Запустите бота
node index.cjs

# Должно появиться:
# ✅ Bot запустился — готов к общению с девушками!
# ✅ Меню команд установлено

# 4. Откройте Telegram и найдите бота: @Amourath_ai_bot

# 5. Отправьте команду: /start

# 6. Должна появиться кнопка "🚀 Открыть Peachmini"
```

---

## 🔧 Полезные команды

### Проверить статус бота
```bash
ps aux | grep "node.*index.cjs" | grep -v grep
```

### Остановить бота
```bash
pkill -f "node.*index.cjs"
```

### Перезапустить бота
```bash
pkill -f "node.*index.cjs" && sleep 1 && cd /Users/egor/Desktop/peach-mini/bot && node index.cjs
```

### Проверить переменные окружения
```bash
cd /Users/egor/Desktop/peach-mini
cat .env
```

### Тест API бота
```bash
cd /Users/egor/Desktop/peach-mini
BOT_TOKEN=$(grep "^BOT_TOKEN=" .env | cut -d '=' -f2 | tr -d ' ')
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe" | python3 -m json.tool
```

---

## 💡 Рекомендации

### Для разработки:
✅ Используйте **Способ 1** (интерактивный запуск)
✅ Видны все логи и ошибки

### Для тестирования:
✅ Используйте **Способ 2** (фоновый запуск)
✅ Можно работать в других терминалах

### Для production:
✅ Используйте **PM2** (способ 3)
✅ Автоматический перезапуск при падении
✅ Автозапуск при старте сервера
✅ Удобный просмотр логов

---

## 🆘 Если ничего не помогает

1. Проверьте логи:
   ```bash
   cd /Users/egor/Desktop/peach-mini/bot
   node index.cjs 2>&1 | tee debug.log
   ```

2. Проверьте файл `.env`:
   ```bash
   cat /Users/egor/Desktop/peach-mini/.env
   ```

3. Проверьте версии:
   ```bash
   node --version  # Должна быть >= 14
   npm --version
   ```

4. Переустановите зависимости:
   ```bash
   cd /Users/egor/Desktop/peach-mini/bot
   rm -rf node_modules package-lock.json
   npm install
   ```

---

Made with 💜 for @Amourath_ai_bot

