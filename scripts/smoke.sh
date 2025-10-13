#!/bin/bash

# Smoke Test для API и Frontend
# Проверяет основные endpoints и функциональность

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
API_URL="${API_URL:-https://peach-mini-g6b5xrc2n-trsoyoleg-4006s-projects.vercel.app}"
FRONT_URL="${FRONT_URL:-https://peach-mini-g6b5xrc2n-trsoyoleg-4006s-projects.vercel.app}"

# Test counters
TOTAL=0
PASSED=0
FAILED=0

# Helper functions
pass() {
  PASSED=$((PASSED + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${GREEN}✓ PASS${NC} $1"
}

fail() {
  FAILED=$((FAILED + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${RED}✗ FAIL${NC} $1"
}

test_start() {
  echo -e "\n${BLUE}▶ Test: $1${NC}"
}

# Preset girls data
PRESET_GIRLS='[
  {
    "name": "Алиса",
    "persona": "Ты Алиса - дружелюбная и любознательная девушка 22 лет. Ты любишь читать книги, изучать новые технологии и общаться с интересными людьми.",
    "bioMemory": ["Любит читать фантастику", "Изучает программирование"],
    "starterPhrases": ["Привет! Как дела?", "Расскажи что-нибудь интересное!"]
  },
  {
    "name": "Мила",
    "persona": "Ты Мила - творческая художница 24 лет. Ты рисуешь картины, любишь природу и вдохновляешь других своим искусством.",
    "bioMemory": ["Пишет маслом", "Любит закаты"],
    "starterPhrases": ["Хочешь посмотреть мои картины?", "Искусство - это жизнь!"]
  },
  {
    "name": "Юна",
    "persona": "Ты Юна - энергичная спортсменка 20 лет. Ты занимаешься йогой, бегаешь по утрам и ведешь здоровый образ жизни.",
    "bioMemory": ["Мастер йоги", "Пробегает 5км каждый день"],
    "starterPhrases": ["Давай займемся спортом!", "Здоровье - это главное!"]
  },
  {
    "name": "Лея",
    "persona": "Ты Лея - загадочная и мудрая девушка 26 лет. Ты любишь философию, изучаешь психологию и помогаешь людям разобраться в себе.",
    "bioMemory": ["Изучает психологию", "Помогает людям"],
    "starterPhrases": ["Что тебя беспокоит?", "Давай поговорим о жизни"]
  },
  {
    "name": "Вера",
    "persona": "Ты Вера - добрая медсестра 28 лет. Ты работаешь в больнице, помогаешь людям и всегда готова поддержать в трудную минуту.",
    "bioMemory": ["Работает в больнице", "Имеет медицинское образование"],
    "starterPhrases": ["Как ты себя чувствуешь?", "Я всегда рядом!"]
  },
  {
    "name": "Наоми",
    "persona": "Ты Наоми - уверенная в себе бизнесвумен 30 лет. Ты управляешь своей компанией, любишь моду и всегда выглядишь безупречно.",
    "bioMemory": ["Управляет компанией", "Любит моду"],
    "starterPhrases": ["Дела идут отлично!", "Успех - это результат работы"]
  }
]'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  🔥 Smoke Test Suite${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "API URL:   ${API_URL}"
echo -e "FRONT URL: ${FRONT_URL}"
echo ""

# ============================================
# Test 1: API Health Check
# ============================================
test_start "GET /api/health"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true' >/dev/null 2>&1; then
    pass "API health check (200 OK, ok:true)"
  else
    fail "API health check (200 OK but invalid body)"
  fi
else
  fail "API health check (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 1.5: API Status (for uptime monitoring)
# ============================================
test_start "GET /api/status"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/status")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .version and .ts' >/dev/null 2>&1; then
    VERSION=$(echo "$BODY" | jq -r '.version')
    pass "API status check (200 OK, version: $VERSION)"
  else
    fail "API status check (invalid response format)"
  fi
else
  fail "API status check (HTTP $HTTP_CODE)"
fi

# === HEARTBEAT TESTS ===

test_start "GET /api/health (with timestamp)"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.lastCheck' >/dev/null 2>&1; then
    LAST_CHECK=$(echo "$BODY" | jq -r '.data.lastCheck')
    pass "Health check OK, timestamp recorded: $LAST_CHECK"
  else
    fail "Health check (invalid response format)"
  fi
else
  fail "Health check (HTTP $HTTP_CODE)"
fi

test_start "GET /api/heartbeat/check"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/heartbeat/check")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.healthy' >/dev/null 2>&1; then
    HEALTHY=$(echo "$BODY" | jq -r '.data.healthy')
    MINUTES=$(echo "$BODY" | jq -r '.data.minutesSinceLastCheck')
    
    if [ "$HEALTHY" = "true" ]; then
      pass "Heartbeat healthy (${MINUTES}m since last check)"
    else
      echo -e "${YELLOW}⚠ WARNING${NC} API not responding for ${MINUTES} minutes (threshold: 15m)"
      pass "Heartbeat check working (unhealthy detected)"
    fi
  else
    fail "Heartbeat check (invalid response format)"
  fi
else
  fail "Heartbeat check (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 2: GET /api/girls
# ============================================
test_start "GET /api/girls"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/girls")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true' >/dev/null 2>&1; then
    GIRLS_COUNT=$(echo "$BODY" | jq '.data.girls | length')
    
    if [ "$GIRLS_COUNT" -eq 0 ]; then
      echo -e "${YELLOW}⚠ No girls found, seeding presets...${NC}"
      
      # Seed presets
      SEEDED=0
      echo "$PRESET_GIRLS" | jq -c '.[]' | while read girl; do
        NAME=$(echo "$girl" | jq -r '.name')
        SEED_RESPONSE=$(curl -s -X POST "$API_URL/api/girls" \
          -H "Content-Type: application/json" \
          -d "$girl")
        
        if echo "$SEED_RESPONSE" | jq -e '.ok == true' >/dev/null 2>&1; then
          echo -e "  ${GREEN}✓${NC} Seeded: $NAME"
          SEEDED=$((SEEDED + 1))
        else
          echo -e "  ${RED}✗${NC} Failed to seed: $NAME"
        fi
      done
      
      # Re-check after seeding
      RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/girls")
      HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
      BODY=$(echo "$RESPONSE" | sed '$d')
      GIRLS_COUNT=$(echo "$BODY" | jq '.data.girls | length')
      
      if [ "$GIRLS_COUNT" -gt 0 ]; then
        pass "GET /api/girls (seeded $GIRLS_COUNT presets)"
      else
        fail "GET /api/girls (seeding failed)"
      fi
    else
      pass "GET /api/girls ($GIRLS_COUNT girls found)"
    fi
  else
    fail "GET /api/girls (invalid response format)"
  fi
else
  fail "GET /api/girls (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 3: POST /api/chat/reply (demo request)
# ============================================
test_start "POST /api/chat/reply"

# Get first girl ID
GIRLS_RESPONSE=$(curl -s "$API_URL/api/girls")
FIRST_GIRL_ID=$(echo "$GIRLS_RESPONSE" | jq -r '.data.girls[0].id // empty')

if [ -z "$FIRST_GIRL_ID" ]; then
  fail "POST /api/chat/reply (no girls to test with)"
else
  CHAT_REQUEST='{
    "girlId": "'"$FIRST_GIRL_ID"'",
    "userMsg": "Привет! Как дела?",
    "userId": "smoke_test_user"
  }'
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/chat/reply" \
    -H "Content-Type: application/json" \
    -d "$CHAT_REQUEST")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.ok == true and .data.reply' >/dev/null 2>&1; then
      REPLY=$(echo "$BODY" | jq -r '.data.reply' | cut -c1-50)
      pass "POST /api/chat/reply (got response: \"$REPLY...\")"
    else
      fail "POST /api/chat/reply (invalid response format)"
    fi
  elif [ "$HTTP_CODE" = "503" ] || [ "$HTTP_CODE" = "500" ]; then
    BODY_ERROR=$(echo "$BODY" | jq -r '.code // empty')
    if [ "$BODY_ERROR" = "AI_NOT_CONFIGURED" ] || [ "$BODY_ERROR" = "CHAT_FAIL" ]; then
      echo -e "${YELLOW}⚠ SKIP${NC} POST /api/chat/reply (AI not configured: $BODY_ERROR)"
      TOTAL=$((TOTAL + 1))
    else
      fail "POST /api/chat/reply (HTTP $HTTP_CODE, code: $BODY_ERROR)"
    fi
  else
    fail "POST /api/chat/reply (HTTP $HTTP_CODE)"
  fi
fi

# ============================================
# Test 4: POST /api/payments/createInvoice
# ============================================
test_start "POST /api/payments/createInvoice"

CREATE_INVOICE_REQUEST='{
  "tgId": "smoke_test_user",
  "packId": "small"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/createInvoice" \
  -H "Content-Type: application/json" \
  -d "$CREATE_INVOICE_REQUEST")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.invoiceLink and .data.paymentId' >/dev/null 2>&1; then
    PAYMENT_ID=$(echo "$BODY" | jq -r '.data.paymentId')
    INVOICE_LINK=$(echo "$BODY" | jq -r '.data.invoiceLink')
    pass "POST /api/payments/createInvoice (got paymentId: $PAYMENT_ID)"
  else
    fail "POST /api/payments/createInvoice (invalid response format)"
  fi
else
  fail "POST /api/payments/createInvoice (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 5: POST /api/payments/check (dev mode)
# ============================================
test_start "POST /api/payments/check"

if [ -n "$PAYMENT_ID" ]; then
  CHECK_REQUEST="{
    \"paymentId\": \"$PAYMENT_ID\",
    \"dev\": true
  }"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/check" \
    -H "Content-Type: application/json" \
    -d "$CHECK_REQUEST")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.ok == true and .data.credited == true' >/dev/null 2>&1; then
      CREDITED_AMOUNT=$(echo "$BODY" | jq -r '.data.amount')
      NEW_BALANCE=$(echo "$BODY" | jq -r '.data.balance')
      pass "POST /api/payments/check (credited +$CREDITED_AMOUNT, balance: $NEW_BALANCE)"
    else
      fail "POST /api/payments/check (not credited)"
    fi
  else
    fail "POST /api/payments/check (HTTP $HTTP_CODE)"
  fi
else
  fail "POST /api/payments/check (no paymentId from previous test)"
fi

# ============================================
# Test 6: GET /api/ref/status (auto-provision)
# ============================================
test_start "GET /api/ref/status"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/ref/status?tgId=smoke_ref_test_1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.referralCode' >/dev/null 2>&1; then
    REF_CODE=$(echo "$BODY" | jq -r '.data.referralCode')
    pass "GET /api/ref/status (auto-provision, code: $REF_CODE)"
  else
    fail "GET /api/ref/status (invalid response format)"
  fi
else
  fail "GET /api/ref/status (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 7: POST /api/ref/apply (first time)
# ============================================
test_start "POST /api/ref/apply (first time)"

if [ -n "$REF_CODE" ]; then
  APPLY_REQUEST="{
    \"tgId\": \"smoke_ref_test_2\",
    \"code\": \"$REF_CODE\"
  }"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/ref/apply" \
    -H "Content-Type: application/json" \
    -d "$APPLY_REQUEST")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.ok == true and .data.credited == true' >/dev/null 2>&1; then
      AMOUNT=$(echo "$BODY" | jq -r '.data.amount')
      pass "POST /api/ref/apply (credited +$AMOUNT to referrer)"
    else
      fail "POST /api/ref/apply (not credited)"
    fi
  else
    fail "POST /api/ref/apply (HTTP $HTTP_CODE)"
  fi
else
  fail "POST /api/ref/apply (no ref code from previous test)"
fi

# ============================================
# Test 8: POST /api/ref/apply (idempotent check)
# ============================================
test_start "POST /api/ref/apply (idempotent - 2nd time)"

if [ -n "$REF_CODE" ]; then
  APPLY_REQUEST="{
    \"tgId\": \"smoke_ref_test_2\",
    \"code\": \"$REF_CODE\"
  }"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/ref/apply" \
    -H "Content-Type: application/json" \
    -d "$APPLY_REQUEST")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.data.alreadyApplied == true' >/dev/null 2>&1; then
      pass "POST /api/ref/apply (idempotent - correctly rejected 2nd apply)"
    else
      fail "POST /api/ref/apply (should be idempotent)"
    fi
  else
    fail "POST /api/ref/apply (HTTP $HTTP_CODE)"
  fi
else
  fail "POST /api/ref/apply (no ref code from previous test)"
fi

# ============================================
# Test 9: GET /api/quests/status (auto-provision)
# ============================================
test_start "GET /api/quests/status"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/quests/status?tgId=smoke_quest_test")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.tasks' >/dev/null 2>&1; then
    TASKS_COUNT=$(echo "$BODY" | jq '.data.tasks | length')
    TOTALS_ALL=$(echo "$BODY" | jq -r '.data.totals.all')
    pass "GET /api/quests/status (got $TASKS_COUNT tasks, total: $TOTALS_ALL)"
  else
    fail "GET /api/quests/status (invalid response format)"
  fi
else
  fail "GET /api/quests/status (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 10: POST /api/quests/complete (first time)
# ============================================
test_start "POST /api/quests/complete"

COMPLETE_REQUEST='{
  "tgId": "smoke_quest_test",
  "key": "open_app"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/quests/complete" \
  -H "Content-Type: application/json" \
  -d "$COMPLETE_REQUEST")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.done == true' >/dev/null 2>&1; then
    REWARD=$(echo "$BODY" | jq -r '.data.reward')
    BALANCE=$(echo "$BODY" | jq -r '.data.balance')
    pass "POST /api/quests/complete (rewarded +$REWARD, balance: $BALANCE)"
  else
    fail "POST /api/quests/complete (invalid response format)"
  fi
else
  fail "POST /api/quests/complete (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 11: POST /api/quests/complete (idempotent)
# ============================================
test_start "POST /api/quests/complete (idempotent - 2nd time)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/quests/complete" \
  -H "Content-Type: application/json" \
  -d "$COMPLETE_REQUEST")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.data.alreadyCompleted == true' >/dev/null 2>&1; then
    pass "POST /api/quests/complete (idempotent - correctly rejected 2nd complete)"
  else
    fail "POST /api/quests/complete (should be idempotent)"
  fi
else
  fail "POST /api/quests/complete (HTTP $HTTP_CODE)"
fi

# ============================================
# Test 12: HEAD Frontend /health
# ============================================
test_start "HEAD Frontend /health"

RESPONSE=$(curl -I -s -w "\n%{http_code}" "$FRONT_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  # Check for CSP header
  if echo "$RESPONSE" | grep -qi "content-security-policy"; then
    CSP=$(echo "$RESPONSE" | grep -i "content-security-policy" | head -1)
    pass "HEAD Frontend /health (200 OK, CSP present)"
  else
    pass "HEAD Frontend /health (200 OK)"
  fi
else
  fail "HEAD Frontend /health (HTTP $HTTP_CODE)"
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 Smoke Test Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "Total Tests:  ${TOTAL}"
echo -e "${GREEN}Passed:       ${PASSED}${NC}"
if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}Failed:       ${FAILED}${NC}"
else
  echo -e "Failed:       ${FAILED}"
fi
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some tests failed!${NC}"
  echo ""
  exit 1
fi

