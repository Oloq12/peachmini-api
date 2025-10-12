require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const PocketBase = require('pocketbase').default;
const { OpenAI } = require('openai');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = process.env.API_PORT || 8787;
const WEBAPP_ORIGIN = process.env.WEBAPP_ORIGIN || '*';
const PB_URL = process.env.PB_URL;
const OPENAI_KEY = process.env.OPENAI_KEY;

if (!PB_URL) console.warn('⚠️ PB_URL not set');
if (!OPENAI_KEY) console.warn('⚠️ OPENAI_KEY not set');

// PocketBase setup
const pb = PB_URL ? new PocketBase(PB_URL) : null;

// OpenAI setup with proxy
const proxyAgent = new HttpsProxyAgent(
  `http://trsoyoleg:ItFxZwNyjP@104.219.171.103:50100`
);

const ai = new OpenAI({ 
  apiKey: OPENAI_KEY,
  httpAgent: proxyAgent,
  timeout: 60000
});

app.use(express.json({ limit: '1mb' }));
app.use(cors({ 
  origin: WEBAPP_ORIGIN === '*' ? true : WEBAPP_ORIGIN, 
  credentials: false 
}));

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════

const stripPII = (s='') => s
  .replace(/@[A-Za-z0-9_]+/g, '[handle]')
  .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[email]')
  .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
  .replace(/\b([А-ЯЁA-Z][а-яёa-z]+)\s+([А-ЯЁA-Z][а-яёa-z]+)(\s+[А-ЯЁA-Z][а-яёa-z]+)?\b/g, '[name]');

const hasPII = (s='') => {
  const patterns = [
    /@[A-Za-z0-9_]+/,
    /\b[\w.-]+@[\w.-]+\.\w+\b/,
    /\+?\d[\d\s().-]{7,}\d/,
    /\b([А-ЯЁA-Z][а-яёa-z]+)\s+([А-ЯЁA-Z][а-яёa-z]+)(\s+[А-ЯЁA-Z][а-яёa-z]+)?\b/
  ];
  return patterns.some(p => p.test(s));
};

// ═══════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    time: Date.now(),
    pb: !!pb,
    ai: !!ai
  });
});

// 1) PERSONA EXTRACT
app.post('/api/persona/extract', async (req, res) => {
  try {
    const samples = Array.isArray(req.body?.samples) ? req.body.samples.slice(0, 3) : [];
    
    if (!samples.length || samples.filter(s => s && s.trim()).length < 2) {
      return res.status(400).json({ ok: false, error: 'NO_SAMPLES', message: 'Нужно минимум 2 примера' });
    }

    // Check for PII before cleaning
    const hasPIIWarning = samples.some(s => hasPII(s));
    
    // Clean samples
    const cleaned = samples.map(stripPII);

    console.log('📝 Persona extract request, samples:', cleaned.length);

    const sys = `You are a persona composer. From 2-3 short user-provided texts (already sanitized), 
infer speaking style, tone, quirks, boundaries (SFW), and produce:
- systemPrompt: strict role and voice (in Russian), no real names, no NSFW.
- bioMemory: array of 3-5 short facts (in Russian).
- starterPhrases: array of 3-5 typical short phrases (in Russian).
Keep it warm, empathetic, not explicit. Reply ONLY with valid JSON.`;

    const user = `Примеры стиля (очищены от персональных данных):
1) ${cleaned[0] || ''}
2) ${cleaned[1] || ''}
3) ${cleaned[2] || ''}

Верни JSON строго по схеме:
{
  "systemPrompt": "...",
  "bioMemory": ["...", "...", "..."],
  "starterPhrases": ["...", "...", "..."]
}`;

    const resp = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let out;
    try {
      const content = resp.choices[0].message.content.trim();
      // Remove markdown code blocks if present
      const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      out = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return res.status(502).json({ ok: false, error: 'BAD_AI_JSON', message: 'Не удалось разобрать ответ AI' });
    }

    // Validate response
    if (!out.systemPrompt) {
      return res.status(502).json({ ok: false, error: 'NO_PROMPT', message: 'AI не вернул системный промпт' });
    }

    // Truncate if too long
    out.systemPrompt = out.systemPrompt.slice(0, 6000);
    out.bioMemory = Array.isArray(out.bioMemory) ? out.bioMemory.slice(0, 5) : [];
    out.starterPhrases = Array.isArray(out.starterPhrases) ? out.starterPhrases.slice(0, 5) : [];

    // Add warning if PII was detected
    if (hasPIIWarning) {
      out.warning = 'В примерах были обнаружены персональные данные (имена, email, телефоны). Они были автоматически удалены.';
    }

    console.log('✅ Persona extracted successfully');
    return res.json({ ok: true, ...out });

  } catch (e) {
    console.error('❌ Persona extract error:', e);
    return res.status(500).json({ ok: false, error: 'EXTRACT_FAIL', message: 'Ошибка извлечения персоны' });
  }
});

// 2) CHAT REPLY
app.post('/chat/reply', async (req, res) => {
  try {
    const { girlId, userMsg, userId, chatHistory, model } = req.body || {};
    
    if (!girlId || !userMsg) {
      return res.status(400).json({ ok: false, error: 'BAD_INPUT', message: 'girlId и userMsg обязательны' });
    }

    console.log('💬 Chat request for girl:', girlId);

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'NO_PB', message: 'PocketBase не настроен' });
    }

    // Get girl data
    const girl = await pb.collection('girls').getOne(girlId).catch(() => null);
    if (!girl) {
      return res.status(404).json({ ok: false, error: 'GIRL_NOT_FOUND', message: 'Персонаж не найден' });
    }

    // Determine model and price
    const MODEL_PRICES = {
      'gpt-4o-mini': 2,
      'gpt-4o': 4,
      'gpt-4-turbo': 6
    };
    
    const selectedModel = model || 'gpt-4o-mini';
    const price = MODEL_PRICES[selectedModel] || 2;

    // Check balance and debit
    let userBalance = 0;
    if (userId) {
      // Get user
      const user = await pb.collection('users').getFirstListItem(`tgId="${userId}"`).catch(() => null);
      
      if (!user) {
        return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND', message: 'Пользователь не найден' });
      }

      userBalance = user.balance || 0;

      // Check if user has enough balance
      if (userBalance < price) {
        return res.status(402).json({ 
          ok: false, 
          error: 'NO_FUNDS', 
          message: `Недостаточно средств. Требуется: ${price} PP, доступно: ${userBalance} PP`,
          required: price,
          balance: userBalance
        });
      }

      // Debit balance
      const newBalance = userBalance - price;
      await pb.collection('users').update(user.id, { balance: newBalance });
      userBalance = newBalance;

      // Save transaction
      try {
        await pb.collection('payments').create({
          userId: String(userId),
          provider: 'system',
          type: 'debit',
          amount: price,
          status: 'ok',
          meta: JSON.stringify({ 
            girlId, 
            model: selectedModel,
            reason: 'chat_message' 
          })
        });
      } catch (e) {
        console.warn('Failed to save transaction:', e);
      }

      console.log(`💰 Debited ${price} PP from user ${userId}, new balance: ${newBalance}`);
    }

    // Get recent messages from PocketBase (fallback to chatHistory from request)
    let history = [];
    
    if (userId) {
      const recent = await pb.collection('messages').getList(1, 10, {
        filter: `girlId="${girlId}" && userId="${userId}"`,
        sort: '-created'
      }).catch(() => ({ items: [] }));
      
      history = [...recent.items].reverse().map(m => ({ 
        role: m.role, 
        content: m.content 
      }));
    }
    
    // If no history from DB, use provided chatHistory
    if (history.length === 0 && Array.isArray(chatHistory)) {
      history = chatHistory.slice(-10);
    }

    // Build system prompt
    let sys = girl.persona || 'Ты доброжелательный компаньон. Отвечай естественно и дружелюбно.';
    
    // Add bio memory
    if (girl.bioMemory) {
      try {
        const memories = typeof girl.bioMemory === 'string' 
          ? JSON.parse(girl.bioMemory) 
          : girl.bioMemory;
        
        if (Array.isArray(memories) && memories.length > 0) {
          sys += '\n\nФакты о тебе:\n- ' + memories.join('\n- ');
        }
      } catch (e) {
        console.warn('Failed to parse bioMemory:', e);
      }
    }

    sys += '\n\nОтвечай коротко и естественно, как в живом диалоге.';

    // Build messages array
    const messages = [
      { role: 'system', content: sys },
      ...history,
      { role: 'user', content: String(userMsg).slice(0, 2000) }
    ];

    // Get AI response
    const resp = await ai.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: 0.8,
      max_tokens: 500
    });

    const reply = resp.choices?.[0]?.message?.content || '…';

    // Save messages to PocketBase
    if (userId) {
      const saveUserId = String(userId);
      const baseMsg = { userId: saveUserId, girlId };
      
      try {
        await pb.collection('messages').create({ 
          ...baseMsg, 
          role: 'user', 
          content: String(userMsg).slice(0, 4000) 
        });
      } catch (e) {
        console.warn('Failed to save user message:', e);
      }
      
      try {
        await pb.collection('messages').create({ 
          ...baseMsg, 
          role: 'assistant', 
          content: String(reply).slice(0, 4000) 
        });
      } catch (e) {
        console.warn('Failed to save assistant message:', e);
      }
    }

    console.log('✅ Chat reply generated');
    return res.json({ 
      ok: true, 
      reply,
      balance: userBalance
    });

  } catch (e) {
    console.error('❌ Chat error:', e);
    
    // Check for rate limits
    if (e.status === 429) {
      return res.status(429).json({ 
        ok: false, 
        error: 'RATE_LIMIT', 
        message: 'Лимит сообщений исчерпан',
        upgrade: true
      });
    }
    
    return res.status(500).json({ ok: false, error: 'CHAT_FAIL', message: 'Ошибка генерации ответа' });
  }
});

// 3) PAYMENTS (stub for Telegram Stars)
app.post('/payments/createInvoice', async (req, res) => {
  try {
    const { userId, packageId } = req.body || {};
    
    const PACKS = { 
      'p300': 300, 
      'p600': 600, 
      'p850': 850, 
      'p999': 999 
    };
    
    if (!PACKS[packageId]) {
      return res.status(400).json({ ok: false, error: 'BAD_PACKAGE', message: 'Неверный пакет' });
    }

    console.log('💰 Payment request:', packageId, 'for user:', userId);

    // TODO: Integration with Telegram Bot API Stars
    // For now - stub that credits balance

    if (pb && userId) {
      try {
        const u = await pb.collection('users').getFirstListItem(`tgId="${userId}"`).catch(() => null);
        
        if (u) {
          await pb.collection('users').update(u.id, { 
            balance: (u.balance || 0) + PACKS[packageId] 
          });
          console.log('✅ Balance updated for user:', userId);
        }
      } catch (e) {
        console.warn('Failed to update balance:', e);
      }
    }

    // Save payment record
    if (pb) {
      try {
        await pb.collection('payments').create({
          userId: userId || '',
          provider: 'telegram_stars',
          type: 'pack',
          amount: PACKS[packageId],
          status: 'stub_ok',
          meta: JSON.stringify({ packageId })
        });
      } catch (e) {
        console.warn('Failed to save payment:', e);
      }
    }

    return res.json({ 
      ok: true, 
      stub: true, 
      credited: PACKS[packageId],
      message: 'Баланс пополнен (демо режим)' 
    });

  } catch (e) {
    console.error('❌ Payment error:', e);
    return res.status(500).json({ ok: false, error: 'PAYMENT_FAIL', message: 'Ошибка создания платежа' });
  }
});

// 4) REFERRALS - Get referral status
app.get('/ref/status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ ok: false, error: 'USER_ID_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    // Get user
    const user = await pb.collection('users').getFirstListItem(`tgId="${userId}"`).catch(() => null);
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND' });
    }

    // Get referrals (last 10)
    const referrals = await pb.collection('referrals').getList(1, 10, {
      filter: `inviterId="${user.id}"`,
      sort: '-created',
      expand: 'inviteeId'
    }).catch(() => ({ items: [] }));

    const referralsList = referrals.items.map(ref => ({
      tgId: ref.expand?.inviteeId?.tgId || 'unknown',
      date: ref.created
    }));

    const totalBonus = (user.refCount || 0) * 100;

    return res.json({
      ok: true,
      referralCode: user.referralCode || '',
      referralLink: `https://t.me/Amourath_ai_bot?start=ref_${user.referralCode}`,
      stats: {
        count: user.refCount || 0,
        earned: totalBonus,
        balance: user.balance || 0
      },
      referrals: referralsList
    });

  } catch (e) {
    console.error('❌ Referral status error:', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// ═══════════════════════════════════════════════════════════
// 5) QUESTS SYSTEM
// ═══════════════════════════════════════════════════════════

// POST /quests/checkin - Daily check-in
app.post('/quests/checkin', async (req, res) => {
  try {
    const { tgId } = req.body;
    
    if (!tgId) {
      return res.status(400).json({ ok: false, error: 'TG_ID_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    // Get user
    const user = await pb.collection('users').getFirstListItem(`tgId="${tgId}"`).catch(() => null);
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let lastCheckin = null;
    if (user.lastCheckin) {
      lastCheckin = new Date(user.lastCheckin);
      lastCheckin.setHours(0, 0, 0, 0);
    }

    // If already checked in today
    if (lastCheckin && lastCheckin.getTime() === today.getTime()) {
      return res.json({ 
        ok: true, 
        alreadyCheckedIn: true, 
        streak: user.streak || 0,
        message: 'Вы уже получили награду сегодня!'
      });
    }

    // Calculate new streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = 1;
    if (lastCheckin && lastCheckin.getTime() === yesterday.getTime()) {
      // Consecutive day
      newStreak = (user.streak || 0) + 1;
    }

    // Update user
    await pb.collection('users').update(user.id, {
      streak: newStreak,
      lastCheckin: new Date().toISOString(),
      balance: (user.balance || 0) + 20
    });

    // Get daily_checkin quest
    const quest = await pb.collection('quests').getFirstListItem(`code="daily_checkin"`).catch(() => null);
    
    if (quest) {
      // Create user_quest record
      try {
        await pb.collection('user_quests').create({
          userId: user.id,
          questId: quest.id,
          status: 'done'
        });
      } catch (e) {
        // May fail if already exists (unique constraint)
        console.log('User quest already exists or failed to create:', e.message);
      }
    }

    return res.json({
      ok: true,
      alreadyCheckedIn: false,
      streak: newStreak,
      reward: 20,
      newBalance: (user.balance || 0) + 20,
      message: `День ${newStreak}! +20 PeachPoints`
    });

  } catch (e) {
    console.error('❌ Checkin error:', e);
    return res.status(500).json({ ok: false, error: 'CHECKIN_FAIL' });
  }
});

// GET /quests/status - Get quests status
app.get('/quests/status', async (req, res) => {
  try {
    const { tgId } = req.query;
    
    if (!tgId) {
      return res.status(400).json({ ok: false, error: 'TG_ID_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    // Get user
    const user = await pb.collection('users').getFirstListItem(`tgId="${tgId}"`).catch(() => null);
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND' });
    }

    // Get all quests
    const allQuests = await pb.collection('quests').getFullList().catch(() => []);

    // Get user's completed quests
    const userQuests = await pb.collection('user_quests').getFullList({
      filter: `userId="${user.id}"`,
      expand: 'questId'
    }).catch(() => []);

    const completedCodes = new Set(
      userQuests
        .filter(uq => uq.status === 'done')
        .map(uq => uq.expand?.questId?.code)
        .filter(Boolean)
    );

    // Check if can check in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let lastCheckin = null;
    if (user.lastCheckin) {
      lastCheckin = new Date(user.lastCheckin);
      lastCheckin.setHours(0, 0, 0, 0);
    }
    const canCheckinToday = !lastCheckin || lastCheckin.getTime() < today.getTime();

    // Build quest list
    const quests = allQuests.map(q => ({
      code: q.code,
      title: q.title,
      reward: q.reward,
      status: completedCodes.has(q.code) ? 'done' : 
              (q.code === 'daily_checkin' && !canCheckinToday) ? 'done' : 'pending',
      canClaim: q.code === 'daily_checkin' ? canCheckinToday : !completedCodes.has(q.code)
    }));

    return res.json({
      ok: true,
      streak: user.streak || 0,
      lastCheckin: user.lastCheckin || null,
      canCheckinToday,
      quests
    });

  } catch (e) {
    console.error('❌ Quest status error:', e);
    return res.status(500).json({ ok: false, error: 'STATUS_FAIL' });
  }
});

// POST /quests/complete - Complete a quest
app.post('/quests/complete', async (req, res) => {
  try {
    const { tgId, code } = req.body;
    
    if (!tgId || !code) {
      return res.status(400).json({ ok: false, error: 'TG_ID_AND_CODE_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    // Don't allow completing daily_checkin through this endpoint
    if (code === 'daily_checkin') {
      return res.status(400).json({ ok: false, error: 'USE_CHECKIN_ENDPOINT' });
    }

    // Get user
    const user = await pb.collection('users').getFirstListItem(`tgId="${tgId}"`).catch(() => null);
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND' });
    }

    // Get quest
    const quest = await pb.collection('quests').getFirstListItem(`code="${code}"`).catch(() => null);
    
    if (!quest) {
      return res.status(404).json({ ok: false, error: 'QUEST_NOT_FOUND' });
    }

    // Check if already completed
    const existing = await pb.collection('user_quests').getFirstListItem(
      `userId="${user.id}" && questId="${quest.id}"`
    ).catch(() => null);

    if (existing && existing.status === 'done') {
      return res.json({ 
        ok: true, 
        alreadyCompleted: true,
        message: 'Квест уже выполнен!'
      });
    }

    // Complete quest
    if (existing) {
      await pb.collection('user_quests').update(existing.id, { status: 'done' });
    } else {
      await pb.collection('user_quests').create({
        userId: user.id,
        questId: quest.id,
        status: 'done'
      });
    }

    // Give reward
    await pb.collection('users').update(user.id, {
      balance: (user.balance || 0) + quest.reward
    });

    return res.json({
      ok: true,
      alreadyCompleted: false,
      reward: quest.reward,
      newBalance: (user.balance || 0) + quest.reward,
      message: `Квест выполнен! +${quest.reward} PeachPoints`
    });

  } catch (e) {
    console.error('❌ Quest complete error:', e);
    return res.status(500).json({ ok: false, error: 'COMPLETE_FAIL' });
  }
});

// ═══════════════════════════════════════════════════════════
// GIRLS ENDPOINTS
// ═══════════════════════════════════════════════════════════

// GET /girls - список персонажей
app.get('/girls', async (req, res) => {
  try {
    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    const girls = await pb.collection('girls').getList(1, 50, {
      sort: '-created'
    });

    const result = girls.items.map(g => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      avatarUrl: g.avatar || '',
      shortDesc: (g.persona || '').slice(0, 120) + (g.persona?.length > 120 ? '...' : '')
    }));

    return res.json({ ok: true, girls: result });
  } catch (e) {
    console.error('❌ Get girls error:', e);
    return res.status(500).json({ ok: false, error: 'FETCH_FAIL' });
  }
});

// GET /girls/:slug - детали персонажа
app.get('/girls/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    const girl = await pb.collection('girls').getFirstListItem(`slug="${slug}"`).catch(() => null);

    if (!girl) {
      return res.status(404).json({ ok: false, error: 'GIRL_NOT_FOUND' });
    }

    // Parse JSON fields
    let bioMemory = [];
    let starterPhrases = [];

    try {
      bioMemory = typeof girl.bioMemory === 'string' 
        ? JSON.parse(girl.bioMemory) 
        : (girl.bioMemory || []);
    } catch (e) {
      console.warn('Failed to parse bioMemory:', e);
    }

    try {
      starterPhrases = typeof girl.starterPhrases === 'string' 
        ? JSON.parse(girl.starterPhrases) 
        : (girl.starterPhrases || []);
    } catch (e) {
      console.warn('Failed to parse starterPhrases:', e);
    }

    return res.json({
      ok: true,
      girl: {
        id: girl.id,
        name: girl.name,
        slug: girl.slug,
        avatarUrl: girl.avatar || '',
        persona: girl.persona || '',
        bioMemory,
        starterPhrases
      }
    });
  } catch (e) {
    console.error('❌ Get girl by slug error:', e);
    return res.status(500).json({ ok: false, error: 'FETCH_FAIL' });
  }
});

// GET /chats - история чатов пользователя
app.get('/chats', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ ok: false, error: 'USER_ID_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    // Get last 50 messages for user
    const messages = await pb.collection('messages').getList(1, 50, {
      filter: `userId="${userId}"`,
      sort: '-created'
    }).catch(() => ({ items: [] }));

    // Group by girlId
    const chatsByGirl = {};
    
    for (const msg of messages.items) {
      if (!chatsByGirl[msg.girlId]) {
        chatsByGirl[msg.girlId] = [];
      }
      chatsByGirl[msg.girlId].push({
        role: msg.role,
        content: msg.content,
        created: msg.created
      });
    }

    // Get last 10 unique chats
    const chats = Object.keys(chatsByGirl).slice(0, 10).map(girlId => ({
      girlId,
      messages: chatsByGirl[girlId].slice(0, 10),
      lastMessage: chatsByGirl[girlId][0]
    }));

    return res.json({ ok: true, chats });
  } catch (e) {
    console.error('❌ Get chats error:', e);
    return res.status(500).json({ ok: false, error: 'FETCH_FAIL' });
  }
});

// POST /girls - создание нового персонажа
app.post('/girls', async (req, res) => {
  try {
    const { name, origin, persona, bioMemory, starterPhrases } = req.body || {};

    if (!name || !persona) {
      return res.status(400).json({ ok: false, error: 'NAME_AND_PERSONA_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now();

    const record = await pb.collection('girls').create({
      name,
      slug,
      shortDesc: Array.isArray(bioMemory) && bioMemory[0] 
        ? bioMemory[0].slice(0, 120) 
        : persona.slice(0, 120),
      avatar: 'https://i.pravatar.cc/300?img=' + Math.floor(Math.random() * 70),
      origin: origin || 'CUSTOM',
      persona,
      bioMemory: JSON.stringify(bioMemory || []),
      starterPhrases: JSON.stringify(starterPhrases || [])
    });

    console.log(`✅ Created girl: ${name} (${slug})`);

    return res.json({
      ok: true,
      id: record.id,
      slug: record.slug
    });
  } catch (e) {
    console.error('❌ Create girl error:', e);
    return res.status(500).json({ ok: false, error: 'CREATE_FAIL' });
  }
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Peachmini API Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 CORS: ${WEBAPP_ORIGIN}`);
  console.log(`🗄️ PocketBase: ${PB_URL || 'not configured'}`);
  console.log(`🤖 OpenAI: ${OPENAI_KEY ? 'configured' : 'not configured'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/persona/extract');
  console.log('  POST /chat/reply');
  console.log('  POST /payments/createInvoice');
  console.log('  GET  /ref/status');
  console.log('  POST /quests/checkin');
  console.log('  GET  /quests/status');
  console.log('  POST /quests/complete');
  console.log('  GET  /girls');
  console.log('  GET  /girls/:slug');
  console.log('  GET  /chats');
  console.log('  POST /girls');
  console.log('');
});

