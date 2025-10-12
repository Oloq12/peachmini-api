# ⚡ Быстрый старт - Telegram Mini App

## 🎯 Что создано?

Полнофункциональный интерфейс Telegram mini-app с:
- ✅ 5 секций: Home, Chats, Create, Store, Settings
- ✅ Нижняя панель навигации в стиле Telegram
- ✅ Тёмная тема с фиолетовыми акцентами (#8B5CF6)
- ✅ Плавные скругления и анимации
- ✅ React Router для навигации
- ✅ TailwindCSS для стилей
- ✅ Telegram WebApp API интеграция
- ✅ Haptic feedback (тактильная обратная связь)
- ✅ Адаптивный дизайн

## 🚀 Запуск за 3 шага

### 1. Установите зависимости
```bash
cd vite-project
npm install
```

### 2. Запустите dev-сервер
```bash
npm run dev
```

### 3. Откройте в браузере
```
http://localhost:5173
```

## 📱 Структура навигации

### 🏠 Home (/)
- Приветствие и статистика
- Популярные компаньоны
- Быстрые действия

### 💬 Chats (/chats)
- Список активных чатов
- Поиск и фильтры
- Непрочитанные сообщения

### ✨ Create (/create)
- Случайная генерация персонажа
- Шаблоны (6 вариантов)
- Продвинутое создание

### 🛍️ Store (/store)
- Покупка кредитов
- Premium подписка
- Дополнительные функции

### ⚙️ Settings (/settings)
- Профиль пользователя
- Настройки приложения
- Помощь и информация

## 🎨 Цветовая схема

```javascript
Background: #0F0F0F (основной фон)
Secondary: #1A1A1A (карточки)
Tertiary: #2D2D2D (элементы)
Primary: #8B5CF6 (фиолетовый акцент)
Text: #FFFFFF (белый)
Gray: #9CA3AF (серый)
```

## 🛠️ Технологический стек

- **React 19** - UI фреймворк
- **Vite 7** - Быстрая сборка
- **React Router DOM 7** - Маршрутизация
- **TailwindCSS 4** - Утилитарные стили
- **Telegram WebApp API** - Интеграция с Telegram

## 📂 Структура проекта

```
src/
├── components/
│   ├── BottomNav.jsx     # Нижняя навигация
│   └── Layout.jsx        # Главный layout
├── pages/
│   ├── Home.jsx          # 🏠 Главная
│   ├── Chats.jsx         # 💬 Чаты
│   ├── Create.jsx        # ✨ Создание
│   ├── Store.jsx         # 🛍️ Магазин
│   └── Settings.jsx      # ⚙️ Настройки
├── hooks/
│   └── useTelegram.js    # Telegram API hook
├── utils/
│   └── haptic.js         # Haptic feedback
├── App.jsx               # Роутинг
├── main.jsx              # Точка входа
└── index.css             # Tailwind + стили
```

## 🔧 Доступные команды

```bash
npm run dev      # Запуск dev-сервера
npm run build    # Сборка для production
npm run preview  # Предпросмотр production билда
npm run lint     # Проверка кода ESLint
```

## 🌐 Деплой

### Vercel (рекомендуется)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
# Загрузите dist/ на GitHub Pages
```

## 🎯 Особенности интерфейса

### Нижняя панель навигации
- Фиксированная позиция внизу
- 5 иконок с подписями
- Активная страница выделена фиолетовым
- Центральная кнопка Create увеличена
- Плавные переходы между страницами

### Дизайн карточек
- Скругление: rounded-2xl, rounded-3xl
- Бордеры: border-gray-800
- Hover эффекты: border-primary/50
- Градиенты: from-primary to-purple-600

### Анимации
- Fade-in при загрузке страниц
- Scale эффект при нажатии
- Плавные цветовые переходы
- Haptic feedback на мобильных

## 📱 Telegram Integration

### Используйте в своем боте:
1. Создайте бота через @BotFather
2. Добавьте Web App: `/newapp`
3. Задеплойте приложение
4. Укажите URL в настройках

### Проверка в Telegram:
```
https://t.me/YOUR_BOT_USERNAME/app
```

## 💡 Примеры использования

### Получить данные пользователя
```javascript
import { useTelegram } from './hooks/useTelegram';

function MyComponent() {
  const { user, tg } = useTelegram();
  return <div>Привет, {user?.first_name}!</div>;
}
```

### Добавить haptic feedback
```javascript
import { haptic } from './utils/haptic';

<button onClick={() => {
  haptic.light();
  // ваш код
}}>
  Нажми меня
</button>
```

## 📚 Дополнительная документация

- `README-MINIAPP.md` - Полное описание проекта
- `TELEGRAM-INTEGRATION.md` - Интеграция с Telegram API
- Документация Tailwind: https://tailwindcss.com
- Telegram WebApp API: https://core.telegram.org/bots/webapps

## 🎉 Готово!

Ваш Telegram Mini App готов к использованию! 

Запустите `npm run dev` и начинайте разработку.

---

Создано с 💜 используя React + Vite + TailwindCSS

