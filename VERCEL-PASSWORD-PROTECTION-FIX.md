# 🔓 Как отключить Vercel Password Protection

## Проблема

```bash
curl -I https://peach-mini-xxx.vercel.app/health
# HTTP/2 401 Unauthorized ❌
```

---

## ✅ Решение

### Вариант 1: Через Vercel Dashboard (рекомендуется)

1. **Открыть настройки проекта:**
   ```
   https://vercel.com/trsoyoleg-4006s-projects/peach-mini/settings/security
   ```

2. **Deployment Protection → Отключить:**
   - Найти "Vercel Authentication"
   - Переключить в OFF
   - Сохранить

3. **Проверить:**
   ```bash
   curl -I https://peach-mini-xxx.vercel.app/health
   # HTTP/2 200 OK ✅
   ```

---

### Вариант 2: Добавить публичный endpoint

**Создать файл:** `vercel.json`

```json
{
  "headers": [
    {
      "source": "/health",
      "headers": [
        {
          "key": "X-Vercel-Protection-Bypass",
          "value": "true"
        }
      ]
    }
  ]
}
```

**Применить:**
```bash
vercel --prod
```

---

### Вариант 3: Использовать Custom Domain

1. **Settings → Domains**
2. **Add Domain:**
   ```
   peach-mini.yourdomain.com
   ```
3. **Production домен будет доступен публично**

---

### Вариант 4: Environment Variable

```bash
# Удалить переменную защиты
vercel env rm VERCEL_PASSWORD_PROTECTION production

# Redeploy
vercel --prod
```

---

## 🧪 Проверка после отключения

```bash
# HEAD запрос
curl -I https://peach-mini.vercel.app/health

# Должно вернуть:
HTTP/2 200 OK
content-security-policy: frame-ancestors https://web.telegram.org...
content-type: application/json

# Полный запрос
curl https://peach-mini.vercel.app/health
# {"ok":true,"data":{...}}
```

---

## 📋 Checklist

После отключения защиты:
- [ ] `curl -I /health` → 200 OK
- [ ] CSP header присутствует
- [ ] Приложение открывается в Telegram Web App
- [ ] Нет ошибок CORS/CSP в консоли

---

**Рекомендация:** Используйте Вариант 1 (Dashboard) - самый простой и надежный способ!

