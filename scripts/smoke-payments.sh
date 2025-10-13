#!/bin/bash

# Smoke Test для Telegram Stars Payment System
# Проверяет работу оплаты в production режиме

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
API_URL="${API_URL:-https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app}"

# Test counters
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

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

skip() {
  SKIPPED=$((SKIPPED + 1))
  TOTAL=$((TOTAL + 1))
  echo -e "${YELLOW}⚠ SKIP${NC} $1"
}

test_start() {
  echo -e "\n${BLUE}▶ Test: $1${NC}"
}

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  💎 Payment System Smoke Test${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo "API URL:   $API_URL"
echo ""

# ============================================
# Test 1: Get Payment Packages
# ============================================
test_start "GET /api/payments/packages"

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/payments/packages")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.packages' >/dev/null 2>&1; then
    PACKAGES_COUNT=$(echo "$BODY" | jq '.data.packages | length')
    if [ "$PACKAGES_COUNT" -ge 3 ]; then
      pass "Packages loaded (count: $PACKAGES_COUNT)"
    else
      fail "Not enough packages (expected ≥3, got $PACKAGES_COUNT)"
    fi
  else
    fail "Invalid response format"
  fi
else
  fail "HTTP $HTTP_CODE"
fi

# ============================================
# Test 2: Create Invoice (Production Mode)
# ============================================
test_start "POST /api/payments/createInvoice (production check)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/createInvoice" \
  -H "Content-Type: application/json" \
  -d '{"tgId":"test_smoke_12345","packId":"small"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | jq -e '.ok == true and .data.invoiceLink' >/dev/null 2>&1; then
    INVOICE_LINK=$(echo "$BODY" | jq -r '.data.invoiceLink')
    PAYMENT_ID=$(echo "$BODY" | jq -r '.data.paymentId')
    
    # Check if production (real Telegram invoice) or dev stub
    if [[ "$INVOICE_LINK" == *"t.me/invoice"* ]] || [[ "$INVOICE_LINK" == *"telegram.org"* ]]; then
      pass "Production invoice created: ${INVOICE_LINK:0:50}..."
      echo "   Payment ID: $PAYMENT_ID"
      IS_PRODUCTION=true
    elif [[ "$INVOICE_LINK" == *"\$TEST_INVOICE"* ]]; then
      skip "Dev mode stub (BOT_TOKEN not configured)"
      echo "   To enable production: Set BOT_TOKEN env var"
      IS_PRODUCTION=false
    else
      pass "Invoice created: ${INVOICE_LINK:0:50}..."
      echo "   Payment ID: $PAYMENT_ID"
      IS_PRODUCTION=false
    fi
  else
    fail "Invalid response format"
  fi
else
  fail "HTTP $HTTP_CODE"
fi

# ============================================
# Test 3: Check Payment (Dev Mode)
# ============================================
test_start "POST /api/payments/check (dev mode)"

if [ -n "$PAYMENT_ID" ]; then
  # Get initial balance
  BALANCE_RESPONSE=$(curl -s "$API_URL/api/ref/status?tgId=test_smoke_12345")
  INITIAL_BALANCE=$(echo "$BALANCE_RESPONSE" | jq -r '.data.balance // 1000')
  
  echo "   Initial balance: $INITIAL_BALANCE PP"
  
  # Check payment (dev mode)
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/check" \
    -H "Content-Type: application/json" \
    -d "{\"paymentId\":\"$PAYMENT_ID\",\"dev\":true}")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.ok == true and .data.credited == true' >/dev/null 2>&1; then
      NEW_BALANCE=$(echo "$BODY" | jq -r '.data.balance')
      CREDITED_AMOUNT=$(echo "$BODY" | jq -r '.data.amount')
      
      if [ "$NEW_BALANCE" -gt "$INITIAL_BALANCE" ]; then
        pass "Payment credited: +${CREDITED_AMOUNT} PP → ${NEW_BALANCE} PP"
      else
        fail "Balance not updated (was: $INITIAL_BALANCE, now: $NEW_BALANCE)"
      fi
    else
      fail "Payment not credited"
    fi
  else
    fail "HTTP $HTTP_CODE"
  fi
else
  skip "No payment ID from previous test"
fi

# ============================================
# Test 4: Webhook Validation
# ============================================
test_start "POST /api/payments/webhook (pre_checkout_query)"

if [ -n "$PAYMENT_ID" ]; then
  # Create new payment for webhook test
  CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/payments/createInvoice" \
    -H "Content-Type: application/json" \
    -d '{"tgId":"test_webhook_67890","packId":"medium"}')
  
  WEBHOOK_PAYMENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.paymentId')
  
  # Simulate pre_checkout_query webhook
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/webhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"pre_checkout_query\": {
        \"id\": \"test_query_123\",
        \"from\": {\"id\": 67890},
        \"invoice_payload\": \"$WEBHOOK_PAYMENT_ID\"
      }
    }")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.ok == true' >/dev/null 2>&1; then
      pass "pre_checkout_query webhook processed"
    else
      fail "Webhook processing failed"
    fi
  else
    fail "HTTP $HTTP_CODE"
  fi
else
  skip "No payment ID for webhook test"
fi

# ============================================
# Test 5: Successful Payment Webhook
# ============================================
test_start "POST /api/payments/webhook (successful_payment)"

if [ -n "$WEBHOOK_PAYMENT_ID" ]; then
  # Get initial balance
  BALANCE_RESPONSE=$(curl -s "$API_URL/api/ref/status?tgId=test_webhook_67890")
  INITIAL_BALANCE=$(echo "$BALANCE_RESPONSE" | jq -r '.data.balance // 1000')
  
  # Simulate successful_payment webhook
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/webhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"message\": {
        \"from\": {\"id\": 67890},
        \"successful_payment\": {
          \"invoice_payload\": \"$WEBHOOK_PAYMENT_ID\",
          \"total_amount\": 600,
          \"telegram_payment_charge_id\": \"test_charge_abc123\"
        }
      }
    }")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.ok == true and .data.credited == true' >/dev/null 2>&1; then
      NEW_BALANCE=$(echo "$BODY" | jq -r '.data.balance')
      CREDITED=$(echo "$BODY" | jq -r '.data.amount')
      
      pass "successful_payment webhook: +${CREDITED} PP → ${NEW_BALANCE} PP"
    else
      fail "Payment not credited via webhook"
    fi
  else
    fail "HTTP $HTTP_CODE"
  fi
else
  skip "No payment ID for webhook test"
fi

# ============================================
# Test 6: Idempotency Check
# ============================================
test_start "POST /api/payments/check (idempotent - 2nd time)"

if [ -n "$PAYMENT_ID" ]; then
  # Try to check same payment again
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/check" \
    -H "Content-Type: application/json" \
    -d "{\"paymentId\":\"$PAYMENT_ID\",\"dev\":true}")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    CREDITED=$(echo "$BODY" | jq -r '.data.credited // false')
    
    if [ "$CREDITED" = "false" ]; then
      pass "Idempotency working (payment already credited)"
    else
      fail "Idempotency broken (double credit possible)"
    fi
  else
    fail "HTTP $HTTP_CODE"
  fi
else
  skip "No payment ID for idempotency test"
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 Payment System Test Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
echo -e "${RED}Failed:       $FAILED${NC}"
echo -e "${YELLOW}Skipped:      $SKIPPED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}✗ Some tests failed!${NC}"
  exit 1
elif [ $SKIPPED -gt 0 ]; then
  echo -e "${YELLOW}⚠ Some tests skipped (may need production setup)${NC}"
  exit 0
else
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
fi

