# ⚡ Auto-Heal - Quick Guide

## 🎯 Что это?

Автоматическое восстановление Peachmini API при сбоях.

**Принцип:** API всегда восстанавливается сам, даже при сбое.

---

## 🚀 Quick Start

### Одноразовое автовосстановление

```bash
npm run doctor:auto
```

**Делает:**
1. Проверяет `/api/health`
2. Проверяет `/api/girls`
3. Если ошибка → перезапускает сервер
4. Проверяет снова

---

### Непрерывный мониторинг

```bash
npm run doctor:monitor
```

**Делает:**
- Проверяет API каждые 30 секунд
- При сбое автоматически чинит
- Показывает статистику
- Ctrl+C для остановки

---

## 📋 Команды

```bash
# Проверка и лечение
npm run doctor:auto

# Непрерывный мониторинг
npm run doctor:monitor

# Прямые команды
./scripts/auto-heal.sh check      # Проверка
./scripts/auto-heal.sh monitor    # Мониторинг
./scripts/auto-heal.sh start      # Запустить сервер
./scripts/auto-heal.sh stop       # Остановить
./scripts/auto-heal.sh restart    # Перезапуск
./scripts/auto-heal.sh help       # Справка
```

---

## ⚙️ Настройка

```bash
# Кастомный интервал (60 секунд)
CHECK_INTERVAL=60 npm run doctor:monitor

# Больше попыток
MAX_RETRIES=5 npm run doctor:auto

# Другой URL
API_URL=http://localhost:3000 npm run doctor:auto
```

---

## 🧪 Тест

### Сценарий 1: Все работает

```bash
npm run doctor:auto

# Output:
✅ /api/health OK
✅ /api/girls OK (count: 6)
✅ Все системы работают нормально
```

### Сценарий 2: Сервер упал

```bash
# Убить сервер
killall node

# Запустить auto-heal
npm run doctor:auto

# Output:
❌ /api/health FAIL
⚠️ Выполняем автовосстановление...
🔄 Перезапуск сервера...
✅ Сервер запущен с PID: 12345
🎉 Автовосстановление успешно!
```

---

## 📊 Monitor Mode

```bash
npm run doctor:monitor

# Output:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Проверка #1 (14:30:00)
✅ /api/health OK
✅ /api/girls OK (count: 6)
Статус: Здоров ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Статистика: Проверок: 1 | Ошибок: 0 | Восстановлений: 0
Следующая проверка через 30s...
```

**При сбое:**
```
Проверка #5 (14:35:00)
❌ /api/health FAIL
⚠️ Обнаружены проблемы, выполняем автовосстановление...
✅ Автовосстановление успешно!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Статистика: Проверок: 5 | Ошибок: 1 | Восстановлений: 1
```

---

## 📝 Логи

```bash
# Посмотреть логи
cat auto-heal.log

# Следить за логами
tail -f auto-heal.log
```

**Пример:**
```
2025-10-13 14:30:15 [SUCCESS] ✅ /api/health OK
2025-10-13 14:30:15 [SUCCESS] ✅ /api/girls OK (count: 6)
2025-10-13 14:32:45 [ERROR] ❌ /api/health FAIL
2025-10-13 14:32:45 [INFO] 🔄 Перезапуск сервера...
2025-10-13 14:33:00 [SUCCESS] 🎉 Автовосстановление успешно!
```

---

## 🔧 Troubleshooting

### Порт занят

```bash
./scripts/auto-heal.sh restart
```

### Сервер не запускается

```bash
# Проверить логи
cat api-server.log

# Проверить зависимости
cd api && npm install
```

---

## ✅ Use Cases

### Development

```bash
# В одном терминале
npm run doctor:monitor

# В другом
cd peach-web && npm run dev
```

### CI/CD

```bash
# После deploy
npm run doctor:auto || exit 1
```

### Cron Job

```bash
# Каждые 5 минут
*/5 * * * * cd /path/to/peachmini && npm run doctor:auto
```

---

## 📚 Docs

- **AUTO-HEAL-SYSTEM.md** - Полная документация
- **AUTO-HEAL-QUICK.md** - Этот гайд
- **scripts/auto-heal.sh** - Исходный код

---

**Status:** ✅ Ready

**Self-Healing:** Enabled

**Команда:** `npm run doctor:auto`

