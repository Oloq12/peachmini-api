#!/bin/bash

# Test script for Auto-Provision API
# Run: chmod +x api/test-autoprovision.sh && ./api/test-autoprovision.sh

API_URL="${API_URL:-http://localhost:8787/api}"

echo "🧪 Testing Auto-Provision API"
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Create user 1 (auto-provision)
echo -e "${BLUE}Test 1: Auto-provision user 1${NC}"
RESPONSE=$(curl -s "$API_URL/ref/status?tgId=111111111")
echo "Response: $RESPONSE"
REF_CODE_1=$(echo $RESPONSE | jq -r '.data.referralCode')
echo -e "${GREEN}✅ User 1 created with code: $REF_CODE_1${NC}"
echo ""

# Test 2: Create user 2 (auto-provision)
echo -e "${BLUE}Test 2: Auto-provision user 2${NC}"
RESPONSE=$(curl -s "$API_URL/ref/status?tgId=222222222")
echo "Response: $RESPONSE"
REF_CODE_2=$(echo $RESPONSE | jq -r '.data.referralCode')
echo -e "${GREEN}✅ User 2 created with code: $REF_CODE_2${NC}"
echo ""

# Test 3: User 2 applies User 1's referral code
echo -e "${BLUE}Test 3: User 2 applies User 1's referral code${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d "{\"tgId\": \"222222222\", \"code\": \"$REF_CODE_1\"}")
echo "Response: $RESPONSE"
CREDITED=$(echo $RESPONSE | jq -r '.data.credited')
if [ "$CREDITED" = "true" ]; then
  echo -e "${GREEN}✅ Referral applied successfully (+100 to User 1)${NC}"
else
  echo -e "${RED}❌ Referral not applied${NC}"
fi
echo ""

# Test 4: Try to apply same code again (idempotent)
echo -e "${BLUE}Test 4: Try to apply same code again (should be idempotent)${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d "{\"tgId\": \"222222222\", \"code\": \"$REF_CODE_1\"}")
echo "Response: $RESPONSE"
ALREADY_APPLIED=$(echo $RESPONSE | jq -r '.data.alreadyApplied')
if [ "$ALREADY_APPLIED" = "true" ]; then
  echo -e "${GREEN}✅ Correctly rejected duplicate application${NC}"
else
  echo -e "${RED}❌ Should have been idempotent${NC}"
fi
echo ""

# Test 5: Check User 1 balance (should be 1100)
echo -e "${BLUE}Test 5: Check User 1 balance (should be 1100)${NC}"
RESPONSE=$(curl -s "$API_URL/ref/status?tgId=111111111")
echo "Response: $RESPONSE"
BALANCE=$(echo $RESPONSE | jq -r '.data.balance')
REF_COUNT=$(echo $RESPONSE | jq -r '.data.refCount')
EARNED=$(echo $RESPONSE | jq -r '.data.earned')
echo "Balance: $BALANCE, RefCount: $REF_COUNT, Earned: $EARNED"
if [ "$BALANCE" = "1100" ] && [ "$REF_COUNT" = "1" ] && [ "$EARNED" = "100" ]; then
  echo -e "${GREEN}✅ User 1 balance correct${NC}"
else
  echo -e "${RED}❌ User 1 balance incorrect${NC}"
fi
echo ""

# Test 6: Get quests for User 2
echo -e "${BLUE}Test 6: Get quests for User 2${NC}"
RESPONSE=$(curl -s "$API_URL/quests/status?tgId=222222222")
echo "Response: $RESPONSE"
TOTAL=$(echo $RESPONSE | jq -r '.data.totals.total')
COMPLETED=$(echo $RESPONSE | jq -r '.data.totals.completed')
echo "Total quests: $TOTAL, Completed: $COMPLETED"
if [ "$TOTAL" = "3" ] && [ "$COMPLETED" = "0" ]; then
  echo -e "${GREEN}✅ Quests loaded correctly${NC}"
else
  echo -e "${RED}❌ Quests incorrect${NC}"
fi
echo ""

# Test 7: Complete first quest
echo -e "${BLUE}Test 7: Complete 'first_chat' quest${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "key": "first_chat"}')
echo "Response: $RESPONSE"
REWARD=$(echo $RESPONSE | jq -r '.data.reward')
NEW_BALANCE=$(echo $RESPONSE | jq -r '.data.newBalance')
echo "Reward: $REWARD, New Balance: $NEW_BALANCE"
if [ "$REWARD" = "50" ] && [ "$NEW_BALANCE" = "1050" ]; then
  echo -e "${GREEN}✅ Quest completed successfully${NC}"
else
  echo -e "${RED}❌ Quest completion failed${NC}"
fi
echo ""

# Test 8: Try to complete same quest again (idempotent)
echo -e "${BLUE}Test 8: Try to complete same quest again (should be idempotent)${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "key": "first_chat"}')
echo "Response: $RESPONSE"
ALREADY_COMPLETED=$(echo $RESPONSE | jq -r '.data.alreadyCompleted')
REWARD=$(echo $RESPONSE | jq -r '.data.reward')
if [ "$ALREADY_COMPLETED" = "true" ] && [ "$REWARD" = "0" ]; then
  echo -e "${GREEN}✅ Correctly rejected duplicate completion${NC}"
else
  echo -e "${RED}❌ Should have been idempotent${NC}"
fi
echo ""

# Test 9: Check quest status (1 completed)
echo -e "${BLUE}Test 9: Check quest status (should show 1 completed)${NC}"
RESPONSE=$(curl -s "$API_URL/quests/status?tgId=222222222")
echo "Response: $RESPONSE"
COMPLETED=$(echo $RESPONSE | jq -r '.data.totals.completed')
EARNED=$(echo $RESPONSE | jq -r '.data.totals.earned')
if [ "$COMPLETED" = "1" ] && [ "$EARNED" = "50" ]; then
  echo -e "${GREEN}✅ Quest status correct${NC}"
else
  echo -e "${RED}❌ Quest status incorrect${NC}"
fi
echo ""

# Test 10: Try invalid referral code
echo -e "${BLUE}Test 10: Try invalid referral code${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "333333333", "code": "INVALID123"}')
echo "Response: $RESPONSE"
ERROR_CODE=$(echo $RESPONSE | jq -r '.code')
if [ "$ERROR_CODE" = "INVALID_CODE" ]; then
  echo -e "${GREEN}✅ Correctly rejected invalid code${NC}"
else
  echo -e "${RED}❌ Should have rejected invalid code${NC}"
fi
echo ""

# Test 11: Try self-referral
echo -e "${BLUE}Test 11: Try self-referral (should be rejected)${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/ref/apply" \
  -H "Content-Type: application/json" \
  -d "{\"tgId\": \"111111111\", \"code\": \"$REF_CODE_1\"}")
echo "Response: $RESPONSE"
ERROR_CODE=$(echo $RESPONSE | jq -r '.code')
if [ "$ERROR_CODE" = "SELF_REFERRAL" ]; then
  echo -e "${GREEN}✅ Correctly rejected self-referral${NC}"
else
  echo -e "${RED}❌ Should have rejected self-referral${NC}"
fi
echo ""

# Test 12: Complete invalid quest
echo -e "${BLUE}Test 12: Try to complete invalid quest${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/quests/complete" \
  -H "Content-Type: application/json" \
  -d '{"tgId": "222222222", "key": "invalid_quest"}')
echo "Response: $RESPONSE"
ERROR_CODE=$(echo $RESPONSE | jq -r '.code')
if [ "$ERROR_CODE" = "QUEST_NOT_FOUND" ]; then
  echo -e "${GREEN}✅ Correctly rejected invalid quest${NC}"
else
  echo -e "${RED}❌ Should have rejected invalid quest${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo -e "${BLUE}========================================${NC}"

