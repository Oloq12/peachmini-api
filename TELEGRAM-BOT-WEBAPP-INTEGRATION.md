# 🤖 Интеграция Telegram бота с WebApp

## ✅ Что было добавлено

### 1. Команда `/app` (НОВАЯ)
**Файл**: `bot/index.cjs` (строки 545-563)

Добавлена новая команда `/app`, которая отправляет клавиатуру с web_app кнопкой:

```javascript
bot.command('app', async ctx => {
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
  
  await ctx.reply(
    `🚀 ОТКРЫТЬ PEACHMINI WEB APP\n\n` +
    `✨ Красивый интерфейс с:\n` +
    `• 🏠 Главная страница\n` +
    `• 💬 Чаты с девушками\n` +
    `• ✨ Создание персонажа\n` +
    `• 🛍️ Магазин\n` +
    `• ⚙️ Настройки\n\n` +
    `👇 Нажмите кнопку ниже:`,
    Markup.keyboard([
      [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)],
      ['🔙 Назад в меню']
    ]).resize()
  );
});
```

**Что делает**:
- Читает `WEBAPP_URL` из `.env`
- Показывает клавиатуру с одной web_app кнопкой "🚀 Открыть Peachmini"
- Добавляет кнопку "🔙 Назад в меню" для возврата

---

### 2. Обновлен `/start` (ИЗМЕНЕНО)
**Файл**: `bot/index.cjs` (строки 597-623)

Добавлена web_app кнопка в главное меню:

```javascript
const userName = ctx.from.first_name || 'незнакомец';
const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

// ... код создания кнопок персонажей ...

const menuButtons = [
  [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)], // ← НОВАЯ КНОПКА
  ['🎁 Дневная награда', '👥 Пригласить друзей'],
  ['🎯 Задания', '🛒 Магазин'],
  ['💎 Premium', '📊 Мой профиль']
];
```

**Что изменилось**:
- Добавлена web_app кнопка в самом верху меню
- Теперь при `/start` пользователь сразу видит кнопку открытия WebApp
- Кнопка использует URL из `WEBAPP_URL`

---

### 3. Обработчик кнопки "🔙 Назад в меню" (НОВЫЙ)
**Файл**: `bot/index.cjs` (строки 1317-1340)

```javascript
if (message === '🔙 Назад в меню') {
  // Возвращает пользователя в главное меню
  const userName = ctx.from.first_name || 'незнакомец';
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
  
  // ... создание клавиатуры ...
  
  return ctx.reply(
    `👋 С возвращением, ${userName}!\n\n` +
    `Выбери девушку для общения или используй меню:`,
    Markup.keyboard(keyboard).resize()
  );
}
```

---

### 4. Добавлена команда в меню бота (ИЗМЕНЕНО)
**Файл**: `bot/index.cjs` (строки 1510-1517)

```javascript
const commands = [
  { command: 'app', description: '🚀 Открыть Peachmini (Web App)' }, // ← НОВАЯ
  { command: 'start', description: '🔥 Главное меню и выбор девушки' },
  { command: 'shop', description: '🛒 Магазин (фото, сообщения, премиум)' },
  { command: 'premium', description: '💎 Купить Premium (безлимит)' },
  { command: 'profile', description: '📊 Мой профиль и остаток сообщений' },
  { command: 'help', description: '🆘 Помощь и инструкции' }
];
```

---

### 5. Создан файл с инструкциями по .env (НОВЫЙ)
**Файл**: `ENV-SETUP.md`

Содержит инструкции по созданию файла `.env` с необходимыми переменными.

---

## 📝 Изменения в коде (построчно)

### Добавленные строки:

#### В `bot/index.cjs`:

**Строки 545-563** - Новая команда `/app`:
```javascript
// 🚀 /app — открытие WebApp через клавиатуру с web_app кнопкой
bot.command('app', async ctx => {
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
  
  await ctx.reply(
    `🚀 ОТКРЫТЬ PEACHMINI WEB APP\n\n` +
    `✨ Красивый интерфейс с:\n` +
    `• 🏠 Главная страница\n` +
    `• 💬 Чаты с девушками\n` +
    `• ✨ Создание персонажа\n` +
    `• 🛍️ Магазин\n` +
    `• ⚙️ Настройки\n\n` +
    `👇 Нажмите кнопку ниже:`,
    Markup.keyboard([
      [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)],
      ['🔙 Назад в меню']
    ]).resize()
  );
});
```

**Строка 598** - Добавлена переменная в `/start`:
```javascript
const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
```

**Строка 606** - Добавлена web_app кнопка в меню:
```javascript
[Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)],
```

**Строки 1317-1340** - Обработчик кнопки "Назад":
```javascript
if (message === '🔙 Назад в меню') {
  const userName = ctx.from.first_name || 'незнакомец';
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
  
  const characterButtons = RUSSIAN_CHARACTERS.slice(0, 6).map(char => 
    [`${char.emoji} ${char.name} (${char.age})`]
  );
  
  const menuButtons = [
    [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)],
    ['🎁 Дневная награда', '👥 Пригласить друзей'],
    ['🎯 Задания', '🛒 Магазин'],
    ['💎 Premium', '📊 Мой профиль']
  ];
  
  const keyboard = [...characterButtons, ...menuButtons];
  
  return ctx.reply(
    `👋 С возвращением, ${userName}!\n\n` +
    `Выбери девушку для общения или используй меню:`,
    Markup.keyboard(keyboard).resize()
  );
}
```

**Строка 1511** - Добавлена команда в список:
```javascript
{ command: 'app', description: '🚀 Открыть Peachmini (Web App)' },
```

---

## 🚀 Как использовать

### 1. Создайте файл `.env` в корне проекта:

```bash
cd /Users/egor/Desktop/peach-mini
touch .env
```

### 2. Добавьте в `.env`:

```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=http://localhost:5173
ADMIN_ID=your_telegram_id
```

### 3. Для локальной разработки используйте ngrok:

```bash
# В первом терминале:
cd vite-project
npm run dev

# Во втором терминале:
ngrok http 5173

# Скопируйте HTTPS URL и обновите .env:
WEBAPP_URL=https://xxxx-xx-xx-xxx.ngrok-free.app
```

### 4. Запустите бота:

```bash
cd bot
node index.cjs
```

### 5. Протестируйте в Telegram:

1. Найдите вашего бота
2. Отправьте `/start` - увидите кнопку "🚀 Открыть Peachmini"
3. Отправьте `/app` - откроется клавиатура с web_app кнопкой
4. Нажмите на кнопку - откроется ваш WebApp!

---

## 🎯 Что работает

✅ Команда `/app` открывает WebApp через клавиатуру
✅ Команда `/start` показывает web_app кнопку в меню
✅ Кнопка "🔙 Назад в меню" возвращает в главное меню
✅ `WEBAPP_URL` читается из `.env`
✅ Fallback на `localhost:5173` если переменная не задана
✅ Все существующие хендлеры остались нетронутыми
✅ Команда `/app` добавлена в меню команд бота

---

## 📱 Пользовательский опыт

### Сценарий 1: Новый пользователь
1. Пользователь отправляет `/start`
2. Видит приветствие + кнопку "🚀 Открыть Peachmini"
3. Нажимает кнопку → открывается WebApp
4. Видит красивый интерфейс с 5 секциями

### Сценарий 2: Существующий пользователь
1. Пользователь отправляет `/app`
2. Получает клавиатуру с web_app кнопкой
3. Нажимает "🚀 Открыть Peachmini" → открывается WebApp
4. Может вернуться кнопкой "🔙 Назад в меню"

---

## 🔧 Технические детали

### Переменная окружения
- **Имя**: `WEBAPP_URL`
- **Расположение**: `.env` в корне проекта
- **Формат**: HTTPS URL (обязательно для production)
- **Примеры**:
  - Локально через ngrok: `https://xxxx.ngrok-free.app`
  - Vercel: `https://your-app.vercel.app`
  - Netlify: `https://your-app.netlify.app`
  - GitHub Pages: `https://username.github.io/repo-name`

### Совместимость
- ✅ Telegraf v4.x
- ✅ Node.js 14+
- ✅ Работает с существующими хендлерами
- ✅ Не ломает текущую логику бота

---

## ⚠️ Важные замечания

1. **HTTPS обязателен для production**
   - Telegram WebApp работает только с HTTPS
   - Для разработки используйте ngrok

2. **Обновите .env**
   - Не забудьте добавить `WEBAPP_URL`
   - Используйте актуальный URL вашего WebApp

3. **Перезапустите бота**
   - После изменения `.env` нужно перезапустить бота
   - `Ctrl+C` → `node index.cjs`

4. **Проверьте botfather**
   - Убедитесь что ваш бот имеет доступ к WebApp
   - В @BotFather можно настроить Web App URL

---

## 🎉 Готово!

Теперь ваш бот полностью интегрирован с WebApp!

**Команды для пользователей:**
- `/start` - главное меню с web_app кнопкой
- `/app` - прямое открытие WebApp

**Кнопки:**
- "🚀 Открыть Peachmini" - открывает WebApp
- "🔙 Назад в меню" - возврат в главное меню

---

Made with 💜 for Telegram Mini Apps

