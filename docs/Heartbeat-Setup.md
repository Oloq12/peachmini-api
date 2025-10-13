# 🔔 Настройка Heartbeat Мониторинга

## GitHub Actions Secrets

Для работы heartbeat мониторинга нужно добавить следующие secrets в GitHub:

### Как добавить secrets:
1. Перейдите в Settings → Secrets and variables → Actions
2. Нажмите "New repository secret"
3. Добавьте следующие переменные:

### Необходимые Secrets:

```
BOT_TOKEN=<ваш_telegram_bot_token>
ADMIN_TG_ID=<ваш_telegram_user_id>
```

#### Как получить ADMIN_TG_ID:
1. Откройте [@userinfobot](https://t.me/userinfobot)
2. Отправьте `/start`
3. Скопируйте ваш ID (например: 123456789)

---

## Workflow

**Файл:** `.github/workflows/heartbeat.yml`

**Расписание:** Каждые 5 минут (*/5 * * * *)

**Проверки:**
- ✅ API: `GET /api/health`
- ✅ Frontend: `GET /health`

**Уведомления:**
- 🚨 При сбое любого из сервисов отправляется сообщение в Telegram

---

## Запуск вручную

1. Перейдите в GitHub: **Actions** → **Heartbeat**
2. Нажмите **Run workflow** → **Run workflow**
3. Проверьте результаты в логах

---

## Мониторинг

- Успешные запуски: зеленая галочка ✅
- Ошибки: красный крестик ❌ + Telegram уведомление
- История: сохраняется в Actions logs

---

## URLs мониторинга:

**API:**  
https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

**Frontend:**  
https://peach-e0dyhhciv-trsoyoleg-4006s-projects.vercel.app/health

