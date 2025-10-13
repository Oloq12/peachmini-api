# 🧪 Smoke Test v2.0 - Summary

**Дата:** 2025-10-13  
**Статус:** ✅ Complete  
**Версия:** 2.0.0

---

## ✅ Создано

### Главный скрипт
**Файл:** `scripts/smoke-v2.sh` (исполняемый, ~440 строк)

### Документация
- `SMOKE-V2-GUIDE.md` - Полное руководство
- `SMOKE-V2-SUMMARY.md` - Этот файл

### NPM Script
```json
"doctor:smoke-v2": "bash scripts/smoke-v2.sh"
```

### JSON Output
- `smoke-summary.json` - Автогенерируемый отчёт

---

## 🧪 Что проверяется

| # | Test | Endpoint | Expected |
|---|------|----------|----------|
| 1 | API Health | `GET /api/health` | `ok: true` |
| 2 | Characters List | `GET /api/girls` | `count >= 1` |
| 3 | Character Slug | `GET /api/girls/:slug` | HTTP 200 |
| 4 | Chat Reply | `POST /api/chat/reply` | HTTP 200 + reply |
| 5 | Referral Status | `GET /api/ref/status` | `ok: true` |
| 6 | Quest Status | `GET /api/quests/status` | `ok: true` |
| 7 | Create Invoice | `POST /api/payments/createInvoice` | invoice_url |
| 8 | Check Payment | `POST /api/payments/check` | HTTP 200/404 |
| 9 | Frontend Health | `HEAD /health` or `HEAD /` | HTTP 200 |
| 10 | Telegram Bot | `GET bot/getMe` | `ok: true` (optional) |

---

## 🚀 Использование

### Базовый запуск
```bash
npm run doctor:smoke-v2
```

### С переменными окружения
```bash
API_URL=https://your-api.com \
FRONT_URL=https://your-front.com \
BOT_TOKEN=123:ABC \
npm run doctor:smoke-v2
```

### Напрямую
```bash
./scripts/smoke-v2.sh
```

---

## 📊 Вывод

### Console (Цветной)
```
╔══════════════════════════════════════════════════════╗
║         🍑 PEACHMINI SMOKE TEST v2.0                 ║
╚══════════════════════════════════════════════════════╝

✅ PASS: GET /api/health
✅ PASS: GET /api/girls (count: 6)
❌ FAIL: POST /api/chat/reply
   └─ HTTP 404

📊 SUMMARY:
Total Tests:   9
Passed:        8
Failed:        1
Success Rate:  88%
```

### JSON (Machine-readable)
```json
{
  "timestamp": "2025-10-13T12:00:00Z",
  "api_url": "https://...",
  "front_url": "https://...",
  "total_tests": 9,
  "passed": 8,
  "failed": 1,
  "success_rate": "88%",
  "results": [...]
}
```

---

## 🎨 Features

- ✅ 10 comprehensive checks
- ✅ Color-coded output (green/red)
- ✅ Detailed error messages
- ✅ JSON summary export
- ✅ Exit codes (0/1)
- ✅ Continues on error
- ✅ macOS/Linux compatible
- ✅ Optional bot test
- ✅ Custom URLs support
- ✅ NPM integration

---

## 🔧 Dependencies

- `jq` - JSON parsing
- `curl` - HTTP requests
- `bash` - Shell execution

---

## 📈 Integration Examples

### CI/CD
```yaml
- name: Run Smoke Test
  run: npm run doctor:smoke-v2
  
- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: smoke-results
    path: smoke-summary.json
```

### Alerts
```bash
./scripts/smoke-v2.sh || \
  curl -X POST $SLACK_WEBHOOK \
    -d '{"text":"🚨 Smoke test failed!"}'
```

### Cron
```bash
0 */6 * * * cd /path && npm run doctor:smoke-v2
```

---

## ✅ Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | Some tests failed |

---

## 📚 Quick Commands

```bash
# Run test
npm run doctor:smoke-v2

# View JSON summary
cat smoke-summary.json | jq '.'

# Get success rate
cat smoke-summary.json | jq -r '.success_rate'

# List failed tests
cat smoke-summary.json | jq '.results[] | select(.status=="FAIL")'
```

---

## 🔗 Related

- **Basic smoke:** `npm run doctor:smoke`
- **Payments:** `npm run doctor:payments`
- **Auto-heal:** `npm run doctor:auto`
- **Monitor:** `npm run doctor:monitor`

---

**Статус:** ✅ Production Ready  
**Команда:** `npm run doctor:smoke-v2`  
**Документация:** `SMOKE-V2-GUIDE.md`

