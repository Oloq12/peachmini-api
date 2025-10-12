const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5173;

app.use(compression());

// Разрешаем встраивание в Telegram WebView
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  
  // CSP для совместимости с Telegram WebView
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'",
      "connect-src *",
      "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://t.me https://*.t.me",
      "img-src 'self' https: data: blob:",
      "font-src 'self' https: data:",
      "media-src 'self' https: blob:",
    ].join('; ')
  );
  
  next();
});

// Диагностический эндпоинт
app.get('/health', (req, res) => res.type('text').send('OK'));

// Прием клиентских логов
app.post('/client-log', express.json(), (req, res) => { 
  console.log('🪵 client-log', req.body); 
  res.sendStatus(204); 
});

// Простой HTML без JS для проверки отображения в Telegram WebView
app.get('/plain', (req, res) => {
  res.type('html').send(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
<body style="background:#0b0b10;color:#fff;font:700 22px/1.4 -apple-system,Segoe UI,Roboto">
Привет из Peachmini ⚡️ — чистый HTML виден!
</body>`);
});

// Прокси для API бота (извлечение персоны)
app.post('/api/persona/extract', express.json(), async (req, res) => {
  try {
    const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
    
    console.log('🔄 Проксирование запроса к боту:', BOT_API_URL);
    
    const response = await fetch(`${BOT_API_URL}/api/persona/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка от бота:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Ошибка от бота',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Персона получена от бота');
    res.json(data);
  } catch (error) {
    console.error('❌ Ошибка прокси:', error);
    res.status(500).json({ 
      error: 'Ошибка подключения к боту',
      details: error.message 
    });
  }
});

// Прокси для чата с персонажем
app.post('/chat/reply', express.json(), async (req, res) => {
  try {
    const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
    
    console.log('💬 Проксирование чат-запроса к боту:', BOT_API_URL);
    
    const response = await fetch(`${BOT_API_URL}/chat/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка от бота:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Ошибка от бота',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Ответ получен от бота');
    res.json(data);
  } catch (error) {
    console.error('❌ Ошибка прокси чата:', error);
    res.status(500).json({ 
      error: 'Ошибка подключения к боту',
      details: error.message 
    });
  }
});

// Прокси для создания инвойса
app.post('/payments/createInvoice', express.json(), async (req, res) => {
  try {
    const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
    
    console.log('💰 Проксирование запроса на инвойс к боту:', BOT_API_URL);
    
    const response = await fetch(`${BOT_API_URL}/payments/createInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка от бота:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Ошибка от бота',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('✅ Инвойс создан');
    res.json(data);
  } catch (error) {
    console.error('❌ Ошибка прокси платежей:', error);
    res.status(500).json({ 
      error: 'Ошибка подключения к боту',
      details: error.message 
    });
  }
});

const dist = path.join(__dirname, 'dist');
app.use(express.static(dist));

// SPA fallback - возвращаем index.html для всех не найденных маршрутов
app.use((req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Peachmini static server running on http://localhost:${PORT}`);
});

