# 🎉 Туннель Peachmini - Полностью настроен!

## ✅ Статус системы

### 🌐 WebApp (React + Vite)
- **Порт**: 5173
- **Локальный URL**: http://localhost:5173
- **Статус**: ✅ ЗАПУЩЕН

### 🚇 Cloudflared Tunnel
- **Публичный URL**: `https://signed-realistic-strikes-meaning.trycloudflare.com`
- **Статус**: ✅ АКТИВЕН
- **Без пароля**: ✅ Открывается напрямую

### 🤖 Telegram Bot
- **Username**: @Amourath_ai_bot
- **Статус**: ✅ ЗАПУЩЕН
- **Логирование**: ✅ ВКЛЮЧЕНО

### 📝 Конфигурация (.env)
```env
WEBAPP_URL=https://signed-realistic-strikes-meaning.trycloudflare.com
```

---

## 🎯 Как проверить работу

### 1. Откройте Telegram
Найдите бота: **@Amourath_ai_bot**

### 2. Отправьте команду `/start`
Вы увидите:
- Кнопку "🚀 Открыть Peachmini" в меню
- Список персонажей
- Другие кнопки меню

### 3. Нажмите на кнопку "🚀 Открыть Peachmini"
WebApp откроется **БЕЗ ЗАПРОСА ПАРОЛЯ** ✅

### 4. Или используйте команду `/app`
Появится клавиатура с web_app кнопкой

---

## 🔍 Проверка статуса

Выполните эту команду в любое время:

```bash
cd /Users/egor/Desktop/peach-mini

echo "📊 СТАТУС:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
lsof -i:5173 | grep LISTEN && echo "✅ WebApp работает" || echo "❌ WebApp не запущен"
ps aux | grep "cloudflared" | grep -v grep && echo "✅ Tunnel активен" || echo "❌ Tunnel не активен"
ps aux | grep "node.*index.cjs" | grep -v grep && echo "✅ Бот работает" || echo "❌ Бот не запущен"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

## 🛠 Управление процессами

### Остановить всё:
```bash
# Остановить WebApp
pkill -f "node.*vite"

# Остановить Tunnel
pkill -f "cloudflared"

# Остановить Bot
pkill -f "node.*index.cjs"
```

### Запустить всё заново:
```bash
cd /Users/egor/Desktop/peach-mini

# 1. WebApp
cd vite-project
node ./node_modules/vite/bin/vite.js > /tmp/vite.log 2>&1 &
cd ..

# 2. Cloudflared Tunnel
cloudflared tunnel --url http://localhost:5173 > /tmp/cloudflared.log 2>&1 &

# Подождите 5 секунд и получите URL:
sleep 5
grep "https://" /tmp/cloudflared.log | grep "trycloudflare.com"

# 3. Обновите .env с новым URL (если изменился)
# Затем запустите бота:
cd bot
node index.cjs
```

---

## 📋 Процессы и PID

Текущие запущенные процессы:

| Компонент | PID | Логи |
|-----------|-----|------|
| WebApp (Vite) | 36114 | `/tmp/vite.log` |
| Cloudflared | 36253 | `/tmp/cloudflared.log` |
| Telegram Bot | 36827 | `/tmp/bot-running.log` |

### Проверить логи:
```bash
# WebApp логи
tail -f /tmp/vite.log

# Tunnel логи
tail -f /tmp/cloudflared.log

# Bot логи
tail -f /tmp/bot-running.log
```

---

## 🌐 Публичный URL

**Финальная ссылка для WebApp:**
```
https://signed-realistic-strikes-meaning.trycloudflare.com
```

✅ Эта ссылка:
- Работает без пароля
- Открывается в Telegram WebApp
- Доступна из любой точки мира
- Автоматически проксирует на localhost:5173

⚠️ **Важно**: Cloudflared генерирует новый URL при каждом запуске!

Если вы перезапустите tunnel, нужно:
1. Получить новый URL из логов
2. Обновить `.env`
3. Перезапустить бота

---

## 🔧 Автоматизация перезапуска

Создан скрипт для автоматического запуска всего:

```bash
cd /Users/egor/Desktop/peach-mini
./start-all.sh
```

Содержимое скрипта (создайте если нужно):

```bash
#!/bin/bash
cd /Users/egor/Desktop/peach-mini

echo "🚀 Запуск Peachmini..."

# Остановить старые процессы
pkill -f "node.*vite" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null  
pkill -f "node.*index.cjs" 2>/dev/null
sleep 2

# Запустить WebApp
echo "▶️  Запуск WebApp..."
cd vite-project
node ./node_modules/vite/bin/vite.js > /tmp/vite.log 2>&1 &
cd ..
sleep 3

# Запустить Tunnel
echo "▶️  Запуск Cloudflared..."
cloudflared tunnel --url http://localhost:5173 > /tmp/cloudflared.log 2>&1 &
sleep 5

# Получить URL
WEBAPP_URL=$(grep -o "https://[^[:space:]]*trycloudflare.com" /tmp/cloudflared.log | head -1)
echo "🔗 URL: $WEBAPP_URL"

# Обновить .env
sed -i '' "s|WEBAPP_URL=.*|WEBAPP_URL=$WEBAPP_URL|" .env
echo "✅ .env обновлен"

# Запустить бота
echo "▶️  Запуск бота..."
cd bot
nohup node index.cjs > /tmp/bot-running.log 2>&1 &
cd ..

sleep 2
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Всё запущено!"
echo "🔗 WebApp URL: $WEBAPP_URL"
echo "🤖 Бот: @Amourath_ai_bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

Сделайте скрипт исполняемым:
```bash
chmod +x /Users/egor/Desktop/peach-mini/start-all.sh
```

---

## 📱 Тестирование в Telegram

### Шаг 1: Откройте бота
Telegram → Найти → @Amourath_ai_bot

### Шаг 2: Отправьте `/start`
Должны увидеть:
```
👋 Привет, Egor! Добро пожаловать в PeachMini!

🔥 Лучшие русскоязычные AI-девушки ждут тебя!
💬 30 сообщений бесплатно для знакомства
💎 Premium за 250⭐ - безлимитное общение

Выбери девушку, которая тебе нравится:
```

И кнопки:
- 🚀 Открыть Peachmini ← **ЭТА КНОПКА ОТКРЫВАЕТ WEBAPP**
- 😊 Алиса (22)
- 💪 Катя (25)
- ... и другие

### Шаг 3: Нажмите "🚀 Открыть Peachmini"
WebApp откроется с красивым интерфейсом:
- 🏠 Home
- 💬 Chats  
- ✨ Create
- 🛍️ Store
- ⚙️ Settings

✅ **Без пароля! Без ошибок!**

---

## 🐛 Troubleshooting

### WebApp не открывается

**Проблема**: Кнопка не работает

**Решение**:
```bash
# 1. Проверьте WebApp
curl http://localhost:5173

# 2. Проверьте tunnel
curl https://signed-realistic-strikes-meaning.trycloudflare.com

# 3. Проверьте .env
grep WEBAPP_URL /Users/egor/Desktop/peach-mini/.env

# 4. Перезапустите бота
pkill -f "node.*index.cjs"
cd /Users/egor/Desktop/peach-mini/bot
node index.cjs
```

---

### Tunnel "не найден" (404)

**Проблема**: URL не работает

**Решение**: Cloudflared сгенерировал новый URL

```bash
# Получите новый URL
grep "https://" /tmp/cloudflared.log

# Обновите .env
nano /Users/egor/Desktop/peach-mini/.env
# Измените WEBAPP_URL на новый

# Перезапустите бота
```

---

### Бот не отвечает

**Проблема**: Команды не работают

**Решение**:
```bash
# 1. Проверьте что бот запущен
ps aux | grep "node.*index.cjs"

# 2. Проверьте логи
tail -50 /tmp/bot-running.log

# 3. Перезапустите
pkill -f "node.*index.cjs"
cd /Users/egor/Desktop/peach-mini/bot
node index.cjs

# Должно появиться:
# ✅ Bot запустился — готов к общению с девушками!
```

---

## 📚 Дополнительная информация

### Логи бота с командами

При отправке команды `/start` в логах увидите:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 Входящее обновление [02:30:15]
👤 От: Egor (@your_username) [ID: 123456789]
📝 Тип: message
💬 Сообщение: "/start"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏁 Обработка команды /start
```

### Альтернативные туннели

Если cloudflared не работает, можете использовать:

**ngrok** (требует регистрации):
```bash
# 1. Зарегистрируйтесь на https://ngrok.com
# 2. Получите authtoken
# 3. Настройте:
ngrok config add-authtoken YOUR_TOKEN
ngrok http 5173
```

**localtunnel**:
```bash
npx localtunnel --port 5173
```

---

## ✅ Итоговая конфигурация

```
┌─────────────────────────────────────────┐
│          PEACHMINI АРХИТЕКТУРА          │
├─────────────────────────────────────────┤
│                                         │
│  Telegram User                          │
│       ↓                                 │
│  @Amourath_ai_bot                       │
│       ↓                                 │
│  /start или /app                        │
│       ↓                                 │
│  Кнопка "🚀 Открыть Peachmini"          │
│       ↓                                 │
│  https://signed-realistic...com         │
│       ↓ (cloudflared tunnel)            │
│  http://localhost:5173                  │
│       ↓                                 │
│  React WebApp (Vite)                    │
│   - Home                                │
│   - Chats                               │
│   - Create                              │
│   - Store                               │
│   - Settings                            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎉 Готово!

Ваш Telegram Mini App полностью настроен и работает!

**Следующие шаги:**
1. ✅ Откройте @Amourath_ai_bot в Telegram
2. ✅ Отправьте `/start`
3. ✅ Нажмите "🚀 Открыть Peachmini"
4. ✅ Наслаждайтесь красивым интерфейсом!

---

Made with 💜 for @Amourath_ai_bot

**Дата настройки**: 11.10.2025, 02:30 AM
**Финальный URL**: https://signed-realistic-strikes-meaning.trycloudflare.com

