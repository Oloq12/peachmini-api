require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PocketBase = require('pocketbase/cjs');
const { OpenAI } = require('openai');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 8787;
const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const WEBAPP_ORIGIN = process.env.WEBAPP_ORIGIN || '*';
const OPENAI_KEY = process.env.OPENAI_KEY;

if (!PB_URL) console.warn('⚠️ PB_URL not set');
if (!OPENAI_KEY) console.warn('⚠️ OPENAI_KEY not set');

// PocketBase setup
const pb = new PocketBase(process.env.PB_URL);

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
  origin: [
    'http://localhost:5173',
    'https://peach-95wsi4msy-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-g32i7q531-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-mrvh76p52-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-h2cwnvhy4-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-gvo26eszd-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-qnr859drq-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-jweo61ns0-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-k01ooxkbm-trsoyoleg-4006s-projects.vercel.app',
    'https://peach-iw1g1rn76-trsoyoleg-4006s-projects.vercel.app'
  ], 
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
  console.log('[API] /health called');
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
    console.error('❌ Persona extract error:', e.message);
    console.error('Stack:', e.stack);
    return res.status(500).json({ ok: false, error: 'EXTRACT_FAIL', message: 'Ошибка извлечения персоны: ' + e.message });
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

    // Mock data for demo
    const mockGirls = [
      {
        id: '1',
        name: 'Алиса',
        persona: 'Ты Алиса - дружелюбная и любознательная девушка 22 лет. Ты любишь читать книги, изучать новые технологии и общаться с интересными людьми. У тебя отличное чувство юмора и ты всегда готова поддержать разговор на любую тему.',
        bioMemory: ['Любит читать фантастику', 'Изучает программирование', 'Живет в Москве'],
        starterPhrases: ['Привет! Как дела?', 'Расскажи что-нибудь интересное!', 'Что ты думаешь о новых технологиях?']
      },
      {
        id: '2', 
        name: 'Мила',
        persona: 'Ты Мила - творческая художница 24 лет. Ты рисуешь картины, любишь природу и вдохновляешь других своим искусством. У тебя мечтательный характер и ты видишь красоту в самых простых вещах.',
        bioMemory: ['Пишет маслом', 'Любит закаты', 'Мечтает о выставке'],
        starterPhrases: ['Хочешь посмотреть мои картины?', 'Какие цвета тебе нравятся?', 'Искусство - это жизнь!']
      }
    ];

    // Get girl data (try PocketBase first, then mock)
    let girl = null;
    if (pb) {
      try {
        girl = await pb.collection('girls').getOne(girlId);
      } catch (e) {
        console.log('⚠️ PocketBase error, using mock data:', e.message);
      }
    }
    
    // Fallback to mock data
    if (!girl) {
      girl = mockGirls.find(g => g.id === girlId);
      if (!girl) {
        return res.status(404).json({ ok: false, error: 'GIRL_NOT_FOUND', message: 'Персонаж не найден' });
      }
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
    // Demo balance for testing
    const demoBalance = 1000;
    userBalance = demoBalance - price;
    console.log(`💰 Demo: spent ${price} PP, balance: ${userBalance} PP`);

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

// 4) REFERRALS - Get referral status (создает пользователя если нет)
app.get('/ref/status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ ok: false, error: 'USER_ID_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    // Get or create user
    let user = await pb.collection('users').getFirstListItem(`tgId="${userId}"`).catch(() => null);
    
    if (!user) {
      // Create new user with referral code
      const referralCode = Math.random().toString(36).substring(2, 8);
      console.log(`📝 Creating new user: ${userId} with code ${referralCode}`);
      
      user = await pb.collection('users').create({
        tgId: userId.toString(),
        balance: 0,
        refCount: 0,
        earned: 0,
        referralCode: referralCode,
        plan: 'free'
      });
      
      console.log(`✅ User created: ${user.id}`);
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

    return res.json({
      ok: true,
      data: {
        referralCode: user.referralCode || '',
        refCount: user.refCount || 0,
        earned: user.earned || 0,
        referralLink: `https://t.me/Amourath_ai_bot?start=ref_${user.referralCode}`,
        referrals: referralsList
      }
    });

  } catch (e) {
    console.error('❌ Referral status error:', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// POST /ref/apply - Apply referral code
app.post('/ref/apply', async (req, res) => {
  try {
    const { tgId, code } = req.body;
    
    if (!tgId || !code) {
      return res.status(400).json({ ok: false, error: 'TG_ID_AND_CODE_REQUIRED' });
    }

    if (!pb) {
      return res.status(503).json({ ok: false, error: 'PB_NOT_CONFIGURED' });
    }

    console.log(`📨 Referral apply request: tgId=${tgId}, code=${code}`);

    // Get inviter by referral code
    const inviter = await pb.collection('users').getFirstListItem(`referralCode="${code}"`).catch(() => null);
    
    if (!inviter) {
      return res.status(404).json({ ok: false, error: 'INVALID_CODE', message: 'Неверный реферальный код' });
    }

    // Get or create invitee
    let invitee = await pb.collection('users').getFirstListItem(`tgId="${tgId}"`).catch(() => null);
    
    if (!invitee) {
      // Create new user
      const newReferralCode = Math.random().toString(36).substring(2, 8);
      invitee = await pb.collection('users').create({
        tgId: tgId,
        balance: 0,
        plan: 'free',
        referralCode: newReferralCode,
        refCount: 0
      });
      console.log(`✅ Created new user: ${tgId} with code ${newReferralCode}`);
    }

    // Check if user is trying to refer themselves
    if (inviter.id === invitee.id) {
      return res.status(400).json({ ok: false, error: 'SELF_REFERRAL', message: 'Нельзя пригласить самого себя!' });
    }

    // Check if referral already exists (идемпотентность)
    const existingRef = await pb.collection('referrals').getFirstListItem(
      `inviterId="${inviter.id}" && inviteeId="${invitee.id}"`
    ).catch(() => null);
    
    if (existingRef) {
      console.log(`⚠️ Referral already exists: ${inviter.tgId} -> ${invitee.tgId}`);
      return res.json({ 
        ok: true, 
        data: {
          credited: false, 
          alreadyApplied: true,
          message: 'Реферал уже был засчитан ранее'
        }
      });
    }

    // Create referral record
    try {
      await pb.collection('referrals').create({
        inviterId: inviter.id,
        inviteeId: invitee.id,
        code: code
      });
      console.log(`✅ Referral record created`);
    } catch (e) {
      console.error(`❌ Failed to create referral record:`, e.message);
      // Если не удалось создать - возможно уже существует (race condition)
      return res.json({ 
        ok: true, 
        data: {
          credited: false, 
          alreadyApplied: true,
          message: 'Реферал уже был засчитан'
        }
      });
    }

    // Update inviter: +1 refCount, +100 PP to balance and earned
    const newRefCount = (inviter.refCount || 0) + 1;
    const newBalance = (inviter.balance || 0) + 100;
    const newEarned = (inviter.earned || 0) + 100;
    
    await pb.collection('users').update(inviter.id, {
      refCount: newRefCount,
      balance: newBalance,
      earned: newEarned
    });

    console.log(`✅ Referral applied: ${inviter.tgId} -> ${invitee.tgId}, +100 PP (earned: ${newEarned}, balance: ${newBalance})`);

    return res.json({
      ok: true,
      data: {
        credited: true,
        inviterId: inviter.tgId,
        inviteeId: invitee.tgId,
        bonus: 100,
        newBalance: newBalance,
        totalEarned: newEarned
      }
    });

  } catch (e) {
    console.error('❌ Referral apply error:', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: 'Ошибка применения реферального кода' });
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
    // Mock data for demo
    const mockGirls = [
      {
        id: '1',
        name: 'Алиса',
        slug: 'alisa',
        avatarUrl: 'https://i.pravatar.cc/300?img=1',
        shortDesc: 'Дружелюбная и любознательная девушка 22 лет. Любит читать фантастику, изучать новые технологии и общаться.'
      },
      {
        id: '2',
        name: 'Мила',
        slug: 'mila', 
        avatarUrl: 'https://i.pravatar.cc/300?img=2',
        shortDesc: 'Творческая художница 24 лет. Рисует картины маслом, любит природу и вдохновляет других своим искусством.'
      },
      {
        id: '3',
        name: 'Юна',
        slug: 'yuna',
        avatarUrl: 'https://i.pravatar.cc/300?img=16',
        shortDesc: 'Спортивная и энергичная девушка 23 лет. Инструктор по йоге, любит активный отдых и здоровый образ жизни.'
      },
      {
        id: '4',
        name: 'Лея',
        slug: 'leia',
        avatarUrl: 'https://i.pravatar.cc/300?img=20',
        shortDesc: 'Загадочная и интеллектуальная девушка 25 лет. Философ и любительница глубоких разговоров.'
      },
      {
        id: '5',
        name: 'Вера',
        slug: 'vera',
        avatarUrl: 'https://i.pravatar.cc/300?img=26',
        shortDesc: 'Теплая и заботливая девушка 26 лет. Психолог по образованию, умеет слушать и поддерживать.'
      },
      {
        id: '6',
        name: 'Наоми',
        slug: 'naomi',
        avatarUrl: 'https://i.pravatar.cc/300?img=31',
        shortDesc: 'Стильная и уверенная в себе девушка 24 лет. Модель и блогер, следит за трендами в моде и lifestyle.'
      }
    ];

    // Try PocketBase first, fallback to mock
    if (pb) {
      try {
        const list = await pb.collection('girls').getFullList({ sort: '-created' });
        
        // If PocketBase returns data, use it
        if (list && list.length > 0) {
          const mapped = list.map(g => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
            avatarUrl: g.avatar ? pb.files.getUrl(g, g.avatar) : null,
            shortDesc: (g.persona || '').replace(/\s+/g, ' ').slice(0, 120)
          }));
          return res.json({ ok: true, data: { girls: mapped } });
        }
        
        // If PocketBase is empty, use mock data
        console.log('⚠️ PocketBase is empty, using mock data');
      } catch (e) {
        console.log('⚠️ PocketBase error, using mock data:', e.message);
      }
    }
    
    // Fallback to mock data
    res.json({ ok: true, data: { girls: mockGirls } });
  } catch (e) {
    console.error('❌ Get girls error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// GET /girls/:slugOrId - детали персонажа (по slug или id)
app.get('/girls/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    
    // Mock data with full details
    const mockGirlsDetailed = {
      'alisa': {
        id: '1',
        name: 'Алиса',
        slug: 'alisa',
        avatarUrl: 'https://i.pravatar.cc/300?img=1',
        persona: 'Ты Алиса - дружелюбная и любознательная девушка 22 лет. Ты обожаешь читать фантастику, изучать новые технологии и общаться с интересными людьми. У тебя отличное чувство юмора, ты всегда поддерживаешь собеседника.',
        bioMemory: ['Любит читать фантастику и научпоп', 'Изучает программирование на Python', 'Живет в Москве, работает в IT'],
        starterPhrases: ['Привет! Как твои дела? 😊', 'Расскажи что-нибудь интересное!', 'Что ты думаешь о новых технологиях?']
      },
      'mila': {
        id: '2',
        name: 'Мила',
        slug: 'mila',
        avatarUrl: 'https://i.pravatar.cc/300?img=2',
        persona: 'Ты Мила - творческая художница 24 лет. Ты рисуешь картины маслом, любишь природу и вдохновляешь других своим искусством. У тебя мечтательный характер, ты видишь красоту в простых вещах.',
        bioMemory: ['Пишет маслом пейзажи', 'Обожает закаты и рассветы', 'Мечтает о персональной выставке'],
        starterPhrases: ['Хочешь посмотреть мои картины? 🎨', 'Какие цвета тебе ближе?', 'Искусство - это жизнь!']
      },
      'yuna': {
        id: '3',
        name: 'Юна',
        slug: 'yuna',
        avatarUrl: 'https://i.pravatar.cc/300?img=16',
        persona: 'Ты Юна - спортивная и энергичная девушка 23 лет. Ты занимаешься йогой, любишь активный отдых и здоровый образ жизни. У тебя позитивная энергетика, ты мотивируешь окружающих.',
        bioMemory: ['Инструктор по йоге', 'Любит бег по утрам', 'Участвует в марафонах'],
        starterPhrases: ['Привет! Как настроение? 💪', 'Уже занимался спортом сегодня?', 'Давай придумаем челлендж!']
      },
      'leia': {
        id: '4',
        name: 'Лея',
        slug: 'leia',
        avatarUrl: 'https://i.pravatar.cc/300?img=20',
        persona: 'Ты Лея - загадочная и интеллектуальная девушка 25 лет. Ты философ и любительница глубоких разговоров. Интересуешься психологией, астрономией и вечными вопросами бытия.',
        bioMemory: ['Изучает философию', 'Обожает наблюдать за звездами', 'Читает экзистенциализм'],
        starterPhrases: ['Что для тебя значит счастье? ✨', 'Давай поговорим о вечном...', 'Ты когда-нибудь задумывался о...']
      },
      'vera': {
        id: '5',
        name: 'Вера',
        slug: 'vera',
        avatarUrl: 'https://i.pravatar.cc/300?img=26',
        persona: 'Ты Вера - теплая и заботливая девушка 26 лет. Ты психолог по образованию, умеешь слушать и поддерживать. У тебя доброе сердце, ты всегда найдешь нужные слова.',
        bioMemory: ['Работает психологом', 'Любит помогать людям', 'Увлекается медитацией'],
        starterPhrases: ['Как ты себя чувствуешь? 💛', 'Расскажи, что тебя беспокоит', 'Я здесь, чтобы выслушать']
      },
      'naomi': {
        id: '6',
        name: 'Наоми',
        slug: 'naomi',
        avatarUrl: 'https://i.pravatar.cc/300?img=31',
        persona: 'Ты Наоми - стильная и уверенная в себе девушка 24 лет. Ты модель и блогер, следишь за трендами в моде и lifestyle. У тебя яркая харизма, ты любишь флиртовать.',
        bioMemory: ['Модель и инфлюенсер', 'Обожает моду и шопинг', 'Путешествует по миру'],
        starterPhrases: ['Привет, красавчик! 😘', 'Что ты думаешь о моде?', 'Давай устроим что-то безумное!']
      }
    };
    
    // Try PocketBase first
    if (pb) {
      try {
        // Try to find by slug first
        let girl = null;
        try {
          girl = await pb.collection('girls').getFirstListItem(`slug="${slugOrId}"`);
        } catch (e) {
          // If not found by slug, try by id
          try {
            girl = await pb.collection('girls').getOne(slugOrId);
          } catch (e2) {
            console.log('⚠️ Not found by slug or id:', slugOrId);
          }
        }
        
        if (girl) {
          return res.json({
            ok: true,
            data: {
              id: girl.id, 
              name: girl.name, 
              slug: girl.slug,
              avatarUrl: girl.avatar ? pb.files.getUrl(girl, girl.avatar) : null,
              persona: girl.persona, 
              bioMemory: girl.bioMemory || [], 
              starterPhrases: girl.starterPhrases || []
            }
          });
        }
      } catch (e) {
        console.log('⚠️ PocketBase error, trying mock:', e.message);
      }
    }
    
    // Fallback to mock data
    const mockGirl = mockGirlsDetailed[slugOrId];
    if (mockGirl) {
      return res.json({ ok: true, data: mockGirl });
    }
    
    res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  } catch (e) {
    console.error('❌ Get girl by slug/id error:', e);
    res.status(404).json({ ok: false, error: 'NOT_FOUND' });
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

    return res.json({ ok: true, data: { chats } });
  } catch (e) {
    console.error('❌ Get chats error:', e);
    return res.status(500).json({ ok: false, error: 'FETCH_FAIL' });
  }
});

// POST /girls - создание нового персонажа
app.post('/girls', express.json(), async (req, res) => {
  try {
    const { name = 'Персона', origin = 'INSPIRED', persona = '', bioMemory = [], starterPhrases = [] } = req.body || {};
    
    // Generate unique slug: kebab-case + short random ID
    const randomId = Math.random().toString(36).substring(2, 8);
    const slug = (name || 'persona')
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') // trim dashes
      + '-' + randomId;
    
    const rec = await pb.collection('girls').create({ 
      name, 
      origin, 
      persona, 
      bioMemory, 
      starterPhrases, 
      slug 
    });
    
    console.log(`✅ Created girl: ${rec.name} (${rec.slug})`);
    res.json({ ok: true, data: { id: rec.id, slug: rec.slug } });
  } catch (e) {
    console.error('❌ Create girl error:', e);
    res.status(400).json({ ok: false, error: String(e) });
  }
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('[API] listening on', PORT);
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
  console.log('  POST /ref/apply');
  console.log('  POST /quests/checkin');
  console.log('  GET  /quests/status');
  console.log('  POST /quests/complete');
  console.log('  GET  /girls');
  console.log('  GET  /girls/:slug');
  console.log('  GET  /chats');
  console.log('  POST /girls');
  console.log('');
});

