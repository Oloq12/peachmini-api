// Umami Analytics Utility

const UMAMI_URL = import.meta.env.VITE_UMAMI_URL;
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;

let umamiLoaded = false;

/**
 * Инициализация Umami аналитики
 */
export function initAnalytics() {
  // Проверяем наличие конфигурации
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) {
    console.log('📊 Umami analytics not configured (VITE_UMAMI_URL or VITE_UMAMI_WEBSITE_ID missing)');
    return;
  }

  // Добавляем скрипт Umami
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  script.src = UMAMI_URL;
  
  script.onload = () => {
    umamiLoaded = true;
    console.log('📊 Umami analytics loaded');
  };
  
  script.onerror = () => {
    console.error('❌ Failed to load Umami analytics');
  };
  
  document.head.appendChild(script);
}

/**
 * Отправка события в Umami
 * @param {string} event - Название события
 * @param {object} props - Дополнительные свойства события
 */
export function track(event, props = {}) {
  // Если Umami не настроен
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) {
    console.log(`📊 [Analytics] ${event}`, props);
    return;
  }

  // Если Umami еще не загружен
  if (!umamiLoaded) {
    console.log(`⏳ [Analytics] Waiting for Umami... ${event}`, props);
    setTimeout(() => track(event, props), 500);
    return;
  }

  // Отправляем событие
  try {
    if (window.umami) {
      window.umami.track(event, props);
      console.log(`✅ [Analytics] ${event}`, props);
    } else {
      console.warn(`⚠️ [Analytics] Umami not available for ${event}`);
    }
  } catch (error) {
    console.error(`❌ [Analytics] Failed to track ${event}:`, error);
  }
}

// Экспортируем также функцию для page views (опционально)
export function trackPageView(url) {
  if (window.umami) {
    window.umami.track(pageview => ({ url }));
  }
}

