# 🚀 Настройка Ngrok для Peachmini

## ⚠️ Текущая ситуация

Cloudflared и localtunnel имеют проблемы с подключением (ошибки 530/503).
**Решение**: Использовать ngrok с токеном - надежно и стабильно.

---

## 📝 Быстрая настройка Ngrok

### Шаг 1: Получите токен

1. Откройте: https://dashboard.ngrok.com/signup
2. Зарегистрируйтесь (бесплатно)
3. После входа перейдите: https://dashboard.ngrok.com/get-started/your-authtoken
4. Скопируйте ваш authtoken

### Шаг 2: Настройте ngrok

```bash
# Добавьте ваш токен (замените YOUR_TOKEN на реальный)
ngrok config add-authtoken YOUR_TOKEN
```

**Пример:**
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl
```

### Шаг 3: Запустите туннель

```bash
# Остановите старые туннели
pkill -f "cloudflared"
pkill -f "localtunnel"
pkill -f "ngrok"

# Запустите ngrok
cd /Users/egor/Desktop/peach-mini
ngrok http 5173
```

Вы увидите:
```
ngrok

Session Status                online
Account                       your@email.com
Version                       3.30.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Шаг 4: Скопируйте URL

Из вывода выше скопируйте HTTPS URL: `https://abc123.ngrok-free.app`

### Шаг 5: Обновите .env

```bash
cd /Users/egor/Desktop/peach-mini

# Замените YOUR_NGROK_URL на реальный URL
sed -i '' 's|WEBAPP_URL=.*|WEBAPP_URL=https://abc123.ngrok-free.app|' .env

# Проверьте
grep "WEBAPP_URL" .env
```

### Шаг 6: Перезапустите бота

```bash
cd /Users/egor/Desktop/peach-mini/bot

# Остановите старого
pkill -f "node.*index.cjs"

# Запустите заново
node index.cjs
```

Должно появиться:
```
✅ Bot запустился — готов к общению с девушками!
✅ Меню команд установлено
🤖 Username: @Amourath_ai_bot
```

---

## 🎯 Автоматический скрипт

Создайте файл `/Users/egor/Desktop/peach-mini/start-with-ngrok.sh`:

```bash
#!/bin/bash
cd /Users/egor/Desktop/peach-mini

echo "🚀 Запуск Peachmini с Ngrok..."

# Остановить старые процессы
pkill -f "node.*vite" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null
pkill -f "localtunnel" 2>/dev/null
pkill -f "ngrok" 2>/dev/null
pkill -f "node.*index.cjs" 2>/dev/null
sleep 2

# Запустить WebApp
echo "▶️  Запуск WebApp..."
cd vite-project
node ./node_modules/vite/bin/vite.js --host 127.0.0.1 > /tmp/vite.log 2>&1 &
cd ..
sleep 3

# Запустить Ngrok
echo "▶️  Запуск Ngrok..."
ngrok http 5173 > /tmp/ngrok.log 2>&1 &
sleep 3

# Получить URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Не удалось получить URL от Ngrok"
    echo "Запустите ngrok вручную: ngrok http 5173"
    exit 1
fi

echo "✅ Ngrok URL: $NGROK_URL"

# Обновить .env
sed -i '' "s|WEBAPP_URL=.*|WEBAPP_URL=$NGROK_URL|" .env
echo "✅ .env обновлен"

# Запустить бота
echo "▶️  Запуск бота..."
cd bot
nohup node index.cjs > /tmp/bot.log 2>&1 &
cd ..

sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Всё запущено!"
echo "🔗 WebApp URL: $NGROK_URL"
echo "🤖 Бот: @Amourath_ai_bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

Сделайте исполняемым:
```bash
chmod +x /Users/egor/Desktop/peach-mini/start-with-ngrok.sh
```

Запустите:
```bash
./start-with-ngrok.sh
```

---

## ✅ Проверка

1. **Откройте Telegram** → @Amourath_ai_bot
2. **Отправьте** `/start`
3. **Нажмите** "🚀 Открыть Peachmini"
4. **WebApp откроется** без пароля!

---

## 🆚 Сравнение туннелей

| Туннель | Плюсы | Минусы | Статус |
|---------|-------|--------|--------|
| **Ngrok** | ✅ Стабильный, быстрый, без ошибок | ⚠️ Требует регистрации | ⭐ Рекомендуется |
| Cloudflared | Бесплатный, без регистрации | ❌ Ошибки 530 подключения | 🔴 Не работает |
| Localtunnel | Простой, без регистрации | ❌ Ошибки 503 | 🔴 Не работает |

---

## 📚 Дополнительно

### Проверить статус Ngrok:
```bash
curl http://localhost:4040/api/tunnels | python3 -m json.tool
```

### Веб-интерфейс Ngrok:
Откройте в браузере: http://localhost:4040

Там вы увидите:
- Все запросы к вашему WebApp
- Статистику
- Логи

### Остановить всё:
```bash
pkill -f "ngrok"
pkill -f "node.*vite"
pkill -f "node.*index.cjs"
```

---

## 🎉 Итог

После настройки Ngrok:

1. ✅ WebApp работает на `127.0.0.1:5173`
2. ✅ Ngrok проксирует на `https://xxx.ngrok-free.app`
3. ✅ Бот открывает WebApp **без пароля**
4. ✅ Всё стабильно и быстро работает

---

**Следующий шаг**: Получите токен ngrok и выполните Шаги 1-6 выше!

Made with 💜 for @Amourath_ai_bot

