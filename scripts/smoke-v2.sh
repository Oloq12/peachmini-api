#!/bin/bash

# Quick smoke test for release validation
# Usage: VITE_API_URL=... WEBAPP_URL=... bash scripts/smoke-release.sh

set -e

VITE_API_URL="${VITE_API_URL:-https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app}"
WEBAPP_URL="${WEBAPP_URL:-https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app}"

echo "🧪 Quick Smoke Test for Release"
echo "================================="
echo "API URL:  $VITE_API_URL"
echo "Web URL:  $WEBAPP_URL"
echo ""

# Test 1: API Health
echo "1️⃣  Testing API health..."
curl -fsSL "$VITE_API_URL/api/health" || echo "❌ API health FAIL"
echo ""

# Test 2: Girls endpoint
echo "2️⃣  Testing /api/girls..."
curl -fsSL "$VITE_API_URL/api/girls" | head -c 400 || echo "❌ girls FAIL"
echo ""

# Test 3: Chat endpoint
echo "3️⃣  Testing /api/chat/reply..."
CHAT_RESPONSE=$(curl -s -X POST "$VITE_API_URL/api/chat/reply" \
  -H "Content-Type: application/json" \
  -d '{"girlId":"1","userMsg":"Привет!","userId":"smoke"}')
echo "$CHAT_RESPONSE" | head -c 400
if echo "$CHAT_RESPONSE" | grep -q '"ok":true'; then
  echo " ✅ Chat OK"
else
  echo " ❌ Chat FAIL"
fi
echo ""

# Test 4: Frontend health
echo "4️⃣  Testing frontend health..."
curl -I -s "$WEBAPP_URL/health" | head -n 1 || echo "❌ front health FAIL"
echo ""

echo "✅ Smoke test complete!"

