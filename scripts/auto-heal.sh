#!/bin/bash

# Auto-Heal Script для Peachmini
# Проверяет здоровье API и автоматически восстанавливает при сбое

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8787}"
CHECK_INTERVAL="${CHECK_INTERVAL:-30}"  # Секунд между проверками
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-5}"
LOG_FILE="${LOG_FILE:-./auto-heal.log}"

# PID file для отслеживания процесса сервера
PID_FILE="./.api-server.pid"

# Helper functions
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
  echo -e "${BLUE}[INFO]${NC} $@"
  log "INFO" "$@"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $@"
  log "SUCCESS" "$@"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $@"
  log "WARN" "$@"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $@"
  log "ERROR" "$@"
}

# Проверка health endpoint
check_health() {
  local url=$1
  local endpoint=$2
  
  if curl -fsSL --max-time 5 "${url}${endpoint}" > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Проверка JSON ответа
check_json_response() {
  local url=$1
  local endpoint=$2
  
  local response=$(curl -fsSL --max-time 5 "${url}${endpoint}" 2>/dev/null)
  
  if echo "$response" | jq -e '.ok == true' > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Остановка существующего сервера
stop_server() {
  log_info "Останавливаем существующий сервер..."
  
  # Проверяем PID file
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
      log_info "Убиваем процесс $pid..."
      kill "$pid" 2>/dev/null || true
      sleep 2
      
      # Если процесс еще жив, force kill
      if ps -p "$pid" > /dev/null 2>&1; then
        log_warn "Процесс $pid не остановился, force kill..."
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$PID_FILE"
  fi
  
  # Убиваем все процессы на порту 8787
  local port_pid=$(lsof -ti:8787 2>/dev/null || true)
  if [ -n "$port_pid" ]; then
    log_info "Освобождаем порт 8787 (PID: $port_pid)..."
    kill -9 $port_pid 2>/dev/null || true
  fi
  
  log_success "Сервер остановлен"
}

# Запуск сервера
start_server() {
  log_info "Запускаем API сервер..."
  
  cd "$(dirname "$0")/.." || exit 1
  
  # Проверяем что api/index.js существует
  if [ ! -f "api/index.js" ]; then
    log_error "api/index.js не найден!"
    exit 1
  fi
  
  # Запускаем сервер в фоне
  (cd api && node index.js > ../api-server.log 2>&1) &
  local pid=$!
  
  # Сохраняем PID
  echo "$pid" > "$PID_FILE"
  
  log_info "Сервер запущен с PID: $pid"
  
  # Ждем инициализации (5 секунд)
  log_info "Ждем инициализации сервера..."
  sleep 5
  
  # Проверяем что сервер запустился
  if ps -p "$pid" > /dev/null 2>&1; then
    log_success "Сервер успешно запущен"
    return 0
  else
    log_error "Сервер не запустился"
    rm -f "$PID_FILE"
    return 1
  fi
}

# Перезапуск сервера
restart_server() {
  log_warn "🔄 Перезапуск сервера..."
  
  stop_server
  sleep 2
  
  if start_server; then
    log_success "✅ Сервер успешно перезапущен"
    return 0
  else
    log_error "❌ Не удалось перезапустить сервер"
    return 1
  fi
}

# Проверка здоровья API
check_api_health() {
  local retries=0
  
  log_info "Проверяем /api/health..."
  
  while [ $retries -lt $MAX_RETRIES ]; do
    if check_json_response "$API_URL" "/api/health"; then
      log_success "✅ /api/health OK"
      return 0
    fi
    
    retries=$((retries + 1))
    if [ $retries -lt $MAX_RETRIES ]; then
      log_warn "Попытка $retries/$MAX_RETRIES не удалась, повтор через ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
    fi
  done
  
  log_error "❌ /api/health FAIL после $MAX_RETRIES попыток"
  return 1
}

# Проверка girls endpoint
check_girls_endpoint() {
  local retries=0
  
  log_info "Проверяем /api/girls..."
  
  while [ $retries -lt $MAX_RETRIES ]; do
    local response=$(curl -fsSL --max-time 5 "${API_URL}/api/girls" 2>/dev/null || echo "")
    
    if echo "$response" | jq -e '.ok == true and (.data.girls | length) > 0' > /dev/null 2>&1; then
      local count=$(echo "$response" | jq -r '.data.girls | length')
      log_success "✅ /api/girls OK (count: $count)"
      return 0
    fi
    
    retries=$((retries + 1))
    if [ $retries -lt $MAX_RETRIES ]; then
      log_warn "Попытка $retries/$MAX_RETRIES не удалась, повтор через ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
    fi
  done
  
  log_error "❌ /api/girls FAIL после $MAX_RETRIES попыток"
  return 1
}

# Основная функция проверки и восстановления
heal_check() {
  local need_restart=false
  
  log_info "=== Проверка здоровья API ==="
  
  # Проверка /api/health
  if ! check_api_health; then
    need_restart=true
  fi
  
  # Проверка /api/girls
  if ! check_girls_endpoint; then
    need_restart=true
  fi
  
  # Если нужен перезапуск
  if [ "$need_restart" = true ]; then
    log_warn "⚠️ Обнаружены проблемы, выполняем автовосстановление..."
    
    if restart_server; then
      # Повторная проверка после перезапуска
      log_info "Проверяем здоровье после восстановления..."
      sleep 3
      
      if check_api_health && check_girls_endpoint; then
        log_success "🎉 Автовосстановление успешно!"
        return 0
      else
        log_error "❌ Восстановление не помогло"
        return 1
      fi
    else
      log_error "❌ Не удалось восстановить сервер"
      return 1
    fi
  else
    log_success "✅ Все системы работают нормально"
    return 0
  fi
}

# Режим мониторинга (continuous)
monitor_mode() {
  log_info "🔍 Запуск режима непрерывного мониторинга..."
  log_info "Интервал проверки: ${CHECK_INTERVAL}s"
  log_info "Логи: $LOG_FILE"
  log_info "Нажмите Ctrl+C для остановки"
  echo ""
  
  # Убедимся что сервер запущен
  if ! check_health "$API_URL" "/api/health" 2>/dev/null; then
    log_warn "Сервер не запущен, запускаем..."
    start_server || exit 1
  fi
  
  local check_count=0
  local error_count=0
  local heal_count=0
  
  while true; do
    check_count=$((check_count + 1))
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log_info "Проверка #$check_count ($(date '+%H:%M:%S'))"
    
    if heal_check; then
      log_success "Статус: Здоров ✅"
    else
      error_count=$((error_count + 1))
      heal_count=$((heal_count + 1))
      log_error "Статус: Восстановлен после сбоя ⚠️"
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Статистика: Проверок: $check_count | Ошибок: $error_count | Восстановлений: $heal_count"
    
    log_info "Следующая проверка через ${CHECK_INTERVAL}s..."
    sleep $CHECK_INTERVAL
  done
}

# Режим одноразовой проверки и лечения
oneshot_mode() {
  log_info "🔧 Одноразовая проверка и автовосстановление..."
  
  if heal_check; then
    log_success "✅ API работает нормально"
    exit 0
  else
    log_error "❌ Не удалось восстановить API"
    exit 1
  fi
}

# Показать справку
show_help() {
  cat << EOF
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${BLUE}  🔧 Peachmini Auto-Heal Script${NC}
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${GREEN}Использование:${NC}
  ./scripts/auto-heal.sh [режим] [опции]

${GREEN}Режимы:${NC}
  check       Одноразовая проверка и восстановление (по умолчанию)
  monitor     Непрерывный мониторинг с автовосстановлением
  start       Запустить сервер
  stop        Остановить сервер
  restart     Перезапустить сервер
  help        Показать эту справку

${GREEN}Опции:${NC}
  API_URL=<url>              API URL (default: http://localhost:8787)
  CHECK_INTERVAL=<seconds>   Интервал проверки (default: 30)
  MAX_RETRIES=<num>          Макс попыток (default: 3)
  RETRY_DELAY=<seconds>      Задержка между попытками (default: 5)

${GREEN}Примеры:${NC}
  # Одноразовая проверка и лечение
  ./scripts/auto-heal.sh check

  # Непрерывный мониторинг
  ./scripts/auto-heal.sh monitor

  # Мониторинг с кастомным интервалом
  CHECK_INTERVAL=60 ./scripts/auto-heal.sh monitor

  # Запуск сервера
  ./scripts/auto-heal.sh start

  # Перезапуск сервера
  ./scripts/auto-heal.sh restart

${GREEN}NPM Scripts:${NC}
  npm run doctor:auto        Одноразовое автовосстановление
  npm run doctor:monitor     Непрерывный мониторинг

${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
EOF
}

# Cleanup при выходе
cleanup() {
  log_info "\n👋 Завершение мониторинга..."
  exit 0
}

trap cleanup SIGINT SIGTERM

# Main
main() {
  local mode="${1:-check}"
  
  case "$mode" in
    check|oneshot)
      oneshot_mode
      ;;
    monitor|watch)
      monitor_mode
      ;;
    start)
      start_server
      ;;
    stop)
      stop_server
      ;;
    restart)
      restart_server
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      log_error "Неизвестный режим: $mode"
      show_help
      exit 1
      ;;
  esac
}

# Run
main "$@"

