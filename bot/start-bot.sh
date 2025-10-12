#!/bin/bash
# Скрипт для запуска и мониторинга бота

cd /Users/egor/Desktop/peach-mini/bot

echo "🤖 Запуск бота Peachmini..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Останавливаем старые процессы
pkill -f "node.*index.cjs" 2>/dev/null
sleep 1

# Запускаем бота
node index.cjs 2>&1 | while IFS= read -r line; do
    echo "[$(date '+%H:%M:%S')] $line"
done

