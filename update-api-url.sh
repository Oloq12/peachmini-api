#!/bin/bash
# Скрипт для обновления API URL на Render

echo "=== 🔄 ОБНОВЛЕНИЕ API URL ===="
echo ""

# Получаем Render URL от пользователя
read -p "Введи URL Render API (например: https://peachmini-api.onrender.com): " RENDER_URL

if [ -z "$RENDER_URL" ]; then
  echo "❌ URL не может быть пустым!"
  exit 1
fi

echo ""
echo "1. Обновляю peach-web/.env..."
cat > peach-web/.env << EOF
VITE_API_URL=$RENDER_URL
EOF

echo "✅ peach-web/.env обновлен"
echo ""
echo "2. Обновляю .env (корень)..."
sed -i '' "s|API_URL=.*|API_URL=$RENDER_URL|" .env
sed -i '' "s|PB_URL=.*|PB_URL=http://127.0.0.1:8090|" .env

echo "✅ .env обновлен"
echo ""
echo "3. Пересобираю фронт..."
cd peach-web
npm run build

echo ""
echo "4. Деплою на Vercel..."
npx vercel --prod --yes

echo ""
echo "✅ ГОТОВО!"
echo ""
echo "📊 ИТОГ:"
echo "• API URL: $RENDER_URL"
echo "• Frontend: https://peach-mini.vercel.app"
echo ""
echo "🧪 Проверь:"
echo "curl $RENDER_URL/api/health"

