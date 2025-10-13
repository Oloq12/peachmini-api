# 💓 Heartbeat Monitor - Setup Guide

## 🎯 Что это?

GitHub Actions workflow, который проверяет доступность API и Frontend каждые 5 минут и отправляет уведомления в Telegram при падении.

---

## ⚙️ Настройка GitHub Secrets

### 1. Перейди в Settings репозитория

```
GitHub → Your Repo → Settings → Secrets and variables → Actions
```

### 2. Добавь секреты

Нажми **"New repository secret"** и добавь:

#### Secret 1: `BOT_TOKEN`
```
Значение: Токен от @BotFather (тот же, что в .env)
Пример: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

#### Secret 2: `ADMIN_TG_ID`
```
Значение: Твой Telegram ID (получи от @userinfobot)
Пример: 123456789
```

---

## 🚀 Запуск

### Вручную (для теста)

1. Перейди в **Actions** → **Heartbeat Monitor**
2. Нажми **"Run workflow"**
3. Выбери ветку **main** (или master)
4. Нажми **"Run workflow"**

### Автоматически

Workflow автоматически запускается каждые 5 минут по расписанию:
```yaml
schedule:
  - cron: "*/5 * * * *"
```

---

## 📊 Что проверяется

### API Health Check
```bash
curl -fsSL https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health
```

**Ожидается:** Статус 200 OK

### Frontend Health Check
```bash
curl -fsSL -I https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app
```

**Ожидается:** HTTP 200 OK в заголовках

---

## 📱 Уведомления в Telegram

### При падении API
```
🚨 Peachmini API DOWN

⏰ Time: 2025-10-13 12:00:00 UTC
🔗 URL: https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

❌ Health check failed
```

### При падении Frontend
```
🚨 Peachmini Frontend DOWN

⏰ Time: 2025-10-13 12:00:00 UTC
🔗 URL: https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app

❌ Health check failed
```

### При успешной проверке (только при ручном запуске)
```
✅ Peachmini Health Check

⏰ Time: 2025-10-13 12:00:00 UTC

✅ API: UP
✅ Frontend: UP

🎉 All systems operational!
```

---

## 🔍 Мониторинг

### Проверить статус в GitHub

1. Перейди в **Actions**
2. Найди **Heartbeat Monitor**
3. Посмотри последние запуски

### Проверить локально

```bash
# API
curl -fsSL https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health

# Frontend
curl -fsSL -I https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app
```

---

## ⚠️ Troubleshooting

### Workflow не запускается

**Проблема:** GitHub Actions отключены

**Решение:**
1. Перейди в **Settings** → **Actions** → **General**
2. Включи **"Allow all actions and reusable workflows"**
3. Сохрани

### Не приходят уведомления в Telegram

**Проблема 1:** Неправильный `BOT_TOKEN`

**Решение:**
1. Проверь токен от @BotFather
2. Обнови secret в GitHub

**Проблема 2:** Неправильный `ADMIN_TG_ID`

**Решение:**
1. Получи свой ID от @userinfobot
2. Обнови secret в GitHub

**Проблема 3:** Бот не может отправлять сообщения

**Решение:**
1. Напиши боту `/start`
2. Проверь, что бот активен

### Ложные срабатывания

**Проблема:** Workflow падает на временных сбоях

**Решение:**
Добавь retry в workflow:
```yaml
- name: Check API Health
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 1
    max_attempts: 3
    command: curl -fsSL https://...
```

---

## 📈 Расширенный мониторинг

### Добавить проверку времени ответа

```yaml
- name: Check API Response Time
  run: |
    START=$(date +%s%N)
    curl -fsSL https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/health
    END=$(date +%s%N)
    DIFF=$(( ($END - $START) / 1000000 ))
    echo "Response time: ${DIFF}ms"
    
    if [ $DIFF -gt 3000 ]; then
      echo "⚠️ Slow response: ${DIFF}ms"
      # Отправить уведомление о медленном ответе
    fi
```

### Добавить Slack/Discord уведомления

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Peachmini API is DOWN!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🔄 Альтернативные сервисы мониторинга

### UptimeRobot (Рекомендуется)
```
https://uptimerobot.com
- Бесплатно до 50 мониторов
- Проверка каждые 5 минут
- Email/SMS/Telegram уведомления
```

### Pingdom
```
https://www.pingdom.com
- Проверка из разных регионов
- Детальная аналитика
```

### Better Uptime
```
https://betteruptime.com
- Красивые status pages
- Incident management
```

---

## 📋 Checklist

### Первоначальная настройка
- [ ] Создан `.github/workflows/heartbeat.yml`
- [ ] Добавлен secret `BOT_TOKEN` в GitHub
- [ ] Добавлен secret `ADMIN_TG_ID` в GitHub
- [ ] Включены GitHub Actions в репозитории
- [ ] Протестирован ручной запуск workflow
- [ ] Проверены уведомления в Telegram

### Проверка работы
- [ ] Workflow запускается автоматически каждые 5 минут
- [ ] API health check работает
- [ ] Frontend health check работает
- [ ] Telegram уведомления приходят при сбое
- [ ] Job падает при ошибке проверки

---

## 🎯 Best Practices

### 1. Не спамить уведомлениями
```yaml
# Отправлять успешное уведомление только при ручном запуске
if: github.event_name == 'workflow_dispatch'
```

### 2. Группировать проверки
```yaml
# Проверить оба сервиса перед отправкой уведомления
if: steps.api_check.outputs.api_status == 'failed' || steps.front_check.outputs.front_status == 'failed'
```

### 3. Добавить контекст
```yaml
text: "🚨 API DOWN\n⏰ Time: $(date)\n🔗 URL: ...\n💡 Check logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

---

## 📝 Пример работы

### Успешная проверка (лог)
```
🔍 Checking API health...
{"ok":true,"timestamp":"2025-10-13T12:00:00.000Z"}
✅ API is UP

🔍 Checking Frontend health...
HTTP/2 200
✅ Frontend is UP

✅ All systems operational!
```

### Неуспешная проверка (лог)
```
🔍 Checking API health...
curl: (22) The requested URL returned error: 502
❌ API is DOWN

📱 Sending Telegram notification...
{"ok":true,"result":{"message_id":123}}

❌ Health check failed!
```

---

## 🔗 Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Cron Schedule Examples](https://crontab.guru/)

---

## ✅ Готово!

Теперь у вас есть автоматический мониторинг с уведомлениями в Telegram!

**Следующие шаги:**
1. Настроить GitHub Secrets
2. Запустить workflow вручную для теста
3. Проверить уведомления
4. Дождаться автоматического запуска

---

**Создано:** 2025-10-13  
**Файл:** `.github/workflows/heartbeat.yml`  
**Статус:** ✅ Ready to use
