# 🧪 Smoke Test v2.0 - Comprehensive Diagnostic Guide

## 🎯 Overview

Полная система диагностики Peachmini с проверкой всех критичных компонентов:
- API endpoints (health, characters, chat, payments, referrals, quests)
- Frontend (health check, homepage)
- Telegram Bot (optional)

---

## 🚀 Quick Start

### Run Test

```bash
npm run doctor:smoke-v2
```

или

```bash
./scripts/smoke-v2.sh
```

### With Bot Token

```bash
BOT_TOKEN=your_token ./scripts/smoke-v2.sh
```

---

## 📊 What's Tested

### 1️⃣ API Health Check
```
GET /api/health
Expected: {"ok": true, ...}
```

### 2️⃣ Characters List
```
GET /api/girls?limit=10
Expected: count >= 1
```

### 3️⃣ Character by Slug
```
GET /api/girls/:slug
Expected: HTTP 200 + character data
```

### 4️⃣ Chat Reply (Demo)
```
POST /api/chat/reply
Body: {userId, girlId, userMsg}
Expected: HTTP 200 + reply
```

### 5️⃣ Referral System
```
GET /api/ref/status?tgId=dev
Expected: {"ok": true, data: {...}}
```

### 6️⃣ Quest System
```
GET /api/quests/status?tgId=dev
Expected: {"ok": true, data: {...}}
```

### 7️⃣ Payment: Create Invoice
```
POST /api/payments/createInvoice
Body: {tgId, packId, dev: true}
Expected: invoice_url
```

### 8️⃣ Payment: Check Status
```
POST /api/payments/check
Body: {paymentId, dev: true}
Expected: HTTP 200 or 404
```

### 9️⃣ Frontend Health
```
HEAD /health or HEAD /
Expected: HTTP 200
```

### 🔟 Telegram Bot (Optional)
```
GET https://api.telegram.org/bot$BOT_TOKEN/getMe
Expected: {"ok": true, result: {...}}
```

---

## 📈 Output

### Console Output

```
╔══════════════════════════════════════════════════════════╗
║         🍑 PEACHMINI SMOKE TEST v2.0                     ║
╚══════════════════════════════════════════════════════════╝

ℹ️  INFO: API URL:   https://...
ℹ️  INFO: Front URL: https://...

═══════════════════════════════════════════════════════════
  1️⃣  API HEALTH CHECK
═══════════════════════════════════════════════════════════

✅ PASS: GET /api/health

...

═══════════════════════════════════════════════════════════
  📊  SUMMARY
═══════════════════════════════════════════════════════════

╔══════════════════════════════════════════════════════════╗
║              PEACHMINI SMOKE TEST RESULTS               ║
╚══════════════════════════════════════════════════════════╝

Test                                               | Status
────────────────────────────────────────────────────────────
GET /api/health                                    | ✅ PASS
GET /api/girls (count: 6)                          | ✅ PASS
...

  Total Tests:   9
  Passed:        8
  Failed:        1
  Success Rate:  88%

✅ ALL TESTS PASSED! (or ❌ SOME TESTS FAILED!)
```

### JSON Summary

File: `smoke-summary.json`

```json
{
  "timestamp": "2025-10-13T12:00:00Z",
  "api_url": "https://...",
  "front_url": "https://...",
  "total_tests": 9,
  "passed": 8,
  "failed": 1,
  "success_rate": "88%",
  "results": [
    {
      "test": "GET /api/health",
      "status": "PASS",
      "details": "HTTP 200 OK"
    },
    ...
  ]
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# API URL (default: production)
export API_URL="https://your-api.vercel.app"

# Frontend URL (default: production)
export FRONT_URL="https://your-front.vercel.app"

# Telegram Bot Token (optional)
export BOT_TOKEN="123456789:ABC..."
```

### Custom URLs

```bash
# Test against localhost
API_URL=http://localhost:8787 \
FRONT_URL=http://localhost:5173 \
./scripts/smoke-v2.sh
```

---

## 🎨 Features

### Color-Coded Output
- 🟢 **Green** - Tests passed
- 🔴 **Red** - Tests failed (with error details)
- 🔵 **Blue** - Section headers
- 🟡 **Cyan** - Info messages

### Smart Error Handling
- Tests continue even if one fails
- Detailed error messages for failures
- Exit code reflects overall success (0 = pass, 1 = fail)

### JSON Export
- Structured test results
- Machine-readable format
- Integration-ready

### Skip Features
- Bot test skipped if BOT_TOKEN not set
- Frontend health fallback to homepage

---

## 📋 Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed ✅ |
| 1 | Some tests failed ❌ |

---

## 🔧 Troubleshooting

### Issue: jq not found

**Error:**
```
Error: jq is not installed
```

**Solution:**
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

---

### Issue: curl not found

**Error:**
```
Error: curl is not installed
```

**Solution:**
```bash
# macOS (usually pre-installed)
# Linux
sudo apt-get install curl
```

---

### Issue: Connection refused

**Error:**
```
❌ FAIL: GET /api/health
   Error: HTTP 000
```

**Solution:**
1. Check if API is running
2. Verify API_URL is correct
3. Check network connection

---

### Issue: Bot test fails

**Error:**
```
❌ FAIL: Telegram Bot API
   Error: HTTP 401
```

**Solution:**
1. Check BOT_TOKEN is correct
2. Get token from @BotFather
3. Ensure token is not expired

---

## 🧩 Integration

### CI/CD Integration

**.github/workflows/smoke-test.yml:**
```yaml
name: Smoke Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install jq
        run: sudo apt-get install -y jq
      
      - name: Run Smoke Test
        env:
          API_URL: ${{ secrets.API_URL }}
          FRONT_URL: ${{ secrets.FRONT_URL }}
        run: ./scripts/smoke-v2.sh
      
      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: smoke-test-results
          path: smoke-summary.json
```

### Custom Alerts

```bash
# Run test and send to Slack if fails
./scripts/smoke-v2.sh || curl -X POST $SLACK_WEBHOOK \
  -d '{"text":"🚨 Smoke test failed!"}'

# Run test and email results
./scripts/smoke-v2.sh
cat smoke-summary.json | mail -s "Smoke Test Results" you@example.com
```

---

## 📊 Metrics

### Track Success Rate

```bash
# Extract success rate from JSON
cat smoke-summary.json | jq -r '.success_rate'
# Output: 88%
```

### Count Failures

```bash
# Count failed tests
cat smoke-summary.json | jq '.results[] | select(.status=="FAIL") | .test'
```

### Get Failed Tests

```bash
# List only failed tests
cat smoke-summary.json | jq -r '.results[] | select(.status=="FAIL") | "\(.test): \(.details)"'
```

---

## 📝 Example Usage

### Daily Health Check

```bash
#!/bin/bash
# daily-check.sh

./scripts/smoke-v2.sh

if [ $? -eq 0 ]; then
    echo "✅ Daily check passed"
else
    echo "❌ Daily check failed - investigating..."
    cat smoke-summary.json | jq '.results[] | select(.status=="FAIL")'
fi
```

### Pre-Deployment Test

```bash
# Before deploying to production
npm run doctor:smoke-v2

if [ $? -ne 0 ]; then
    echo "❌ Tests failed - aborting deployment"
    exit 1
fi

# Deploy
vercel --prod
```

---

## 🔗 Related Commands

```bash
# Basic smoke test (old version)
npm run doctor:smoke

# Payment-specific tests
npm run doctor:payments

# Auto-heal check
npm run doctor:auto

# Continuous monitoring
npm run doctor:monitor
```

---

## ✅ Best Practices

1. **Run regularly** - Schedule daily or before deployments
2. **Monitor trends** - Track success rate over time
3. **Fix failures** - Don't ignore failed tests
4. **Update tests** - Add tests for new features
5. **Document changes** - Update this guide when tests change

---

## 📚 Files

- **Script:** `scripts/smoke-v2.sh`
- **Output:** `smoke-summary.json`
- **Guide:** This file
- **NPM:** `npm run doctor:smoke-v2`

---

**Created:** 2025-10-13  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

