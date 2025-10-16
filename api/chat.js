// Chat endpoint with AI integration
export default async function handler(req, res) {
  console.log('💬 /chat endpoint called');
  console.log('💬 Request body:', req.body);
  
  try {
    const { girlId, userMsg, userId = 'demo', context = [] } = req.body || {};
    
    // Simple validation
    if (!girlId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Character ID is required',
        code: 'MISSING_CHARACTER_ID' 
      });
    }
    
    if (!userMsg) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Message is required',
        code: 'MISSING_MESSAGE' 
      });
    }

    // Mock character data
    const mockGirls = [
      {
        id: "1",
        name: "Алиса",
        slug: "alisa",
        avatarUrl: "https://i.pravatar.cc/300?img=1",
        shortDesc: "Тёплая и романтичная девушка",
        persona: "Ты Алиса, тёплая и романтичная девушка. Ты любишь читать книги, пить чай и мечтать о путешествиях.",
        bioMemory: ["Любит читать книги", "Пьёт чай с мятой", "Мечтает о путешествиях"],
        starterPhrases: ["Привет! Как дела?", "Что читаешь?", "Расскажи о своих мечтах"]
      }
    ];

    // Get character data
    const girl = mockGirls.find(g => g.id === girlId);
    if (!girl) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Character not found',
        code: 'CHARACTER_NOT_FOUND' 
      });
    }

    // AI Response Logic
    const systemPrompt = `You are ${girl.name}, a warm and human-like AI companion. ${girl.persona || 'You are friendly and engaging.'}

Key guidelines:
- Be warm, empathetic, and conversational
- Keep responses concise but meaningful (under 200 words)
- Stay in character as ${girl.name}
- Be supportive and encouraging
- Use natural, human-like language
- Avoid repetitive phrases`;

    // Concatenate character memory with user message
    const characterMemory = girl.bioMemory ? girl.bioMemory.join('. ') : '';
    const fullUserMessage = characterMemory ? `${characterMemory}. ${userMsg}` : userMsg;

    // Simple AI response (offline stub for now)
    const aiResponse = {
      text: "💬 Сейчас офлайн, но я с тобой. Расскажи, как прошёл твой день?",
      provider: 'stub',
      model: 'offline',
      latencyMs: 0,
      abBucket: 'offline'
    };
    
    // Track chat message event with AI metadata
    console.log(`📊 [analytics] chat_message: user=${userId}, girl=${girlId}, msg_length=${userMsg.length}, provider=${aiResponse.provider}, model=${aiResponse.model}, latency=${aiResponse.latencyMs}ms`);

    res.json({
      ok: true,
      data: {
        reply: aiResponse.text,
        balance: 1000,
        meta: {
          provider: aiResponse.provider,
          model: aiResponse.model,
          latencyMs: aiResponse.latencyMs,
          abBucket: aiResponse.abBucket
        }
      }
    });

  } catch (e) {
    console.error('❌ Chat error:', e);
    res.status(500).json({ 
      ok: false, 
      error: 'An error occurred while processing your message. Please try again.',
      code: 'CHAT_FAIL' 
    });
  }
}
