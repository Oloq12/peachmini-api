// Telegram webhook endpoint
module.exports = async (req, res) => {
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
    
    // Простой ответ бота
    const response = {
      method: 'sendMessage',
      chat_id: chat.id,
      text: `Привет! Я бот Peach Mini. Твой API работает: ${process.env.BOT_TOKEN ? '✅' : '❌'}\n\nИспользуй WebApp: https://peach-mini-clean.vercel.app`
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    res.status(500).json({ ok: false, error: 'Webhook failed' });
  }
};
