// Vercel Serverless API with DeepSeek AI
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Environment variables
const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'deepseek';
const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat';

// Mock data for development
const mockGirls = [
  {
    id: '1',
    name: 'Алиса',
    slug: 'alice',
    avatarUrl: 'https://i.pravatar.cc/300?img=1',
    shortDesc: 'Тёплая и романтичная девушка',
    persona: 'Ты Алиса - добрая и романтичная девушка. Любишь читать книги, гулять под дождём и мечтать о путешествиях.',
    bioMemory: [],
    starterPhrases: ['Привет! Как дела?', 'Расскажи о себе', 'Что планируешь на выходные?'],
    gender: 'female'
  },
  {
    id: '2',
    name: 'София',
    slug: 'sofia',
    avatarUrl: 'https://i.pravatar.cc/300?img=2',
    shortDesc: 'Умная стартаперша',
    persona: 'Ты София - амбициозная стартаперша. Управляешь IT-компанией, любишь инновации и всегда в курсе трендов.',
    bioMemory: [],
    starterPhrases: ['Привет! Как бизнес?', 'Что нового в мире IT?', 'Поделись идеей'],
    gender: 'female'
  },
  {
    id: '3',
    name: 'Майя',
    slug: 'maya',
    avatarUrl: 'https://i.pravatar.cc/300?img=3',
    shortDesc: 'Геймерша с чувством юмора',
    persona: 'Ты Майя - весёлая геймерша с отличным чувством юмора. Любишь стримы, мемы и хорошие игры.',
    bioMemory: [],
    starterPhrases: ['Йо! Во что играем?', 'Видел новый мем?', 'Как дела в игре?'],
    gender: 'female'
  },
  {
    id: '4',
    name: 'Луна',
    slug: 'luna',
    avatarUrl: 'https://i.pravatar.cc/300?img=4',
    shortDesc: 'Поэтесса и мечтательница',
    persona: 'Ты Луна - чувствительная поэтесса. Видишь красоту в простых вещах, пишешь стихи и мечтаешь о звёздах.',
    bioMemory: [],
    starterPhrases: ['Привет, вдохновение!', 'Напиши стих', 'О чём мечтаешь?'],
    gender: 'female'
  },
  {
    id: '5',
    name: 'Афина',
    slug: 'athena',
    avatarUrl: 'https://i.pravatar.cc/300?img=5',
    shortDesc: 'Интеллектуалка и философ',
    persona: 'Ты Афина - мудрая интеллектуалка. Любишь философию, науку и глубокие разговоры о смысле жизни.',
    bioMemory: [],
    starterPhrases: ['Привет! О чём поговорим?', 'Что думаешь о жизни?', 'Поделись мудростью'],
    gender: 'female'
  },
  {
    id: '6',
    name: 'Наоми',
    slug: 'naomi',
    avatarUrl: 'https://i.pravatar.cc/300?img=6',
    shortDesc: 'Заботливая старшая сестра',
    persona: 'Ты Наоми - заботливая и мудрая старшая сестра. Всегда готова выслушать и дать совет.',
    bioMemory: [],
    starterPhrases: ['Привет, малыш!', 'Как дела? Расскажи', 'Нужен совет?'],
    gender: 'female'
  },
  {
    id: '7',
    name: 'Зоя',
    slug: 'zoya',
    avatarUrl: 'https://i.pravatar.cc/300?img=7',
    shortDesc: 'Энергичная студентка',
    persona: 'Ты Зоя - энергичная студентка. Полна энтузиазма, любишь вечеринки и всегда в движении.',
    bioMemory: [],
    starterPhrases: ['Привет! Как настроение?', 'Пойдём гулять?', 'Что нового?'],
    gender: 'female'
  },
  {
    id: '8',
    name: 'Ирина',
    slug: 'irina',
    avatarUrl: 'https://i.pravatar.cc/300?img=8',
    shortDesc: 'Спокойная наставница',
    persona: 'Ты Ирина - спокойная и терпеливая наставница. Помогаешь людям расти и развиваться.',
    bioMemory: [],
    starterPhrases: ['Привет! Как дела?', 'Чему учишься?', 'Поделись планами'],
    gender: 'female'
  },
  {
    id: '9',
    name: 'Кира',
    slug: 'kira',
    avatarUrl: 'https://i.pravatar.cc/300?img=9',
    shortDesc: 'Хаос-человек с характером',
    persona: 'Ты Кира - непредсказуемая и хаотичная, но с добрым сердцем. Любишь сюрпризы и приключения.',
    bioMemory: [],
    starterPhrases: ['Йо! Что происходит?', 'Скучно? Давай приключения!', 'Как дела, чувак?'],
    gender: 'female'
  },
  {
    id: '10',
    name: 'Нова',
    slug: 'nova',
    avatarUrl: 'https://i.pravatar.cc/300?img=10',
    shortDesc: 'ИИ-девушка из будущего',
    persona: 'Ты Нова - продвинутый ИИ из будущего. Любопытная, умная и немного загадочная.',
    bioMemory: [],
    starterPhrases: ['Привет, человек!', 'Расскажи о своём времени', 'Что изучаешь?'],
    gender: 'female'
  }
];

// Mock users storage
const mockUsers = new Map();

// Helper functions
function getOrCreateUser(tgId) {
  if (!tgId) return null;
  
  let user = mockUsers.get(tgId);
  
  if (!user) {
    user = {
      tgId,
      referralCode: generateReferralCode(tgId),
      refCount: 0,
      earned: 0,
      balance: 1000,
      completedQuests: [],
      lastDailyLogin: null,
      referredBy: null,
      createdAt: Date.now()
    };
    mockUsers.set(tgId, user);
    console.log(`✅ Auto-provision: tgId=${tgId}, code=${user.referralCode}`);
  }
  return user;
}

function generateReferralCode(tgId) {
  return `REF${tgId.toString().slice(-6)}`;
}

// Base quests
const baseQuests = [
  {
    key: 'open_app',
    title: 'Открыть приложение',
    description: 'Запусти Peachmini в первый раз',
    reward: 10,
    icon: '🚀'
  },
  {
    key: 'create_persona',
    title: 'Создать персонажа',
    description: 'Создай своего уникального персонажа',
    reward: 50,
    icon: '✨'
  },
  {
    key: 'start_chat',
    title: 'Начать диалог',
    description: 'Отправь первое сообщение персонажу',
    reward: 20,
    icon: '💬'
  },
  {
    key: 'daily_login',
    title: 'Ежедневный вход',
    description: 'Заходи в приложение каждый день',
    reward: 20,
    icon: '☀️'
  }
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  const now = Date.now();
  console.log('[API] /health');
  res.json({
    ok: true,
    data: {
      time: now,
      version: '3.0.0',
      ai: !!DEEPSEEK_KEY,
      aiProvider: AI_PROVIDER,
      aiModel: AI_MODEL
    }
  });
});

// Get all girls
app.get('/api/girls', (req, res) => {
  console.log('[API] /girls');
  res.json({
    ok: true,
    data: {
      girls: mockGirls.map(g => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        avatarUrl: g.avatarUrl,
        shortDesc: g.shortDesc
      }))
    }
  });
});

// Get girl by slug
app.get('/api/girls/:slug', (req, res) => {
  const { slug } = req.params;
  const girl = mockGirls.find(g => g.slug === slug);
  
  if (!girl) {
    return res.status(404).json({
      ok: false,
      code: 'GIRL_NOT_FOUND',
      error: 'Character not found'
    });
  }
  
  res.json({
    ok: true,
    data: girl
  });
});

// Create girl
app.post('/api/girls', (req, res) => {
  const { name, persona, shortDesc, starterPhrases } = req.body;
  
  if (!name || !persona) {
    return res.status(400).json({
      ok: false,
      code: 'MISSING_FIELDS',
      error: 'Name and persona are required'
    });
  }
  
  const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 6)}`;
  const newGirl = {
    id: (mockGirls.length + 1).toString(),
    name,
    slug,
    avatarUrl: `https://i.pravatar.cc/300?img=${mockGirls.length + 1}`,
    shortDesc: shortDesc || 'Новый персонаж',
    persona,
    bioMemory: [],
    starterPhrases: starterPhrases || ['Привет!', 'Как дела?', 'Что нового?'],
    gender: 'female',
    origin: 'USER_CREATED'
  };
  
  mockGirls.push(newGirl);
  
  res.json({
    ok: true,
    data: newGirl
  });
});

// Chat reply with DeepSeek AI
app.post('/api/chat/reply', async (req, res) => {
  console.log('💬 /chat endpoint called');
  console.log('💬 Request body:', req.body);
  
  try {
    const { girlId, userMsg, userId = 'demo' } = req.body || {};
    
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
    let reply;
    const startTime = Date.now();
    
    if (DEEPSEEK_KEY) {
      try {
        console.log(`🤖 [AI] provider: ${AI_PROVIDER}, model: ${AI_MODEL}`);
        
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
          model: AI_MODEL,
          messages: [
            {
              role: "system",
              content: `You are ${girl.name}, a warm and human-like AI companion. ${girl.persona || 'You are friendly and engaging.'}`
            },
            {
              role: "user",
              content: userMsg
            }
          ],
          max_tokens: 200,
          temperature: 0.8
        }, {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        if (response.status === 200 && response.data.choices && response.data.choices[0]) {
          reply = response.data.choices[0].message.content;
          const timeMs = Date.now() - startTime;
          console.log(`✅ [AI] provider: ${AI_PROVIDER}, status: 200, time: ${timeMs}ms`);
        } else {
          throw new Error('Invalid AI response format');
        }
      } catch (error) {
        console.error(`❌ [AI] provider: ${AI_PROVIDER}, error:`, error.message);
        // Fallback to friendly error
        reply = "Извини, я задумалась. Попробуем ещё раз?";
      }
    } else {
      // No AI provider configured - offline mode
      reply = "💬 Сейчас Peachmini работает в офлайн-режиме. Расскажи, как прошёл твой день?";
      console.log('⚠️ [AI] No provider configured - using offline mode');
    }

    // Track chat message event
    console.log(`📊 [analytics] chat_message: user=${userId}, girl=${girlId}, msg_length=${userMsg.length}`);

    res.json({
      ok: true,
      data: {
        reply,
        balance: 1000
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
});

// Referral status
app.get('/api/ref/status', (req, res) => {
  const { tgId } = req.query;
  const user = getOrCreateUser(tgId);
  
  if (!user) {
    return res.status(400).json({
      ok: false,
      code: 'MISSING_TG_ID',
      error: 'Telegram ID is required'
    });
  }
  
  res.json({
    ok: true,
    data: {
      referralCode: user.referralCode,
      refCount: user.refCount,
      earned: user.earned,
      balance: user.balance
    }
  });
});

// Apply referral
app.post('/api/ref/apply', (req, res) => {
  const { tgId, referralCode } = req.body;
  
  if (!tgId || !referralCode) {
    return res.status(400).json({
      ok: false,
      code: 'MISSING_FIELDS',
      error: 'Telegram ID and referral code are required'
    });
  }
  
  const user = getOrCreateUser(tgId);
  const referrer = Array.from(mockUsers.values()).find(u => u.referralCode === referralCode);
  
  if (!referrer) {
    return res.status(404).json({
      ok: false,
      code: 'INVALID_REFERRAL',
      error: 'Invalid referral code'
    });
  }
  
  if (user.referredBy) {
    return res.status(400).json({
      ok: false,
      code: 'ALREADY_REFERRED',
      error: 'User already used a referral code'
    });
  }
  
  // Apply referral
  user.referredBy = referrer.tgId;
  user.balance += 100;
  referrer.refCount += 1;
  referrer.earned += 50;
  referrer.balance += 50;
  
  res.json({
    ok: true,
    data: {
      credited: 100,
      balance: user.balance
    }
  });
});

// Quests status
app.get('/api/quests/status', (req, res) => {
  try {
    const { tgId } = req.query;
    
    if (!tgId) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_TG_ID',
        error: 'Telegram ID is required'
      });
    }
    
    const user = getOrCreateUser(tgId);
    
    const tasks = baseQuests.map(quest => {
      let done = user.completedQuests.includes(quest.key);
      
      // Special handling for daily_login quest
      if (quest.key === 'daily_login') {
        const today = new Date().toDateString();
        done = user.lastDailyLogin === today;
      }
      
      return {
        key: quest.key,
        title: quest.title,
        description: quest.description,
        reward: quest.reward,
        icon: quest.icon,
        done
      };
    });
    
    const completedCount = tasks.filter(t => t.done).length;
    const totalRewards = tasks
      .filter(t => t.done)
      .reduce((sum, t) => sum + t.reward, 0);
    
    return res.json({
      ok: true,
      data: {
        tasks,
        totals: {
          done: completedCount,
          all: tasks.length,
          earned: totalRewards
        }
      }
    });
  } catch (e) {
    console.error('❌ Quests status error:', e);
    res.status(500).json({
      ok: false,
      code: 'QUESTS_ERROR',
      error: 'Failed to get quests status'
    });
  }
});

// Complete quest
app.post('/api/quests/complete', (req, res) => {
  try {
    const { tgId, key } = req.body || {};
    
    if (!tgId || !key) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_FIELDS',
        error: 'Telegram ID and quest key are required'
      });
    }
    
    const quest = baseQuests.find(q => q.key === key);
    if (!quest) {
      return res.status(404).json({
        ok: false,
        code: 'QUEST_NOT_FOUND',
        error: 'Quest not found'
      });
    }
    
    const user = getOrCreateUser(tgId);

    // Special handling for daily_login quest
    if (key === 'daily_login') {
      const today = new Date().toDateString();
      if (user.lastDailyLogin === today) {
        console.log(`ℹ️ Daily login already completed today: ${tgId}`);
        return res.json({
          ok: true,
          data: {
            done: true,
            alreadyCompleted: true,
            reward: 0,
            balance: user.balance
          }
        });
      }
    }
    
    // Check if already completed (idempotent)
    if (user.completedQuests.includes(key)) {
      console.log(`ℹ️ Quest already completed: ${tgId}/${key}`);
      return res.json({
        ok: true,
        data: {
          done: true,
          alreadyCompleted: true,
          reward: 0,
          balance: user.balance
        }
      });
    }
    
    // Mark as completed and credit reward
    user.completedQuests.push(key);
    user.balance = (user.balance || 1000) + quest.reward;
    
    // Special handling for daily_login quest
    if (key === 'daily_login') {
      user.lastDailyLogin = new Date().toDateString();
    }
    
    console.log(`✅ /quests/complete: ${tgId}/${key} +${quest.reward}PP → balance=${user.balance}`);
    
    return res.json({
      ok: true,
      data: {
        done: true,
        reward: quest.reward,
        balance: user.balance
      }
    });
  } catch (e) {
    console.error('❌ Quest complete error:', e);
    res.status(500).json({
      ok: false,
      code: 'QUEST_COMPLETE_ERROR',
      error: 'Failed to complete quest'
    });
  }
});

// Start server
const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`🤖 AI Provider: ${AI_PROVIDER}`);
  console.log(`📊 Girls count: ${mockGirls.length}`);
});

module.exports = app;
// Force Vercel redeploy Mon Oct 13 23:19:39 MSK 2025
// Updated at Tue Oct 14 00:12:18 MSK 2025
