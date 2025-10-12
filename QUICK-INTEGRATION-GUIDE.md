# ⚡ Быстрая интеграция бота с WebApp - За 5 минут!

## ✅ Что готово

✅ Команда `/app` добавлена в бот
✅ Команда `/start` обновлена с web_app кнопкой
✅ Переменная `WEBAPP_URL` читается из `.env`
✅ Все существующие хендлеры работают
✅ Нет ошибок в коде

---

## 🚀 Запуск за 3 шага

### Шаг 1: Создайте `.env` файл

```bash
cd /Users/egor/Desktop/peach-mini
nano .env
```

Вставьте:
```env
BOT_TOKEN=ваш_токен_от_BotFather
WEBAPP_URL=http://localhost:5173
ADMIN_ID=ваш_telegram_id
```

Сохраните (`Ctrl+O`, `Enter`, `Ctrl+X`)

---

### Шаг 2: Запустите WebApp

```bash
cd /Users/egor/Desktop/peach-mini/vite-project
npm run dev
```

WebApp запустится на http://localhost:5173

---

### Шаг 3: Запустите бота

```bash
cd /Users/egor/Desktop/peach-mini/bot
node index.cjs
```

Должно появиться:
```
✅ Bot запустился — готов к общению с девушками!
✅ Меню команд установлено
```

---

## 🎯 Проверка работы

1. **Откройте бота в Telegram**
   
2. **Отправьте `/start`**
   - ✅ Должна появиться кнопка "🚀 Открыть Peachmini"
   
3. **Отправьте `/app`**
   - ✅ Появится клавиатура с web_app кнопкой

4. **Нажмите кнопку**
   - ⚠️ Если работает локально через `localhost:5173`, WebApp может не открыться (нужен HTTPS)
   - ✅ Для локального теста используйте ngrok (см. ниже)

---

## 🌐 Для локального тестирования (через ngrok)

### 1. Установите ngrok:
```bash
# macOS
brew install ngrok

# или скачайте с https://ngrok.com/download
```

### 2. Запустите WebApp:
```bash
cd /Users/egor/Desktop/peach-mini/vite-project
npm run dev
```

### 3. В другом терминале запустите ngrok:
```bash
ngrok http 5173
```

### 4. Скопируйте HTTPS URL:
```
Forwarding  https://xxxx-xx-xx-xxx.ngrok-free.app -> http://localhost:5173
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
             Скопируйте этот URL
```

### 5. Обновите `.env`:
```env
WEBAPP_URL=https://xxxx-xx-xx-xxx.ngrok-free.app
```

### 6. Перезапустите бота:
```bash
# Ctrl+C в терминале бота, затем:
node index.cjs
```

### 7. Протестируйте!
Теперь кнопка в боте откроет WebApp через ngrok URL ✅

---

## 📱 Для production (деплой)

### 1. Задеплойте WebApp:

**Vercel (рекомендуется)**:
```bash
cd /Users/egor/Desktop/peach-mini/vite-project
npm run build
vercel
```

**Netlify**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### 2. Получите URL деплоя:
```
✅ Production: https://your-app.vercel.app
```

### 3. Обновите `.env`:
```env
WEBAPP_URL=https://your-app.vercel.app
```

### 4. Перезапустите бота

---

## 🎨 Что добавлено в код

### В `bot/index.cjs`:

#### 1. Команда `/app` (строки 545-563):
```javascript
bot.command('app', async ctx => {
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
  await ctx.reply(
    `🚀 ОТКРЫТЬ PEACHMINI WEB APP\n\n...`,
    Markup.keyboard([
      [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)],
      ['🔙 Назад в меню']
    ]).resize()
  );
});
```

#### 2. Обновлён `/start` (строка 606):
```javascript
const menuButtons = [
  [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)], // ← НОВАЯ
  ['🎁 Дневная награда', '👥 Пригласить друзей'],
  // ... остальные кнопки
];
```

#### 3. Обработчик "Назад" (строки 1317-1340):
```javascript
if (message === '🔙 Назад в меню') {
  // Возвращает в главное меню
}
```

#### 4. Меню команд (строка 1511):
```javascript
{ command: 'app', description: '🚀 Открыть Peachmini (Web App)' },
```

---

## 📊 Команды пользователя

### В Telegram боте:

| Команда | Описание |
|---------|----------|
| `/app` | Открыть WebApp через клавиатуру |
| `/start` | Главное меню (с кнопкой WebApp) |
| Кнопка "🚀 Открыть Peachmini" | Открывает WebApp |
| Кнопка "🔙 Назад в меню" | Возврат в меню |

---

## ❓ Troubleshooting

### WebApp не открывается
- ✅ Проверьте, что `WEBAPP_URL` в `.env` начинается с `https://`
- ✅ Для локальной разработки используйте ngrok
- ✅ Перезапустите бота после изменения `.env`

### Бот не запускается
- ✅ Проверьте `BOT_TOKEN` в `.env`
- ✅ Убедитесь что `.env` находится в корне проекта
- ✅ Проверьте путь в `bot/index.cjs` (строка 4): `require('dotenv').config({ path: '../.env' })`

### Кнопка не появляется
- ✅ Обновите команды: отправьте `/start` боту снова
- ✅ Перезапустите бота
- ✅ Проверьте версию Telegraf (должна быть v4.x)

---

## 📚 Документация

- `CHANGES-SUMMARY.md` - Сводка всех изменений
- `TELEGRAM-BOT-WEBAPP-INTEGRATION.md` - Полная документация
- `ENV-SETUP.md` - Инструкции по настройке .env
- `vite-project/START-HERE.md` - Документация WebApp

---

## 🎉 Готово!

Ваш бот полностью интегрирован с WebApp!

**Команды для запуска:**
```bash
# Терминал 1: WebApp
cd vite-project && npm run dev

# Терминал 2: Бот
cd bot && node index.cjs

# Терминал 3 (опционально): ngrok для локального теста
ngrok http 5173
```

**Следующие шаги:**
1. ✅ Протестируйте локально с ngrok
2. ✅ Задеплойте WebApp на Vercel/Netlify
3. ✅ Обновите `WEBAPP_URL` в `.env`
4. ✅ Запустите бота на сервере

---

Made with 💜 for Telegram Mini Apps

**Всё работает! Наслаждайтесь!** 🚀

