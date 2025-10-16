// Telegram webhook endpoint
export default async function handler(req, res) {
  console.log('📱 Telegram webhook received:', req.body);
  
  try {
    const { message } = req.body;
    if (!message) {
      return res.json({ ok: true });
    }
    
    const { chat, text, from } = message;
    if (!chat || !text) {
      return res.json({ ok: true });
    }
    
    console.log(`📱 Message from ${from?.first_name || 'Unknown'}: ${text}`);
    
    // Обработка команд
    let responseText = '';
    
    switch (text.toLowerCase()) {
      case '/start':
        responseText = `👋 Привет, ${from?.first_name || 'друг'}! Я бот Peach Mini.\n\n🎯 Доступные команды:\n/app - Открыть WebApp\n/ref - Реферальная система\n/help - Помощь\n\n✨ Начни общение с AI-компаньонами!`;
        break;
        
      case '/app':
        responseText = `🚀 Открой WebApp для общения с AI-компаньонами:\n\nhttps://peach-mini-jqttjmb81-trsoyoleg-4006s-projects.vercel.app\n\n💡 Там ты сможешь:\n• Выбрать персонажа\n• Общаться с AI\n• Выполнять квесты\n• Покупать премиум`;
        break;
        
      case '/ref':
        responseText = `🎁 Реферальная система:\n\n📊 Твой реферальный код: ${from?.id || 'N/A'}\n\n💰 За каждого друга получишь:\n• 100 💎 бонус\n• Эксклюзивные персонажи\n• Премиум функции\n\n🔗 Поделись ссылкой: https://t.me/peachmini_bot?start=${from?.id || 'ref'}`;
        break;
        
      case '/help':
        responseText = `❓ Помощь по боту Peach Mini:\n\n🎯 Команды:\n/start - Начать\n/app - WebApp\n/ref - Рефералы\n/help - Эта помощь\n\n💬 В WebApp ты можешь общаться с AI-компаньонами, выполнять квесты и покупать премиум функции.\n\n🆘 Если есть проблемы - пиши в поддержку!`;
        break;
        
      default:
        responseText = `🤖 Я понимаю только команды. Попробуй:\n\n/start - Начать\n/app - WebApp\n/ref - Рефералы\n/help - Помощь`;
    }
    
    const response = {
      method: 'sendMessage',
      chat_id: chat.id,
      text: responseText,
      parse_mode: 'HTML'
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    res.status(500).json({ ok: false, error: 'Webhook failed' });
  }
}
