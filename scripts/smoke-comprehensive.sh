#!/bin/bash

# Peachmini Comprehensive Smoke Test v2.0
# Full diagnostic suite for API, Frontend, and Bot

# Don't exit on errors - we want to run all tests
set +e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# URLs
API_URL="${API_URL:-https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app}"
FRONT_URL="${FRONT_URL:-https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app}"
BOT_TOKEN="${BOT_TOKEN:-}"

# Test results
declare -a RESULTS=()
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    RESULTS+=("PASS|$1|$2")
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    if [ -n "$2" ]; then
        echo -e "   ${RED}Error: $2${NC}"
    fi
    RESULTS+=("FAIL|$1|$2")
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

info() {
    echo -e "${CYAN}ℹ️  INFO${NC}: $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Test API Health
test_api_health() {
    section "1️⃣  API HEALTH CHECK"
    
    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/health" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local ok=$(echo "$body" | jq -r '.ok' 2>/dev/null || echo "false")
        if [ "$ok" = "true" ]; then
            pass "GET /api/health" "HTTP 200 OK"
        else
            fail "GET /api/health" "ok != true (got: $ok)"
        fi
    else
        fail "GET /api/health" "HTTP $status"
    fi
}

# Test Girls List
test_girls_list() {
    section "2️⃣  CHARACTERS LIST"
    
    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/girls?limit=10" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local count=$(echo "$body" | jq -r '.data.girls | length' 2>/dev/null || echo "0")
        if [ "$count" -ge 1 ]; then
            pass "GET /api/girls (count: $count)" "Found $count characters"
        else
            fail "GET /api/girls" "count < 1 (got: $count)"
        fi
        
        # Save first slug for next test
        FIRST_SLUG=$(echo "$body" | jq -r '.data.girls[0].slug' 2>/dev/null || echo "")
    else
        fail "GET /api/girls" "HTTP $status"
        FIRST_SLUG=""
    fi
}

# Test Girl by Slug
test_girl_by_slug() {
    section "3️⃣  CHARACTER BY SLUG"
    
    if [ -z "$FIRST_SLUG" ]; then
        fail "GET /api/girls/:slug" "No slug available from previous test"
        return
    fi
    
    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/girls/$FIRST_SLUG" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local name=$(echo "$body" | jq -r '.data.girl.name' 2>/dev/null || echo "")
        if [ -n "$name" ]; then
            pass "GET /api/girls/$FIRST_SLUG" "Character: $name"
        else
            fail "GET /api/girls/$FIRST_SLUG" "No name in response"
        fi
    else
        fail "GET /api/girls/$FIRST_SLUG" "HTTP $status"
    fi
}

# Test Chat Reply (Demo)
test_chat_reply() {
    section "4️⃣  CHAT REPLY (Demo)"
    
    if [ -z "$FIRST_SLUG" ]; then
        fail "POST /api/chat/reply" "No slug available"
        return
    fi
    
    local payload='{"userId":"test-smoke","girlId":"'$FIRST_SLUG'","userMsg":"Привет!"}'
    local response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/chat/reply" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local reply=$(echo "$body" | jq -r '.reply' 2>/dev/null || echo "")
        if [ -n "$reply" ]; then
            # Truncate long replies
            local short_reply=$(echo "$reply" | head -c 50)
            pass "POST /api/chat/reply" "Reply: ${short_reply}..."
        else
            fail "POST /api/chat/reply" "No reply in response"
        fi
    else
        fail "POST /api/chat/reply" "HTTP $status"
    fi
}

# Test Referral Status
test_referral_status() {
    section "5️⃣  REFERRAL SYSTEM"
    
    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/ref/status?tgId=dev" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local ok=$(echo "$body" | jq -r '.ok' 2>/dev/null || echo "false")
        if [ "$ok" = "true" ]; then
            local earned=$(echo "$body" | jq -r '.data.earned' 2>/dev/null || echo "0")
            pass "GET /api/ref/status" "Earned: $earned PP"
        else
            fail "GET /api/ref/status" "ok != true"
        fi
    else
        fail "GET /api/ref/status" "HTTP $status"
    fi
}

# Test Quests Status
test_quests_status() {
    section "6️⃣  QUEST SYSTEM"
    
    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/quests/status?tgId=dev" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local ok=$(echo "$body" | jq -r '.ok' 2>/dev/null || echo "false")
        if [ "$ok" = "true" ]; then
            local completed=$(echo "$body" | jq -r '.data.completed | length' 2>/dev/null || echo "0")
            pass "GET /api/quests/status" "Completed: $completed quests"
        else
            fail "GET /api/quests/status" "ok != true"
        fi
    else
        fail "GET /api/quests/status" "HTTP $status"
    fi
}

# Test Payment Create Invoice
test_payment_create_invoice() {
    section "7️⃣  PAYMENT: CREATE INVOICE"
    
    local payload='{"tgId":"dev","packId":"small","dev":true}'
    local response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/createInvoice" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local ok=$(echo "$body" | jq -r '.ok' 2>/dev/null || echo "false")
        if [ "$ok" = "true" ]; then
            local invoice_url=$(echo "$body" | jq -r '.data.invoice_url' 2>/dev/null || echo "")
            if [ -n "$invoice_url" ]; then
                pass "POST /api/payments/createInvoice" "Invoice created"
            else
                fail "POST /api/payments/createInvoice" "No invoice_url"
            fi
        else
            fail "POST /api/payments/createInvoice" "ok != true"
        fi
    else
        fail "POST /api/payments/createInvoice" "HTTP $status"
    fi
}

# Test Payment Check
test_payment_check() {
    section "8️⃣  PAYMENT: CHECK STATUS"
    
    local payload='{"paymentId":"test-payment-id","dev":true}'
    local response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/payments/check" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    # Payment check может вернуть 404 для несуществующего платежа (это нормально)
    if [ "$status" = "200" ] || [ "$status" = "404" ]; then
        pass "POST /api/payments/check" "HTTP $status (expected)"
    else
        fail "POST /api/payments/check" "HTTP $status (unexpected)"
    fi
}

# Test Frontend Health
test_frontend_health() {
    section "9️⃣  FRONTEND HEALTH"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" -I "$FRONT_URL/health" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        pass "HEAD $FRONT_URL/health" "HTTP 200"
    else
        # Health endpoint может не существовать, проверим главную
        info "Health endpoint returned $status, checking homepage..."
        test_frontend_homepage
    fi
}

# Test Frontend Homepage
test_frontend_homepage() {
    local status=$(curl -s -o /dev/null -w "%{http_code}" -I "$FRONT_URL/" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        pass "HEAD $FRONT_URL/" "HTTP 200"
    else
        fail "HEAD $FRONT_URL/" "HTTP $status"
    fi
}

# Test Telegram Bot
test_telegram_bot() {
    section "🔟  TELEGRAM BOT"
    
    if [ -z "$BOT_TOKEN" ]; then
        info "BOT_TOKEN not set, skipping bot test"
        info "Set BOT_TOKEN env var to test bot"
        return
    fi
    
    local response=$(curl -s -w "\n%{http_code}" "https://api.telegram.org/bot$BOT_TOKEN/getMe" 2>/dev/null)
    local status=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "200" ]; then
        local ok=$(echo "$body" | jq -r '.ok' 2>/dev/null || echo "false")
        if [ "$ok" = "true" ]; then
            local username=$(echo "$body" | jq -r '.result.username' 2>/dev/null || echo "")
            pass "Telegram Bot API" "Bot: @$username"
        else
            fail "Telegram Bot API" "ok != true"
        fi
    else
        fail "Telegram Bot API" "HTTP $status (check BOT_TOKEN)"
    fi
}

# Generate Summary
generate_summary() {
    section "📊  SUMMARY"
    
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              PEACHMINI SMOKE TEST RESULTS               ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Table header
    printf "%-50s | %s\n" "Test" "Status"
    printf "%s\n" "────────────────────────────────────────────────────────────────"
    
    # Table rows
    for result in "${RESULTS[@]}"; do
        IFS='|' read -r status test details <<< "$result"
        
        if [ "$status" = "PASS" ]; then
            printf "%-50s | ${GREEN}✅ PASS${NC}\n" "$test"
        else
            printf "%-50s | ${RED}❌ FAIL${NC}\n" "$test"
            if [ -n "$details" ]; then
                printf "%-50s | ${RED}   └─ %s${NC}\n" "" "$details"
            fi
        fi
    done
    
    echo ""
    echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"
    
    # Stats
    local pass_percent=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        pass_percent=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    echo ""
    echo -e "  Total Tests:   ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "  Passed:        ${GREEN}$PASSED_TESTS${NC}"
    echo -e "  Failed:        ${RED}$FAILED_TESTS${NC}"
    echo -e "  Success Rate:  ${CYAN}${pass_percent}%${NC}"
    echo ""
    
    # Overall status
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✅ ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${RED}  ❌ SOME TESTS FAILED!${NC}"
        echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        return 1
    fi
}

# Generate JSON Summary
generate_json_summary() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > smoke-summary.json << EOF
{
  "timestamp": "$timestamp",
  "api_url": "$API_URL",
  "front_url": "$FRONT_URL",
  "total_tests": $TOTAL_TESTS,
  "passed": $PASSED_TESTS,
  "failed": $FAILED_TESTS,
  "success_rate": "$((PASSED_TESTS * 100 / TOTAL_TESTS))%",
  "results": [
EOF
    
    local first=true
    for result in "${RESULTS[@]}"; do
        IFS='|' read -r status test details <<< "$result"
        
        # Escape quotes in details for JSON
        details=$(echo "$details" | sed 's/"/\\"/g')
        
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> smoke-summary.json
        fi
        
        echo "    {" >> smoke-summary.json
        echo "      \"test\": \"$test\"," >> smoke-summary.json
        echo "      \"status\": \"$status\"," >> smoke-summary.json
        echo "      \"details\": \"$details\"" >> smoke-summary.json
        echo -n "    }" >> smoke-summary.json
    done
    
    echo "" >> smoke-summary.json
    echo "  ]" >> smoke-summary.json
    echo "}" >> smoke-summary.json
    
    info "Summary saved to: smoke-summary.json"
}

# Main execution
main() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         🍑 PEACHMINI SMOKE TEST v2.0                     ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    info "API URL:   $API_URL"
    info "Front URL: $FRONT_URL"
    if [ -n "$BOT_TOKEN" ]; then
        info "Bot Token: ***${BOT_TOKEN: -6}"
    else
        info "Bot Token: Not set (bot test will be skipped)"
    fi
    echo ""
    
    # Run all tests
    test_api_health
    test_girls_list
    test_girl_by_slug
    test_chat_reply
    test_referral_status
    test_quests_status
    test_payment_create_invoice
    test_payment_check
    test_frontend_health
    test_telegram_bot
    
    # Generate summaries
    if generate_summary; then
        generate_json_summary
        exit 0
    else
        generate_json_summary
        exit 1
    fi
}

# Check dependencies
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Install: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is not installed${NC}"
    exit 1
fi

# Run main
main

