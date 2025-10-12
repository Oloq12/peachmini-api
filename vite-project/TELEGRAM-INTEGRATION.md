# Интеграция с Telegram Mini App

## 🚀 Быстрый старт

### 1. Создайте бота в Telegram
1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота

### 2. Настройте Web App
```
/newapp - создать новое mini app
/mybots - выбрать вашего бота
Web Apps - добавить Web App
```

Укажите URL вашего приложения (после деплоя)

### 3. Деплой приложения

#### Вариант 1: Vercel (рекомендуется)
```bash
npm install -g vercel
vercel
```

#### Вариант 2: Netlify
```bash
npm run build
netlify deploy --dir=dist --prod
```

#### Вариант 3: GitHub Pages
```bash
npm run build
# Загрузите содержимое папки dist на GitHub Pages
```

### 4. Обновите URL в BotFather
После деплоя обновите URL в настройках бота через BotFather

## 📱 Использование Telegram WebApp API

### Получение данных пользователя

```javascript
import { useTelegram } from './hooks/useTelegram';

function MyComponent() {
  const { user, tg } = useTelegram();
  
  console.log('User ID:', user?.id);
  console.log('Username:', user?.username);
  console.log('First Name:', user?.first_name);
}
```

### Тактильная обратная связь

```javascript
import { haptic } from './utils/haptic';

// Легкая вибрация
haptic.light();

// Средняя вибрация
haptic.medium();

// Сильная вибрация
haptic.heavy();

// Уведомления
haptic.success();
haptic.warning();
haptic.error();
```

### Главная кнопка

```javascript
if (tg.MainButton) {
  tg.MainButton.setText('Продолжить');
  tg.MainButton.show();
  tg.MainButton.onClick(() => {
    // Ваша логика
  });
}
```

### Кнопка назад

```javascript
if (tg.BackButton) {
  tg.BackButton.show();
  tg.BackButton.onClick(() => {
    // Навигация назад
    navigate(-1);
  });
}
```

### Закрытие приложения

```javascript
tg.close();
```

### Открытие ссылок

```javascript
tg.openLink('https://example.com');
```

### Открытие Telegram ссылок

```javascript
tg.openTelegramLink('https://t.me/channel');
```

## 🎨 Настройка темы

```javascript
// Установка цвета header
tg.setHeaderColor('#0F0F0F');

// Установка цвета фона
tg.setBackgroundColor('#0F0F0F');
```

## 💳 Платежи (Invoice)

```javascript
// Отправка инвойса для оплаты
tg.openInvoice(invoiceUrl, (status) => {
  if (status === 'paid') {
    haptic.success();
    // Обработка успешной оплаты
  }
});
```

## 📊 Аналитика

```javascript
// Отправка событий (если поддерживается)
if (tg.sendData) {
  tg.sendData(JSON.stringify({
    event: 'page_view',
    page: '/home'
  }));
}
```

## 🔐 Валидация данных

```javascript
// Получение initData для валидации на backend
const initData = tg.initData;
const initDataUnsafe = tg.initDataUnsafe;

// Отправьте initData на ваш сервер для проверки подлинности
fetch('/api/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    initData: initData
  })
});
```

## 🛠 Полезные функции

### Проверка темы пользователя

```javascript
const isDark = tg.colorScheme === 'dark';
```

### Проверка платформы

```javascript
const platform = tg.platform; // 'ios', 'android', 'web', etc.
```

### Версия API

```javascript
const version = tg.version;
```

### Проверка доступности функций

```javascript
const isAvailable = tg.isVersionAtLeast('6.0');
```

## 🎯 Best Practices

1. **Всегда проверяйте доступность API**
   ```javascript
   if (window.Telegram?.WebApp) {
     // Ваш код
   }
   ```

2. **Используйте expand() для полноэкранного режима**
   ```javascript
   tg.expand();
   ```

3. **Отключите вертикальные свайпы для лучшего UX**
   ```javascript
   tg.disableVerticalSwipes();
   ```

4. **Включите подтверждение закрытия**
   ```javascript
   tg.enableClosingConfirmation();
   ```

5. **Используйте haptic feedback для улучшения UX**
   ```javascript
   button.onClick = () => {
     haptic.light();
     // Ваша логика
   };
   ```

## 📚 Документация

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp](https://core.telegram.org/bots/webapps)
- [Mini Apps](https://core.telegram.org/bots/webapps#initializing-web-apps)

## 🔧 Troubleshooting

### Приложение не открывается
- Проверьте HTTPS (обязательно для production)
- Убедитесь, что URL корректный в BotFather
- Проверьте консоль браузера на ошибки

### Не работает haptic feedback
- Haptic работает только на реальных устройствах iOS/Android
- В браузере эти функции не работают

### Не получаются данные пользователя
- Убедитесь, что приложение запущено через Telegram
- Проверьте, что WebApp SDK загружен

---

Made with 💜 for Telegram Mini Apps

