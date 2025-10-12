import { useEffect } from 'react';

export function useTelegram() {
  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Расширить приложение на весь экран
      tg.expand();
      
      // Установить цвет header
      tg.setHeaderColor('#0F0F0F');
      tg.setBackgroundColor('#0F0F0F');
      
      // Отключить вертикальные свайпы (чтобы не закрывалось приложение)
      tg.disableVerticalSwipes();
      
      // Включить закрывающую кнопку
      tg.enableClosingConfirmation();
      
      // Сообщить Telegram, что приложение готово
      tg.ready();

      console.log('Telegram WebApp initialized:', {
        platform: tg.platform,
        version: tg.version,
        colorScheme: tg.colorScheme,
      });
    }
  }, []);

  return {
    tg: window.Telegram?.WebApp,
    user: window.Telegram?.WebApp?.initDataUnsafe?.user,
    platform: window.Telegram?.WebApp?.platform || 'unknown',
  };
}

