#!/bin/bash
# Автоматический запуск всей системы Peachmini

cd /Users/egor/Desktop/peach-mini

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Запуск системы Peachmini..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Остановить старые процессы
echo "🛑 Остановка старых процессов..."
pkill -f "node.*vite" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null  
pkill -f "node.*index.cjs" 2>/dev/null
sleep 2

# Запустить WebApp
echo "▶️  Запуск WebApp (Vite)..."
cd vite-project
node ./node_modules/vite/bin/vite.js > /tmp/vite.log 2>&1 &
VITE_PID=$!
cd ..
echo "   ✅ WebApp запущен (PID: $VITE_PID)"
sleep 3

# Запустить Tunnel
echo "▶️  Запуск Cloudflared Tunnel..."
cloudflared tunnel --url http://localhost:5173 > /tmp/cloudflared.log 2>&1 &
TUNNEL_PID=$!
echo "   ✅ Tunnel запущен (PID: $TUNNEL_PID)"
sleep 5

# Получить URL
WEBAPP_URL=$(grep -o "https://[^[:space:]]*trycloudflare.com" /tmp/cloudflared.log | head -1)

if [ -z "$WEBAPP_URL" ]; then
    echo "   ❌ Не удалось получить URL туннеля"
    echo "   Проверьте логи: tail /tmp/cloudflared.log"
    exit 1
fi

echo "   🔗 Публичный URL: $WEBAPP_URL"

# Обновить .env
echo "▶️  Обновление .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
sed -i '' "s|WEBAPP_URL=.*|WEBAPP_URL=$WEBAPP_URL|" .env
echo "   ✅ .env обновлен (резервная копия создана)"

# Запустить бота
echo "▶️  Запуск Telegram бота..."
cd bot
nohup node index.cjs > /tmp/bot-running.log 2>&1 &
BOT_PID=$!
cd ..
echo "   ✅ Бот запущен (PID: $BOT_PID)"

sleep 3

# Финальный отчет
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ СИСТЕМА PEACHMINI ЗАПУЩЕНА!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Статус компонентов:"
echo "   🌐 WebApp:    http://localhost:5173"
echo "   🚇 Tunnel:    $WEBAPP_URL"
echo "   🤖 Bot:       @Amourath_ai_bot"
echo ""
echo "📋 Process IDs:"
echo "   WebApp:  $VITE_PID"
echo "   Tunnel:  $TUNNEL_PID"
echo "   Bot:     $BOT_PID"
echo ""
echo "📝 Логи:"
echo "   WebApp:  tail -f /tmp/vite.log"
echo "   Tunnel:  tail -f /tmp/cloudflared.log"
echo "   Bot:     tail -f /tmp/bot-running.log"
echo ""
echo "🎯 Следующие шаги:"
echo "   1. Откройте Telegram → @Amourath_ai_bot"
echo "   2. Отправьте команду: /start"
echo "   3. Нажмите: 🚀 Открыть Peachmini"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

