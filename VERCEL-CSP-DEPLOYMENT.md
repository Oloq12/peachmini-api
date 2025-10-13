# ✅ Vercel CSP & Deployment - Отчет

## Дата: 2025-10-13

---

## ✅ Выполнено

### 1. **CSP (Content Security Policy) обновлен**

**Файл:** `vercel.json`

**Изменения:**
```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "Content-Security-Policy",
        "value": "frame-ancestors https://web.telegram.org https://*.telegram.org https://t.me https://*.t.me"
      }
    ]
  }
]
```

**Что сделано:**
- ✅ Убран пустой `X-Frame-Options`
- ✅ Установлен `Content-Security-Policy` с `frame-ancestors` для Telegram
- ✅ Разрешены домены: `web.telegram.org`, `*.telegram.org`, `t.me`, `*.t.me`

### 2. **Фронтенд пересобран**

```bash
cd peach-web && npm run build

✓ 65 modules transformed.
dist/index.html                   1.44 kB │ gzip:   0.84 kB
dist/assets/index-B436MOet.css    0.47 kB │ gzip:   0.32 kB
dist/assets/index-PE-MOaRN.js   336.98 kB │ gzip: 102.79 kB
✓ built in 479ms
```

### 3. **Deployment на Vercel**

```bash
npx vercel --prod --yes

✅ Production: https://peach-mini-g6b5xrc2n-trsoyoleg-4006s-projects.vercel.app
```

---

## ⚠️ Vercel Password Protection

### Проблема

Все deployment URLs защищены Vercel Password Protection (401 Unauthorized):

```bash
curl -I https://peach-mini-g6b5xrc2n-trsoyoleg-4006s-projects.vercel.app/health
# HTTP/2 401
# x-frame-options: DENY
```

### Решение

Для публичного доступа к `/health` endpoint необходимо **отключить Password Protection**:

#### Шаги:

1. **Перейти в Vercel Dashboard**
   ```
   https://vercel.com/trsoyoleg-4006s-projects/peach-mini/settings
   ```

2. **Settings → Deployment Protection**
   - Найти раздел "Deployment Protection"
   - Отключить "Vercel Authentication"
   - Или добавить `/health` в исключения

3. **Альтернатива: использовать Production Domain**
   - Settings → Domains
   - Добавить custom domain
   - Production domain будет доступен публично

#### Быстрое решение через Vercel CLI:

```bash
# Отключить Password Protection
vercel env rm VERCEL_PASSWORD_PROTECTION_PASSWORD production

# Или через settings
vercel project settings --protection-bypass /health
```

---

## 🧪 Тестирование

### Локальное тестирование

```bash
# Запустить API локально
cd api
node index.js

# Проверить health endpoint
curl -I http://localhost:8787/health
# HTTP/1.1 200 OK
```

### Production тестирование (после отключения защиты)

```bash
# HEAD запрос
curl -I https://peach-mini.vercel.app/health

# Должно вернуть:
# HTTP/2 200 OK
# content-security-policy: frame-ancestors https://web.telegram.org...
```

---

## 📋 CSP Verification

### Проверка headers

**Ожидаемые headers:**
```
Content-Security-Policy: frame-ancestors https://web.telegram.org https://*.telegram.org https://t.me https://*.t.me
```

**НЕ должно быть:**
```
X-Frame-Options: DENY
```

### Тест в браузере

```javascript
// В консоли DevTools на странице Telegram Web App
fetch('https://your-app.vercel.app/health', {method: 'HEAD'})
  .then(r => {
    console.log('Status:', r.status); // 200
    console.log('CSP:', r.headers.get('content-security-policy'));
  });
```

---

## 📁 Измененные файлы

### vercel.json
```diff
- { "key": "X-Frame-Options", "value": "" },
+ {
+   "key": "Content-Security-Policy",
+   "value": "frame-ancestors https://web.telegram.org https://*.telegram.org https://t.me https://*.t.me"
+ }
```

---

## ✅ Checklist

- [x] CSP обновлен в vercel.json
- [x] X-Frame-Options удален
- [x] frame-ancestors настроен для Telegram
- [x] Фронтенд пересобран
- [x] Deployment на Vercel выполнен
- [ ] Password Protection отключен (требуется вручную)
- [ ] HEAD /health возвращает 200 (после отключения защиты)

---

## 🚀 Next Steps

1. **Отключить Vercel Password Protection:**
   ```
   Vercel Dashboard → Settings → Deployment Protection → Disable
   ```

2. **Проверить health endpoint:**
   ```bash
   curl -I https://peach-mini.vercel.app/health
   ```

3. **Тест в Telegram Web App:**
   - Открыть приложение в Telegram
   - Проверить что iframe загружается корректно
   - Проверить CSP headers в DevTools

---

## 📊 Deployment Info

**Production URL:** https://peach-mini-g6b5xrc2n-trsoyoleg-4006s-projects.vercel.app

**Build Output:**
- HTML: 1.44 kB (gzipped: 0.84 kB)
- CSS: 0.47 kB (gzipped: 0.32 kB)  
- JS: 336.98 kB (gzipped: 102.79 kB)

**Status:** ✅ Deployed (требуется отключить Password Protection)

---

**Дата:** 2025-10-13

