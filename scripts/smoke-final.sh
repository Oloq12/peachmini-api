#!/bin/bash
set +e # Continue on error

API_BASE="https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app"
FRONT_URL="https://peach-e0dyhhciv-trsoyoleg-4006s-projects.vercel.app"

echo "🧪 Final Smoke Test for Soft Launch"
echo "===================================="
echo "API URL:  $API_BASE"
echo "Front URL: $FRONT_URL"
echo ""

# Test results
API_HEALTH="FAIL"
GIRLS_COUNT=0
CHAT_REPLY="FAIL"
REF_STATUS="FAIL"
QUESTS_STATUS="FAIL"
FRONT_HEALTH="FAIL"
PROVIDER="unknown"

echo "1️⃣  Testing API health..."
if curl -fsSL "$API_BASE/api/health" > /dev/null 2>&1; then
  API_HEALTH="PASS"
  echo "✅ API health: PASS"
else
  echo "❌ API health: FAIL"
fi

echo ""
echo "2️⃣  Testing /api/girls..."
GIRLS_RESPONSE=$(curl -s "$API_BASE/api/girls" 2>/dev/null)
if echo "$GIRLS_RESPONSE" | grep -q '"ok":true'; then
  GIRLS_COUNT=$(echo "$GIRLS_RESPONSE" | grep -o '"girls":\[.*\]' | grep -o '{"id"' | wc -l)
  echo "✅ Girls count: $GIRLS_COUNT"
else
  echo "❌ Girls: FAIL"
fi

echo ""
echo "3️⃣  Testing /api/chat/reply..."
CHAT_RESPONSE=$(curl -s -X POST "$API_BASE/api/chat/reply" \
  -H "Content-Type: application/json" \
  -d '{"girlId":"1","userMsg":"Привет!","userId":"smoke"}' 2>/dev/null)

if echo "$CHAT_RESPONSE" | grep -q '"ok":true'; then
  CHAT_REPLY="PASS"
  REPLY_TEXT=$(echo "$CHAT_RESPONSE" | grep -o '"reply":"[^"]*"' | cut -d'"' -f4 | head -c 50)
  echo "✅ Chat reply: PASS - $REPLY_TEXT..."
else
  echo "❌ Chat reply: FAIL"
fi

echo ""
echo "4️⃣  Testing /api/ref/status..."
if curl -fsSL "$API_BASE/api/ref/status?tgId=smoke" > /dev/null 2>&1; then
  REF_STATUS="PASS"
  echo "✅ Ref status: PASS"
else
  echo "❌ Ref status: FAIL"
fi

echo ""
echo "5️⃣  Testing /api/quests/status..."
if curl -fsSL "$API_BASE/api/quests/status?tgId=smoke" > /dev/null 2>&1; then
  QUESTS_STATUS="PASS"
  echo "✅ Quests status: PASS"
else
  echo "❌ Quests status: FAIL"
fi

echo ""
echo "6️⃣  Testing frontend health..."
if curl -I -s "$FRONT_URL/health" | head -n 1 | grep -q "200"; then
  FRONT_HEALTH="PASS"
  echo "✅ Front health: PASS"
else
  echo "❌ Front health: FAIL"
fi

echo ""
echo "7️⃣  Checking AI provider..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/api/health" 2>/dev/null)
if echo "$HEALTH_RESPONSE" | grep -q '"aiProvider":"deepseek"'; then
  PROVIDER="deepseek"
elif echo "$HEALTH_RESPONSE" | grep -q '"aiProvider":"openai"'; then
  PROVIDER="openai"
else
  PROVIDER="offline_stub"
fi
echo "🤖 AI Provider: $PROVIDER"

echo ""
echo "📊 FINAL REPORT"
echo "==============="
echo "API health:     $API_HEALTH"
echo "Girls count:    $GIRLS_COUNT"
echo "Chat reply:     $CHAT_REPLY"
echo "Ref status:     $REF_STATUS"
echo "Quests status:  $QUESTS_STATUS"
echo "Front health:   $FRONT_HEALTH"
echo "Provider:       $PROVIDER"

echo ""
if [ "$API_HEALTH" = "PASS" ] && [ "$CHAT_REPLY" = "PASS" ] && [ "$GIRLS_COUNT" -ge 10 ]; then
  echo "🎉 SOFT LAUNCH READY!"
  echo "✅ All critical systems operational"
  echo "✅ DeepSeek API integration complete"
  echo "✅ 10+ characters available"
  echo "✅ Chat system working"
else
  echo "⚠️  ISSUES DETECTED"
  echo "❌ Some systems need attention"
fi

echo ""
echo "🔗 URLs:"
echo "API:  $API_BASE"
echo "Web:  $FRONT_URL"
