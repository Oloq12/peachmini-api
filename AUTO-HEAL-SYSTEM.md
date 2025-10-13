# 🔧 Auto-Heal System - Self-Healing API

## Дата: 2025-10-13

---

## 🎯 Цель

Автоматическое восстановление Peachmini API при сбоях.

**Принцип:** Peachmini всегда восстанавливается, даже при сбое.

---

## ✅ Возможности

### 1. **Health Checks** ✅
- Проверка `/api/health` (с повторами)
- Проверка `/api/girls` (валидация данных)
- Настраиваемое количество попыток

### 2. **Auto-Restart** ✅
- Определение сбоя API
- Остановка упавшего процесса
- Запуск нового процесса
- Проверка успешного запуска

### 3. **Monitoring Mode** ✅
- Непрерывный мониторинг (каждые N секунд)
- Автовосстановление при сбое
- Статистика проверок и восстановлений
- Логирование в файл

### 4. **Smart Recovery** ✅
- Graceful shutdown (SIGTERM)
- Force kill если процесс завис (SIGKILL)
- Очистка портов (lsof)
- PID tracking для надежности

---

## 🚀 Quick Start

### Одноразовое автовосстановление

```bash
# NPM script
npm run doctor:auto

# Или напрямую
./scripts/auto-heal.sh check
```

**Что делает:**
1. Проверяет `/api/health`
2. Проверяет `/api/girls`
3. Если ошибка → перезапускает сервер
4. Повторно проверяет здоровье
5. Выход с кодом 0 (успех) или 1 (ошибка)

---

### Непрерывный мониторинг

```bash
# NPM script
npm run doctor:monitor

# Или напрямую
./scripts/auto-heal.sh monitor
```

**Что делает:**
- Проверяет API каждые 30 секунд
- При сбое автоматически перезапускает
- Показывает статистику
- Логирует в `auto-heal.log`
- Работает до Ctrl+C

---

## 📋 Режимы работы

### 1. Check (Одноразовый)

```bash
./scripts/auto-heal.sh check
```

**Использование:**
- Разовая проверка и лечение
- CI/CD пайплайны
- Pre-deployment checks
- Cron jobs

---

### 2. Monitor (Непрерывный)

```bash
./scripts/auto-heal.sh monitor
```

**Использование:**
- Development environment
- Локальная разработка
- Debug sessions
- Long-running tasks

---

### 3. Start/Stop/Restart

```bash
# Запустить сервер
./scripts/auto-heal.sh start

# Остановить сервер
./scripts/auto-heal.sh stop

# Перезапустить сервер
./scripts/auto-heal.sh restart
```

**Использование:**
- Ручное управление сервером
- Debugging
- Maintenance

---

## ⚙️ Configuration

### Environment Variables

```bash
# API URL (default: http://localhost:8787)
API_URL=http://localhost:8787

# Интервал проверки в секундах (default: 30)
CHECK_INTERVAL=30

# Максимум попыток при проверке (default: 3)
MAX_RETRIES=3

# Задержка между попытками в секундах (default: 5)
RETRY_DELAY=5

# Файл логов (default: ./auto-heal.log)
LOG_FILE=./auto-heal.log
```

### Примеры

```bash
# Быстрые проверки (каждые 10 сек)
CHECK_INTERVAL=10 ./scripts/auto-heal.sh monitor

# Много попыток перед рестартом
MAX_RETRIES=5 RETRY_DELAY=3 ./scripts/auto-heal.sh check

# Кастомный URL
API_URL=http://localhost:3000 ./scripts/auto-heal.sh check
```

---

## 📊 Flow Diagram

```
┌─────────────────┐
│ Start Auto-Heal │
└────────┬────────┘
         │
         v
┌─────────────────────┐
│ Check /api/health   │
│ (with retries)      │
└────────┬────────────┘
         │
         v
    [Healthy?]
         │
    ┌────┴────┐
   Yes       No
    │         │
    v         v
┌────────┐  ┌──────────────┐
│ Check  │  │ Mark for     │
│ /girls │  │ restart      │
└───┬────┘  └──────┬───────┘
    │              │
    v              │
[Healthy?]         │
    │              │
   Yes             │
    │              │
    v         ┌────┘
┌─────────┐   │
│ All OK  │   │
└─────────┘   │
              v
         ┌──────────────┐
         │ Stop Server  │
         │ - SIGTERM    │
         │ - SIGKILL    │
         │ - Clean port │
         └──────┬───────┘
                │
                v
         ┌──────────────┐
         │ Start Server │
         │ - Run node   │
         │ - Save PID   │
         │ - Wait 5s    │
         └──────┬───────┘
                │
                v
         ┌──────────────┐
         │ Verify Start │
         │ - Check PID  │
         │ - Test health│
         └──────┬───────┘
                │
                v
           [Success?]
                │
           ┌────┴────┐
          Yes       No
           │         │
           v         v
        ┌────┐    ┌──────┐
        │ OK │    │ FAIL │
        └────┘    └──────┘
```

---

## 🧪 Testing

### Test 1: Normal Operation

```bash
# Запустить сервер
cd api && node index.js &

# Запустить auto-heal check
npm run doctor:auto

# Expected output:
✅ /api/health OK
✅ /api/girls OK (count: 6)
✅ Все системы работают нормально
```

---

### Test 2: Server Down

```bash
# Убить сервер
killall node

# Запустить auto-heal
npm run doctor:auto

# Expected output:
❌ /api/health FAIL после 3 попыток
⚠️ Обнаружены проблемы, выполняем автовосстановление...
🔄 Перезапуск сервера...
Сервер запущен с PID: 12345
✅ /api/health OK
✅ /api/girls OK
🎉 Автовосстановление успешно!
```

---

### Test 3: Monitor Mode

```bash
# Запустить мониторинг
npm run doctor:monitor

# Во время работы убить сервер в другом терминале
killall node

# Expected:
Проверка #5 (14:35:20)
❌ /api/health FAIL
⚠️ Обнаружены проблемы, выполняем автовосстановление...
✅ Автовосстановление успешно!
Статистика: Проверок: 5 | Ошибок: 1 | Восстановлений: 1
```

---

## 📝 Log Example

**File:** `auto-heal.log`

```
2025-10-13 14:30:15 [INFO] Проверяем /api/health...
2025-10-13 14:30:15 [SUCCESS] ✅ /api/health OK
2025-10-13 14:30:15 [INFO] Проверяем /api/girls...
2025-10-13 14:30:15 [SUCCESS] ✅ /api/girls OK (count: 6)
2025-10-13 14:30:15 [SUCCESS] ✅ Все системы работают нормально

2025-10-13 14:32:45 [INFO] Проверяем /api/health...
2025-10-13 14:32:45 [WARN] Попытка 1/3 не удалась, повтор через 5s...
2025-10-13 14:32:50 [WARN] Попытка 2/3 не удалась, повтор через 5s...
2025-10-13 14:32:55 [ERROR] ❌ /api/health FAIL после 3 попыток
2025-10-13 14:32:55 [WARN] ⚠️ Обнаружены проблемы, выполняем автовосстановление...
2025-10-13 14:32:55 [INFO] Останавливаем существующий сервер...
2025-10-13 14:32:55 [INFO] Освобождаем порт 8787 (PID: 12345)...
2025-10-13 14:32:55 [SUCCESS] Сервер остановлен
2025-10-13 14:32:55 [INFO] Запускаем API сервер...
2025-10-13 14:32:55 [INFO] Сервер запущен с PID: 12346
2025-10-13 14:33:00 [SUCCESS] Сервер успешно запущен
2025-10-13 14:33:00 [SUCCESS] ✅ Сервер успешно перезапущен
2025-10-13 14:33:03 [INFO] Проверяем здоровье после восстановления...
2025-10-13 14:33:03 [SUCCESS] ✅ /api/health OK
2025-10-13 14:33:03 [SUCCESS] ✅ /api/girls OK (count: 6)
2025-10-13 14:33:03 [SUCCESS] 🎉 Автовосстановление успешно!
```

---

## 🔍 Troubleshooting

### Problem: Port already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::8787
```

**Solution:**
```bash
# Auto-heal автоматически очищает порт
./scripts/auto-heal.sh restart

# Или вручную
lsof -ti:8787 | xargs kill -9
```

---

### Problem: PID file stale

**Error:**
```
Process 12345 not found but PID file exists
```

**Solution:**
```bash
# Удалить stale PID file
rm .api-server.pid

# Запустить заново
./scripts/auto-heal.sh start
```

---

### Problem: Server won't start

**Error:**
```
❌ Сервер не запустился
```

**Solution:**
```bash
# Проверить логи сервера
cat api-server.log

# Проверить что api/index.js существует
ls -la api/index.js

# Проверить зависимости
cd api && npm install
```

---

## 📊 Statistics Example

**Monitor Mode Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Проверка #42 (15:30:00)
✅ /api/health OK
✅ /api/girls OK (count: 6)
Статус: Здоров ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Статистика: Проверок: 42 | Ошибок: 3 | Восстановлений: 3

Uptime: 98.7% (41/42 successful checks)
Следующая проверка через 30s...
```

---

## 🚀 Integration

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Deploy
        run: npm run deploy
      
      - name: Health Check & Auto-Heal
        run: |
          sleep 10  # Wait for deploy
          npm run doctor:auto
```

---

### Systemd Service

```ini
# /etc/systemd/system/peachmini-monitor.service
[Unit]
Description=Peachmini Auto-Heal Monitor
After=network.target

[Service]
Type=simple
User=peachmini
WorkingDirectory=/opt/peachmini
ExecStart=/usr/bin/bash scripts/auto-heal.sh monitor
Restart=always

[Install]
WantedBy=multi-user.target
```

---

### Cron Job

```bash
# Проверка каждые 5 минут
*/5 * * * * cd /opt/peachmini && npm run doctor:auto >> /var/log/peachmini-heal.log 2>&1
```

---

## 📋 NPM Scripts

```json
{
  "scripts": {
    "doctor:auto": "bash scripts/auto-heal.sh check",
    "doctor:monitor": "bash scripts/auto-heal.sh monitor"
  }
}
```

**Usage:**
```bash
# Одноразовое автовосстановление
npm run doctor:auto

# Непрерывный мониторинг
npm run doctor:monitor
```

---

## ✅ Checklist

### Implementation
- [x] Health check с повторами
- [x] Girls endpoint валидация
- [x] Graceful server shutdown
- [x] Force kill fallback
- [x] Port cleanup (lsof)
- [x] PID tracking
- [x] Auto-restart logic
- [x] Monitor mode
- [x] Logging to file
- [x] Statistics tracking
- [x] Color output
- [x] Help documentation

### Testing
- [ ] Test normal operation
- [ ] Test server crash recovery
- [ ] Test monitor mode
- [ ] Test custom intervals
- [ ] Test start/stop/restart
- [ ] Test log file creation
- [ ] Test multiple failures

### Integration
- [ ] Add to CI/CD
- [ ] Setup systemd (production)
- [ ] Configure cron (optional)
- [ ] Document team workflow

---

## 🎯 Best Practices

### Development

```bash
# Разработка с автовосстановлением
npm run doctor:monitor

# В другом терминале
cd peach-web && npm run dev
```

### Production

```bash
# Pre-deployment check
npm run doctor:auto || exit 1

# Deploy
npm run deploy

# Post-deployment verification
sleep 10 && npm run doctor:auto
```

---

## 📝 Next Steps

1. **Test Auto-Heal**
   ```bash
   npm run doctor:auto
   ```

2. **Start Monitoring** (Optional)
   ```bash
   npm run doctor:monitor &
   ```

3. **Integrate to Workflow**
   - Add to CI/CD
   - Setup cron job
   - Configure systemd

4. **Monitor Logs**
   ```bash
   tail -f auto-heal.log
   ```

---

**Status:** ✅ Auto-Heal System Ready

**Self-Healing:** Enabled

**Resilience:** Maximum

**Дата:** 2025-10-13

