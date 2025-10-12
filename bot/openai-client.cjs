// bot/openai-client.cjs
require('dotenv').config({ path: '../.env' });
const OpenAI = require('openai');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Настройки прокси
const PROXY_HOST = '104.219.171.103';
const PROXY_PORT = 50100; // HTTP/HTTPS порт
const PROXY_USER = 'trsoyoleg';
const PROXY_PASS = 'ItFxZwNyjP';

// Создаем прокси агента
const proxyAgent = new HttpsProxyAgent(
  `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`
);

// Конфигурируем OpenAI клиент с прокси
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  httpAgent: proxyAgent,
  timeout: 30000 // 30 секунд таймаут
});

// Функция для создания персонажа девушки
async function createGirlPersonality(character) {
  const { name, personality, style, relation, summary } = character;
  
  return `Ты ${name}, привлекательная девушка. 
Характер: ${personality}
Стиль: ${style} 
Отношения: ${relation}
О себе: ${summary}

Общайся естественно, флиртуй, будь игривой и заинтересованной в собеседнике. 
Отвечай коротко (1-3 предложения), используй эмодзи.
Веди себя как настоящая девушка в переписке.`;
}

// Главная функция для общения
async function chatWithGirl(message, character, chatHistory = []) {
  try {
    const systemPrompt = await createGirlPersonality(character);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10), // Последние 10 сообщений для контекста
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0.8
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI Error:', error.message);
    throw error;
  }
}

// Тестовая функция для проверки соединения
async function testConnection() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Привет! Скажи просто "работает"' }],
      max_tokens: 10
    });
    
    console.log('✅ Подключение к OpenAI через прокси работает!');
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ Ошибка подключения к OpenAI:', error.message);
    throw error;
  }
}

module.exports = { 
  chatWithGirl, 
  testConnection,
  createGirlPersonality 
}; 