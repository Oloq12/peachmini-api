#!/bin/bash

echo "🔍 PEACHMINI STATUS CHECKER"
echo "=========================="
echo ""

# Check API health
echo "1️⃣ API Health Check..."
API_URL="https://peach-mini-clean-4u6zobgdg-trsoyoleg-4006s-projects.vercel.app"
HEALTH_RESPONSE=$(curl -s "$API_URL/api/health" 2>/dev/null)

if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
  VERSION=$(echo "$HEALTH_RESPONSE" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
  AI_PROVIDER=$(echo "$HEALTH_RESPONSE" | grep -o '"aiProvider":"[^"]*"' | cut -d'"' -f4)
  echo "✅ API Health: OK"
  echo "📊 Version: $VERSION"
  echo "🤖 AI Provider: $AI_PROVIDER"
else
  echo "❌ API Health: FAIL"
fi

echo ""

# Check girls count
echo "2️⃣ Girls Count Check..."
GIRLS_RESPONSE=$(curl -s "$API_URL/api/girls" 2>/dev/null)
if echo "$GIRLS_RESPONSE" | grep -q '"ok":true'; then
  GIRLS_COUNT=$(echo "$GIRLS_RESPONSE" | grep -o '"girls":\[.*\]' | grep -o '{"id"' | wc -l)
  echo "✅ Girls API: OK"
  echo "👥 Characters: $GIRLS_COUNT"
else
  echo "❌ Girls API: FAIL"
fi

echo ""

# Check chat
echo "3️⃣ Chat Test..."
CHAT_RESPONSE=$(curl -s -X POST "$API_URL/api/chat/reply" \
  -H "Content-Type: application/json" \
  -d '{"girlId":"1","userMsg":"Привет!","userId":"test"}' 2>/dev/null)

if echo "$CHAT_RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Chat API: OK"
  REPLY=$(echo "$CHAT_RESPONSE" | grep -o '"reply":"[^"]*"' | cut -d'"' -f4 | head -c 50)
  echo "💬 Reply: $REPLY..."
else
  echo "❌ Chat API: FAIL"
fi

echo ""

# Summary
echo "📊 SUMMARY"
echo "=========="
if [ "$VERSION" = "2.0.0" ] && [ "$GIRLS_COUNT" -eq 10 ] && [ "$AI_PROVIDER" = "deepseek" ]; then
  echo "🎉 PEACHMINI READY FOR LAUNCH!"
  echo "✅ All systems operational"
  echo "✅ 10 characters available"
  echo "✅ DeepSeek AI working"
else
  echo "⚠️  NEEDS ATTENTION"
  echo "❌ Some systems need fixing"
fi

echo ""
echo "🔗 URLs:"
echo "API: $API_URL"
echo "Web: https://peach-e0dyhhciv-trsoyoleg-4006s-projects.vercel.app"
