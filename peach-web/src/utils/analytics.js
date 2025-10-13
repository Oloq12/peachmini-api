// Analytics Utility - Umami or PostHog
import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// Umami configuration
const UMAMI_URL = import.meta.env.VITE_UMAMI_URL;
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;

let analyticsProvider = 'none';
let umamiLoaded = false;

/**
 * Инициализация аналитики (PostHog или Umami)
 */
export function initAnalytics() {
  // Priority 1: PostHog
  if (POSTHOG_KEY) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: false,
        persistence: 'localStorage'
      });
      analyticsProvider = 'posthog';
      console.log('✅ PostHog analytics initialized');
      return;
    } catch (e) {
      console.warn('⚠️ PostHog init failed:', e.message);
    }
  }
  
  // Priority 2: Umami
  if (UMAMI_URL && UMAMI_WEBSITE_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
    script.src = UMAMI_URL;
    
    script.onload = () => {
      umamiLoaded = true;
      analyticsProvider = 'umami';
      console.log('✅ Umami analytics loaded');
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Umami analytics');
    };
    
    document.head.appendChild(script);
    return;
  }
  
  console.log('📊 Analytics not configured (set VITE_POSTHOG_KEY or VITE_UMAMI_URL/VITE_UMAMI_WEBSITE_ID)');
}

/**
 * Отправка события
 * @param {string} event - Название события
 * @param {object} props - Дополнительные свойства события
 */
export function track(event, props = {}) {
  if (typeof window === 'undefined') return;
  
  // Console log (always, truncated)
  const truncatedProps = JSON.stringify(props).substring(0, 100);
  console.log(`📊 ${event}`, truncatedProps.length > 100 ? truncatedProps + '...' : props);
  
  try {
    // PostHog
    if (analyticsProvider === 'posthog' && POSTHOG_KEY) {
      posthog.capture(event, props);
    }
    
    // Umami
    if (analyticsProvider === 'umami' && window.umami) {
      window.umami.track(event, props);
    }
  } catch (error) {
    console.warn(`⚠️ Analytics track failed for ${event}:`, error.message);
  }
}

/**
 * Идентификация пользователя
 */
export function identifyUser(userId, traits = {}) {
  if (typeof window === 'undefined') return;
  
  if (analyticsProvider === 'posthog' && POSTHOG_KEY) {
    try {
      posthog.identify(userId, traits);
      console.log('📊 User identified:', userId);
    } catch (e) {
      console.warn('⚠️ Identify failed:', e.message);
    }
  }
}

/**
 * Page view tracking
 */
export function trackPageView(url, props = {}) {
  track('page_view', { url, ...props });
}

/**
 * Reset analytics (logout)
 */
export function resetAnalytics() {
  if (analyticsProvider === 'posthog' && POSTHOG_KEY) {
    try {
      posthog.reset();
      console.log('📊 Analytics reset');
    } catch (e) {
      console.warn('⚠️ Reset failed:', e.message);
    }
  }
}

