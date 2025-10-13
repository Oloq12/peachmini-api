#!/bin/bash

# Final smoke test for Soft Launch
set -e

API_BASE="${API_BASE:-https://peach-mini.vercel.app}"
FRONT_URL="${FRONT_URL:-https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app}"

echo "🧪 FINAL SMOKE TEST - SOFT LAUNCH"
echo "=================================="
echo "API:  $API_BASE"
echo "Front: $FRONT_URL"
echo ""

# Results tracking
declare -A results

# Test 1: API Health
echo "1️⃣  Testing API health..."
if HEALTH_RESPONSE=$(curl -s "$API_BASE/api/health"); then
  if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
    results[health]="PASS"
    echo "✅ API health: PASS"
  else
    results[health]="FAIL"
    echo "❌ API health: FAIL"
  fi
else
  results[health]="FAIL"
  echo "❌ API health: FAIL"
fi

# Test 2: Girls count
echo "2️⃣  Testing girls count..."
if GIRLS_RESPONSE=$(curl -s "$API_BASE/api/girls"); then
  if echo "$GIRLS_RESPONSE" | grep -q '"ok":true'; then
    GIRLS_COUNT=$(echo "$GIRLS_RESPONSE" | grep -o '"id":"[^"]*"' | wc -l)
    if [ "$GIRLS_COUNT" -ge 10 ]; then
      results[girls]="PASS"
      echo "✅ Girls count: PASS ($GIRLS_COUNT)"
    else
      results[girls]="FAIL"
      echo "❌ Girls count: FAIL ($GIRLS_COUNT < 10)"
    fi
  else
    results[girls]="FAIL"
    echo "❌ Girls count: FAIL"
  fi
else
  results[girls]="FAIL"
  echo "❌ Girls count: FAIL"
fi

# Test 3: First girl by slug
echo "3️⃣  Testing first girl by slug..."
FIRST_SLUG="alice"
if GIRL_RESPONSE=$(curl -s "$API_BASE/api/girls/$FIRST_SLUG"); then
  if echo "$GIRL_RESPONSE" | grep -q '"ok":true'; then
    results[girl_slug]="PASS"
    echo "✅ Girl by slug: PASS"
  else
    results[girl_slug]="FAIL"
    echo "❌ Girl by slug: FAIL"
  fi
else
  results[girl_slug]="FAIL"
  echo "❌ Girl by slug: FAIL"
fi

# Test 4: Chat reply
echo "4️⃣  Testing chat reply..."
if CHAT_RESPONSE=$(curl -s -X POST "$API_BASE/api/chat/reply" \
  -H "Content-Type: application/json" \
  -d '{"userMsg":"Привет!","userId":"smoke","girlId":"1"}'); then
  if echo "$CHAT_RESPONSE" | grep -q '"ok":true'; then
    results[chat]="PASS"
    REPLY_TEXT=$(echo "$CHAT_RESPONSE" | grep -o '"reply":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Chat reply: PASS"
    echo "   Reply: ${REPLY_TEXT:0:50}..."
  else
    results[chat]="FAIL"
    echo "❌ Chat reply: FAIL"
  fi
else
  results[chat]="FAIL"
  echo "❌ Chat reply: FAIL"
fi

# Test 5: Referral status
echo "5️⃣  Testing referral status..."
if REF_RESPONSE=$(curl -s "$API_BASE/api/ref/status?tgId=smoke"); then
  if echo "$REF_RESPONSE" | grep -q '"ok":true'; then
    results[ref]="PASS"
    echo "✅ Ref status: PASS"
  else
    results[ref]="FAIL"
    echo "❌ Ref status: FAIL"
  fi
else
  results[ref]="FAIL"
  echo "❌ Ref status: FAIL"
fi

# Test 6: Quests status
echo "6️⃣  Testing quests status..."
if QUESTS_RESPONSE=$(curl -s "$API_BASE/api/quests/status?tgId=smoke"); then
  if echo "$QUESTS_RESPONSE" | grep -q '"ok":true'; then
    results[quests]="PASS"
    echo "✅ Quests status: PASS"
  else
    results[quests]="FAIL"
    echo "❌ Quests status: FAIL"
  fi
else
  results[quests]="FAIL"
  echo "❌ Quests status: FAIL"
fi

# Test 7: Frontend health
echo "7️⃣  Testing frontend health..."
if curl -I -s "$FRONT_URL/health" | head -n 1 | grep -q "200"; then
  results[front]="PASS"
  echo "✅ Front health: PASS"
elif curl -I -s "$FRONT_URL/" | head -n 1 | grep -q "200"; then
  results[front]="PASS"
  echo "✅ Front health: PASS (root)"
else
  results[front]="FAIL"
  echo "❌ Front health: FAIL"
fi

echo ""
echo "📊 FINAL REPORT"
echo "==============="
echo "API health: ${results[health]}"
echo "Girls count: $GIRLS_COUNT"
echo "Chat reply: ${results[chat]}"
echo "Ref status: ${results[ref]}"
echo "Quests status: ${results[quests]}"
echo "Front health: ${results[front]}"

# Determine provider
if echo "$HEALTH_RESPONSE" | grep -q '"aiProvider":"deepseek"'; then
  PROVIDER="deepseek"
elif echo "$HEALTH_RESPONSE" | grep -q '"ai":false'; then
  PROVIDER="offline_stub"
else
  PROVIDER="unknown"
fi
echo "Provider: $PROVIDER"

# Overall status
FAIL_COUNT=0
for result in "${results[@]}"; do
  if [ "$result" = "FAIL" ]; then
    ((FAIL_COUNT++))
  fi
done

echo ""
if [ $FAIL_COUNT -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED - READY FOR SOFT LAUNCH!"
  exit 0
else
  echo "⚠️  $FAIL_COUNT TESTS FAILED - NEEDS FIXES"
  exit 1
fi
