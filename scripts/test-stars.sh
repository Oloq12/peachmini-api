#!/bin/bash

API_URL="https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app"
TG_ID="test_stars_$(date +%s)"

echo "🧪 Testing Stars Payment System"
echo "================================="
echo "API URL: $API_URL"
echo "Test User: $TG_ID"
echo ""

echo "1️⃣  Creating invoice..."
INVOICE_RESPONSE=$(curl -s -X POST "$API_URL/api/payments/createInvoice" \
  -H "Content-Type: application/json" \
  -d "{\"packId\":\"small\",\"tgId\":\"$TG_ID\"}")

echo "Invoice Response: $INVOICE_RESPONSE"
echo ""

PAYMENT_ID=$(echo "$INVOICE_RESPONSE" | jq -r '.data.paymentId')
echo "Payment ID: $PAYMENT_ID"
echo ""

echo "2️⃣  Checking payment (dev mode)..."
CHECK_RESPONSE=$(curl -s -X POST "$API_URL/api/payments/check" \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"dev\":true}")

echo "Check Response: $CHECK_RESPONSE"
echo ""

echo "3️⃣  Verifying balance..."
BALANCE=$(echo "$CHECK_RESPONSE" | jq -r '.data.balance')
echo "Final Balance: $BALANCE"
echo ""

if [ "$BALANCE" -gt 1000 ]; then
  echo "✅ Stars payment system working! Balance increased to $BALANCE"
else
  echo "❌ Stars payment system failed! Balance is $BALANCE"
fi

echo ""
echo "✅ Stars test complete!"
