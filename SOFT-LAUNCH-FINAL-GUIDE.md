# 🚀 Peachmini Soft Launch - ФИНАЛЬНОЕ РУКОВОДСТВО

## 📋 ЧТО НУЖНО СДЕЛАТЬ ДЛЯ ЗАПУСКА

### ⏱️ **ВРЕМЯ: 15-30 минут**

---

## 🔧 ШАГ 1: НАСТРОИТЬ DEEPSEEK КЛЮЧ В VERCEL

### 1.1 Получить DeepSeek API ключ
1. Иди на https://platform.deepseek.com/
2. Зарегистрируйся/войди в аккаунт
3. Создай новый API ключ
4. Скопируй ключ (начинается с `sk-`)

### 1.2 Добавить ключ в Vercel
1. Иди на https://vercel.com/dashboard
2. Найди проект `peach-mini-clean`
3. Перейди в **Settings** → **Environment Variables**
4. Добавь новую переменную:
   - **Name**: `DEEPSEEK_KEY`
   - **Value**: `твой_ключ_от_deepseek`
   - **Environment**: Production, Preview, Development
5. Нажми **Save**

### 1.3 Перезапустить деплой
1. В том же проекте перейди в **Deployments**
2. Найди последний деплой
3. Нажми **Redeploy** → **Use existing Build Cache** = OFF
4. Дождись завершения деплоя

---

## 🔗 ШАГ 2: ОБНОВИТЬ URL В ФРОНТЕНДЕ

### 2.1 Найти текущий URL API
```bash
# В терминале выполни:
curl -s "https://peach-mini-clean-4u6zobgdg-trsoyoleg-4006s-projects.vercel.app/api/health" | jq .
```

### 2.2 Обновить фронтенд
1. Иди в проект фронтенда (peach-web)
2. Найди файл с настройками API URL
3. Замени старый URL на новый:
   ```
   Старый: https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app
   Новый: https://peach-mini-clean-4u6zobgdg-trsoyoleg-4006s-projects.vercel.app
   ```

### 2.3 Задеплоить фронтенд
```bash
cd peach-web
npm run build
vercel --prod
```

---

## 🧪 ШАГ 3: ФИНАЛЬНОЕ ТЕСТИРОВАНИЕ

### 3.1 Запустить smoke-тест
```bash
bash scripts/smoke-final.sh
```

### 3.2 Проверить все системы
1. **API Health**: ✅ Должен показать `version: "2.0.0"`
2. **Girls Count**: ✅ Должен показать `10` персонажей
3. **Chat Reply**: ✅ Должен работать с DeepSeek
4. **AI Provider**: ✅ Должен показать `deepseek`

### 3.3 Тест в браузере
1. Открой фронтенд URL
2. Проверь, что загружаются персонажи
3. Попробуй отправить сообщение в чат
4. Убедись, что получаешь ответ от AI

---

## 🎯 ШАГ 4: ПРОВЕРКА ГОТОВНОСТИ

### 4.1 Все системы должны работать:
- ✅ **API Health**: PASS
- ✅ **Girls Count**: 10
- ✅ **Chat Reply**: PASS
- ✅ **Ref Status**: PASS
- ✅ **Quests Status**: PASS
- ✅ **Front Health**: PASS
- ✅ **AI Provider**: deepseek

### 4.2 Финальная проверка:
```bash
# Проверь количество персонажей
curl -s "https://peach-mini-clean-4u6zobgdg-trsoyoleg-4006s-projects.vercel.app/api/girls" | jq '.data.girls | length'

# Должно вернуть: 10

# Проверь AI провайдер
curl -s "https://peach-mini-clean-4u6zobgdg-trsoyoleg-4006s-projects.vercel.app/api/health" | jq '.data.aiProvider'

# Должно вернуть: "deepseek"
```

---

## 🚨 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### Проблема: API показывает старую версию
**Решение:**
```bash
# Принудительно обновить деплой
npx vercel redeploy https://peach-mini-clean-4u6zobgdg-trsoyoleg-4006s-projects.vercel.app
```

### Проблема: Chat не работает
**Решение:**
1. Проверь, что `DEEPSEEK_KEY` добавлен в Vercel
2. Проверь, что ключ правильный (начинается с `sk-`)
3. Перезапусти деплой

### Проблема: Фронтенд не видит новый API
**Решение:**
1. Обнови URL в настройках фронтенда
2. Пересобери и задеплой фронтенд
3. Очисти кэш браузера

---

## 🎉 ПОСЛЕ УСПЕШНОГО ЗАПУСКА

### Что у тебя будет:
- ✅ **10 уникальных персонажей** с индивидуальностью
- ✅ **DeepSeek AI** для живого общения
- ✅ **Система квестов** для удержания пользователей
- ✅ **Реферальная система** для роста
- ✅ **Telegram WebApp** готов к интеграции
- ✅ **Глобальная доступность** без ограничений OpenAI

### Следующие шаги:
1. **Интеграция с Telegram Bot**
2. **Настройка Stars платежей**
3. **Маркетинг и продвижение**
4. **Мониторинг и аналитика**

---

## 📞 ПОДДЕРЖКА

Если что-то не работает:
1. Проверь логи в Vercel Dashboard
2. Запусти smoke-тест для диагностики
3. Проверь все URL и ключи

**Peachmini готов к покорению мира! 🚀**
