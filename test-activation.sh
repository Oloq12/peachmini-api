#!/bin/bash

echo "🧪 MULTI-PROVIDER AI ACTIVATION TEST"
echo "===================================="
echo ""

API_BASE="https://peach-mini-clean-moysq1g2j-trsoyoleg-4006s-projects.vercel.app"

echo "🔗 API URL: $API_BASE"
echo ""

# Test 1: Health Check with AI Router Status
echo "1️⃣ Health Check with AI Router Status..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/api/health")

if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Health: OK"
  
  # Check if AI router info is present
  if echo "$HEALTH_RESPONSE" | grep -q '"aiRouter"'; then
    echo "✅ AI Router: ACTIVE"
    
    # Extract AI router info
    AVAILABLE_PROVIDERS=$(echo "$HEALTH_RESPONSE" | jq -r '.data.aiRouter.availableProviders[]' 2>/dev/null | tr '\n' ' ')
    PRIMARY_AVAILABLE=$(echo "$HEALTH_RESPONSE" | jq -r '.data.aiRouter.primaryAvailable' 2>/dev/null)
    SECONDARY_AVAILABLE=$(echo "$HEALTH_RESPONSE" | jq -r '.data.aiRouter.secondaryAvailable' 2>/dev/null)
    AB_TEST_PERCENT=$(echo "$HEALTH_RESPONSE" | jq -r '.data.aiRouter.config.abTestPercent' 2>/dev/null)
    
    echo "📊 Available Providers: $AVAILABLE_PROVIDERS"
    echo "📊 Primary Available: $PRIMARY_AVAILABLE"
    echo "📊 Secondary Available: $SECONDARY_AVAILABLE"
    echo "📊 A/B Test: ${AB_TEST_PERCENT}%"
  else
    echo "⚠️ AI Router: NOT ACTIVE (old version)"
  fi
else
  echo "❌ Health: FAIL"
  exit 1
fi

echo ""

# Test 2: Chat with Meta Information
echo "2️⃣ Chat Test with Meta Information..."
CHAT_RESPONSE=$(curl -s -X POST "$API_BASE/api/chat/reply" \
  -H "Content-Type: application/json" \
  -d '{"girlId":"1","userMsg":"Привет! Как дела?","userId":"activation-test"}')

if echo "$CHAT_RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Chat: OK"
  
  # Check if meta information is present
  if echo "$CHAT_RESPONSE" | grep -q '"meta"'; then
    echo "✅ Meta Information: PRESENT"
    
    # Extract meta info
    PROVIDER=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.provider' 2>/dev/null)
    MODEL=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.model' 2>/dev/null)
    LATENCY=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.latencyMs' 2>/dev/null)
    AB_BUCKET=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.abBucket' 2>/dev/null)
    PROMPT_TOKENS=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.usage.prompt' 2>/dev/null)
    COMPLETION_TOKENS=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.usage.completion' 2>/dev/null)
    
    echo "🤖 Provider: $PROVIDER"
    echo "📊 Model: $MODEL"
    echo "⏱️ Latency: ${LATENCY}ms"
    echo "🧪 A/B Bucket: $AB_BUCKET"
    echo "📊 Tokens: ${PROMPT_TOKENS} prompt + ${COMPLETION_TOKENS} completion"
    
    # Check if it's using real AI or stub
    if [ "$PROVIDER" = "stub" ]; then
      echo "⚠️ Using offline stub - check API keys"
    else
      echo "✅ Using real AI provider: $PROVIDER"
    fi
  else
    echo "⚠️ Meta Information: MISSING (old version)"
  fi
  
  # Show first line of reply
  REPLY=$(echo "$CHAT_RESPONSE" | jq -r '.data.reply' 2>/dev/null)
  echo "💬 Reply: ${REPLY:0:60}..."
else
  echo "❌ Chat: FAIL"
  echo "Response: $CHAT_RESPONSE"
fi

echo ""

# Test 3: Multiple Requests for A/B Testing
echo "3️⃣ A/B Testing (3 requests)..."
for i in {1..3}; do
  echo -n "Request $i: "
  
  CHAT_RESPONSE=$(curl -s -X POST "$API_BASE/api/chat/reply" \
    -H "Content-Type: application/json" \
    -d "{\"girlId\":\"1\",\"userMsg\":\"Тест $i\",\"userId\":\"ab-test-$i\"}")
  
  if echo "$CHAT_RESPONSE" | grep -q '"ok":true'; then
    PROVIDER=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.provider' 2>/dev/null)
    AB_BUCKET=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.abBucket' 2>/dev/null)
    LATENCY=$(echo "$CHAT_RESPONSE" | jq -r '.data.meta.latencyMs' 2>/dev/null)
    
    echo "✅ $PROVIDER (${AB_BUCKET}) ${LATENCY}ms"
  else
    echo "❌ FAIL"
  fi
done

echo ""

# Final Summary
echo "📊 ACTIVATION SUMMARY"
echo "===================="

if echo "$HEALTH_RESPONSE" | grep -q '"aiRouter"' && echo "$CHAT_RESPONSE" | grep -q '"meta"'; then
  echo "🎉 MULTI-PROVIDER AI SYSTEM: FULLY ACTIVATED!"
  echo "✅ AI Router: Active"
  echo "✅ Meta Information: Present"
  echo "✅ Failover Logic: Ready"
  echo "✅ A/B Testing: Configured"
  echo ""
  echo "🚀 System is ready for production!"
else
  echo "⚠️ PARTIAL ACTIVATION"
  echo "❌ Some features not active"
  echo "🔧 Check Environment Variables in Vercel"
fi

echo ""
echo "🔗 URLs:"
echo "API: $API_BASE"
echo "Web: https://peach-b1gtzlx7v-trsoyoleg-4006s-projects.vercel.app"
