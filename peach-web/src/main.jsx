import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics, track } from './utils/analytics'

// Клиентская диагностика ошибок
window.__peachlogs = [];
const log=(t,d)=>{ window.__peachlogs.push({t,d,ts:Date.now()}); fetch('/client-log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({t,d,ua:navigator.userAgent})}).catch(()=>{}); };
window.addEventListener('error',e=>log('error',{msg:e.message,stack:e.error?.stack}));
window.addEventListener('unhandledrejection',e=>log('unhandledrejection',{reason:String(e.reason)}));
console.log('Peachmini boot ✓');

// Инициализация Telegram WebApp
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.setBackgroundColor("#0b0b10");
  window.Telegram.WebApp.setHeaderColor("#0b0b10");
}

// Инициализация Umami аналитики
initAnalytics();

// Отслеживание открытия приложения
track('open_app', {
  platform: window.Telegram?.WebApp?.platform || 'web',
  version: window.Telegram?.WebApp?.version || 'unknown',
  userId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown'
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
