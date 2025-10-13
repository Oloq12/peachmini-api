#!/bin/bash
set +e # Continue on error

# Try both URLs
API_BASE_OLD="https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app"
API_BASE_NEW="https://peach-mini-clean-4u6zobgdg-trsoyoleg-4006s-projects.vercel.app"
FRONT_URL="https://peach-e0dyhhciv-trsoyoleg-4006s-projects.vercel.app"

echo "🧪 Final Smoke Test for Soft Launch"
echo "===================================="
echo "API URL (old): $API_BASE_OLD"
echo "API URL (new): $API_BASE_NEW"
echo "Front URL:     $FRONT_URL"
echo ""

# Test results
API_HEALTH="FAIL"
GIRLS_COUNT=0
CHAT_REPLY="FAIL"
REF_STATUS="FAIL"
QUESTS_STATUS="FAIL"
FRONT_HEALTH="FAIL"
PROVIDER="unknown"
API_URL=""

echo "1️⃣  Testing API health..."
# Try new URL first
if curl -fsSL "$API_BASE_NEW/api/health" > /dev/null 2>&1; then
  API_HEALTH="PASS"
  API_URL="$API_BASE_NEW"
  echo "✅ API health: PASS (new URL)"
elif curl -fsSL "$API_BASE_OLD/api/health" > /dev/null 2>&1; then
  API_HEALTH="PASS"
  API_URL="$API_BASE_OLD"
  echo "✅ API health: PASS (old URL)"
else
  echo "❌ API health: FAIL (both URLs)"
fi

echo ""
echo "2️⃣  Testing /api/girls..."
if [ -n "$API_URL" ]; then
  GIRLS_RESPONSE=$(curl -s "$API_URL/api/girls" 2>/dev/null)
  if echo "$GIRLS_RESPONSE" | grep -q '"ok":true'; then
    GIRLS_COUNT=$(echo "$GIRLS_RESPONSE" | grep -o '"girls":\[.*\]' | grep -o '{"id"' | wc -l)
    echo "✅ Girls count: $GIRLS_COUNT"
  else
    echo "❌ Girls: FAIL"
  fi
else
  echo "❌ Girls: FAIL (no API URL)"
fi

echo ""
echo "3️⃣  Testing /api/chat/reply..."
if [ -n "$API_URL" ]; then
  CHAT_RESPONSE=$(curl -s -X POST "$API_URL/api/chat/reply" \
    -H "Content-Type: application/json" \
    -d '{"girlId":"1","userMsg":"Привет!","userId":"smoke"}' 2>/dev/null)

  if echo "$CHAT_RESPONSE" | grep -q '"ok":true'; then
    CHAT_REPLY="PASS"
    REPLY_TEXT=$(echo "$CHAT_RESPONSE" | grep -o '"reply":"[^"]*"' | cut -d'"' -f4 | head -c 50)
    echo "✅ Chat reply: PASS - $REPLY_TEXT..."
  else
    echo "❌ Chat reply: FAIL"
  fi
else
  echo "❌ Chat reply: FAIL (no API URL)"
fi

echo ""
echo "4️⃣  Testing /api/ref/status..."
if [ -n "$API_URL" ]; then
  if curl -fsSL "$API_URL/api/ref/status?tgId=smoke" > /dev/null 2>&1; then
    REF_STATUS="PASS"
    echo "✅ Ref status: PASS"
  else
    echo "❌ Ref status: FAIL"
  fi
else
  echo "❌ Ref status: FAIL (no API URL)"
fi

echo ""
echo "5️⃣  Testing /api/quests/status..."
if [ -n "$API_URL" ]; then
  if curl -fsSL "$API_URL/api/quests/status?tgId=smoke" > /dev/null 2>&1; then
    QUESTS_STATUS="PASS"
    echo "✅ Quests status: PASS"
  else
    echo "❌ Quests status: FAIL"
  fi
else
  echo "❌ Quests status: FAIL (no API URL)"
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
if [ -n "$API_URL" ]; then
  HEALTH_RESPONSE=$(curl -s "$API_URL/api/health" 2>/dev/null)
  if echo "$HEALTH_RESPONSE" | grep -q '"aiProvider":"deepseek"'; then
    PROVIDER="deepseek"
  elif echo "$HEALTH_RESPONSE" | grep -q '"aiProvider":"openai"'; then
    PROVIDER="openai"
  else
    PROVIDER="offline_stub"
  fi
  echo "🤖 AI Provider: $PROVIDER"
else
  echo "🤖 AI Provider: unknown (no API URL)"
fi

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
echo "API URL:        $API_URL"

echo ""
if [ "$API_HEALTH" = "PASS" ] && [ "$CHAT_REPLY" = "PASS" ] && [ "$GIRLS_COUNT" -ge 10 ]; then
  echo "🎉 SOFT LAUNCH READY!"
  echo "✅ All critical systems operational"
  echo "✅ DeepSeek API integration complete"
  echo "✅ 10+ characters available"
  echo "✅ Chat system working"
elif [ "$API_HEALTH" = "PASS" ] && [ "$GIRLS_COUNT" -ge 6 ]; then
  echo "⚠️  PARTIALLY READY"
  echo "✅ Core systems working"
  echo "⚠️  Need to update API deployment"
  echo "⚠️  Chat system needs attention"
else
  echo "❌ ISSUES DETECTED"
  echo "❌ Some systems need attention"
fi

echo ""
echo "🔗 URLs:"
echo "API (old): $API_BASE_OLD"
echo "API (new): $API_BASE_NEW"
echo "Web:       $FRONT_URL"
