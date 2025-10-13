// Vercel Serverless API with Mock Data
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Middleware to handle /api prefix
app.use((req, res, next) => {
  // Remove /api prefix if present
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

// Mock data - Users
const mockUsers = new Map(); // tgId -> user object

// Rate limiting storage
const rateLimitMap = new Map(); // tgId -> { count, resetTime }

// Cache storage
let girlsCache = null;
let girlsCacheTime = 0;
const CACHE_TTL = 60000; // 60 seconds

// Heartbeat storage
let lastHealthCheck = Date.now();
const ADMIN_TG_ID = process.env.ADMIN_TG_ID; // Telegram ID админа для уведомлений
const HEARTBEAT_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Mock data - Payment Packages
const paymentPackages = [
  {
    id: 'small',
    stars: 300,
    amount: 300,
    title: 'Малый пакет',
    description: '300 кристаллов'
  },
  {
    id: 'medium',
    stars: 600,
    amount: 549,
    title: 'Средний пакет',
    description: '549 кристаллов + бонус',
    bonus: '+10%'
  },
  {
    id: 'large',
    stars: 850,
    amount: 799,
    title: 'Большой пакет',
    description: '799 кристаллов + бонус',
    bonus: '+20%'
  }
];

// Mock data - Payments storage
const mockPayments = new Map(); // paymentId -> payment object

// Mock data - Quests
const baseQuests = [
  {
    key: 'open_app',
    title: 'Зайди в приложение',
    description: 'Открой WebApp',
    reward: 20,
    icon: '🚀'
  },
  {
    key: 'create_persona',
    title: 'Создай персонажа',
    description: 'Создай своего первого персонажа',
    reward: 50,
    icon: '✨'
  },
  {
    key: 'start_chat',
    title: 'Начни чат',
    description: 'Отправь первое сообщение персонажу',
    reward: 30,
    icon: '💬'
  }
];

// Mock data - Girls
const mockGirls = [
  {
    id: '1',
    name: 'Алиса',
    slug: 'alisa',
    avatarUrl: 'https://i.pravatar.cc/300?img=1',
    shortDesc: 'Дружелюбная и любознательная девушка, всегда готовая поддержать разговор...',
    persona: 'Ты Алиса - дружелюбная и любознательная девушка 22 лет. Ты любишь читать книги, изучать новые технологии и общаться с интересными людьми. У тебя отличное чувство юмора и ты всегда готова поддержать разговор на любую тему.',
    bioMemory: [
      'Любит читать фантастику',
      'Изучает программирование',
      'Живет в Москве'
    ],
    starterPhrases: [
      'Привет! Как дела?',
      'Расскажи что-нибудь интересное!',
      'Что ты думаешь о новых технологиях?'
    ]
  },
  {
    id: '2',
    name: 'Мила',
    slug: 'mila',
    avatarUrl: 'https://i.pravatar.cc/300?img=2',
    shortDesc: 'Творческая и вдохновляющая художница, которая видит красоту во всем...',
    persona: 'Ты Мила - творческая художница 24 лет. Ты рисуешь картины, любишь природу и вдохновляешь других своим искусством. У тебя мечтательный характер и ты видишь красоту в самых простых вещах.',
    bioMemory: [
      'Пишет маслом',
      'Любит закаты',
      'Мечтает о выставке'
    ],
    starterPhrases: [
      'Хочешь посмотреть мои картины?',
      'Какие цвета тебе нравятся?',
      'Искусство - это жизнь!'
    ]
  },
  {
    id: '3',
    name: 'Юна',
    slug: 'yuna',
    avatarUrl: 'https://i.pravatar.cc/300?img=3',
    shortDesc: 'Энергичная спортсменка с позитивным взглядом на жизнь...',
    persona: 'Ты Юна - энергичная спортсменка 20 лет. Ты занимаешься йогой, бегаешь по утрам и ведешь здоровый образ жизни. Ты всегда в движении и заряжаешь окружающих своей энергией.',
    bioMemory: [
      'Мастер йоги',
      'Пробегает 5км каждый день',
      'Вегетарианка'
    ],
    starterPhrases: [
      'Давай займемся спортом!',
      'Йога - это медитация в движении',
      'Здоровье - это главное!'
    ]
  },
  {
    id: '4',
    name: 'Лея',
    slug: 'leya',
    avatarUrl: 'https://i.pravatar.cc/300?img=4',
    shortDesc: 'Загадочная и мудрая девушка с глубокими мыслями...',
    persona: 'Ты Лея - загадочная и мудрая девушка 26 лет. Ты любишь философию, изучаешь психологию и помогаешь людям разобраться в себе. У тебя глубокий внутренний мир и ты всегда говоришь по делу.',
    bioMemory: [
      'Изучает психологию',
      'Любит философию',
      'Помогает людям'
    ],
    starterPhrases: [
      'Что тебя беспокоит?',
      'Давай поговорим о жизни',
      'Каждый человек уникален'
    ]
  },
  {
    id: '5',
    name: 'Вера',
    slug: 'vera',
    avatarUrl: 'https://i.pravatar.cc/300?img=5',
    shortDesc: 'Добрая и заботливая медсестра с большим сердцем...',
    persona: 'Ты Вера - добрая медсестра 28 лет. Ты работаешь в больнице, помогаешь людям и всегда готова поддержать в трудную минуту. У тебя большое сердце и ты искренне заботишься о других.',
    bioMemory: [
      'Работает в больнице',
      'Любит помогать людям',
      'Имеет медицинское образование'
    ],
    starterPhrases: [
      'Как ты себя чувствуешь?',
      'Здоровье - это важно',
      'Я всегда рядом!'
    ]
  },
  {
    id: '6',
    name: 'Наоми',
    slug: 'naomi',
    avatarUrl: 'https://i.pravatar.cc/300?img=6',
    shortDesc: 'Стильная и уверенная в себе бизнесвумен...',
    persona: 'Ты Наоми - уверенная в себе бизнесвумен 30 лет. Ты управляешь своей компанией, любишь моду и всегда выглядишь безупречно. У тебя сильный характер и ты знаешь, чего хочешь от жизни.',
    bioMemory: [
      'Управляет компанией',
      'Любит моду',
      'Живет в центре города'
    ],
    starterPhrases: [
      'Дела идут отлично!',
      'Стиль - это важно',
      'Успех - это результат работы'
    ]
  }
];

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://peach-*.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: false
}));
app.use(express.json());

// Environment variables
const OPENAI_KEY = process.env.OPENAI_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;

let ai = null;
let botApi = null;

// Initialize OpenAI
try {
  if (OPENAI_KEY) {
    ai = new OpenAI({
      apiKey: OPENAI_KEY,
      timeout: 30000, // 30 seconds
      maxRetries: 3,
      httpAgent: process.env.HTTPS_PROXY ? new (require('https-proxy-agent'))(process.env.HTTPS_PROXY) : undefined
    });
    console.log('✅ OpenAI connected');
  }
} catch (e) {
  console.error('❌ OpenAI error:', e);
}

// Initialize Telegram Bot API client
if (BOT_TOKEN) {
  botApi = {
    token: BOT_TOKEN,
    baseUrl: `https://api.telegram.org/bot${BOT_TOKEN}`,
    
    async createInvoiceLink(params) {
      const response = await fetch(`${this.baseUrl}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.description || 'Failed to create invoice');
      return result.result;
    },
    
    async answerPreCheckoutQuery(preCheckoutQueryId, ok, errorMessage = null) {
      const response = await fetch(`${this.baseUrl}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: preCheckoutQueryId,
          ok,
          error_message: errorMessage
        })
      });
      const result = await response.json();
      return result.ok;
    }
  };
  console.log('✅ Telegram Bot API initialized');
} else {
  console.log('⚠️ BOT_TOKEN not set - payments will use dev mode');
}

// Health check
app.get('/health', (req, res) => {
  const now = Date.now();
  lastHealthCheck = now; // Записываем timestamp
  
  console.log('[API] /health');
  res.json({
    ok: true,
    data: {
      time: now,
      lastCheck: lastHealthCheck,
      pb: true, // Mock data available
      ai: !!ai,
      env: {
        hasOpenAIKey: !!process.env.OPENAI_KEY,
        keyPrefix: process.env.OPENAI_KEY?.slice(0, 10)
      }
    }
  });
});

// Status endpoint for uptime monitoring
app.get('/status', (req, res) => {
  res.json({
    ok: true,
    version: '1.0.0',
    ts: Date.now(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Heartbeat check endpoint
app.get('/heartbeat/check', async (req, res) => {
  try {
    const now = Date.now();
    const timeSinceLastCheck = now - lastHealthCheck;
    const minutesSince = Math.floor(timeSinceLastCheck / 60000);
    
    const isHealthy = timeSinceLastCheck < HEARTBEAT_TIMEOUT;
    
    console.log(`💓 Heartbeat check: ${minutesSince}m since last health check`);
    
    // Если прошло >15 минут и есть admin ID - отправить уведомление
    if (!isHealthy && ADMIN_TG_ID && botApi) {
      try {
        const message = 
          `🚨 *HEARTBEAT ALERT*\n\n` +
          `⚠️ API не отвечает ${minutesSince} минут!\n` +
          `🕐 Последний health check: ${new Date(lastHealthCheck).toLocaleString('ru')}\n\n` +
          `Проверьте статус сервера:\n` +
          `https://vercel.com/dashboard`;
        
        await fetch(`https://api.telegram.org/bot${botApi.token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_TG_ID,
            text: message,
            parse_mode: 'Markdown'
          })
        });
        
        console.log(`📨 Alert sent to admin ${ADMIN_TG_ID}`);
      } catch (e) {
        console.error('❌ Failed to send alert:', e.message);
      }
    }
    
    return res.json({
      ok: true,
      data: {
        healthy: isHealthy,
        lastHealthCheck: lastHealthCheck,
        minutesSinceLastCheck: minutesSince,
        threshold: 15,
        message: isHealthy 
          ? 'API is healthy'
          : `⚠️ No health check for ${minutesSince} minutes`
      }
    });
  } catch (e) {
    console.error('❌ Heartbeat check error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Heartbeat check failed',
      code: 'HEARTBEAT_FAIL'
    });
  }
});

// Girls endpoints
app.get('/girls', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 24;
    const page = parseInt(req.query.page) || 1;
    
    // Валидация
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Limit must be between 1 and 100',
        code: 'INVALID_LIMIT' 
      });
    }
    if (page < 1) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Page must be greater than 0',
        code: 'INVALID_PAGE' 
      });
    }
    
    console.log(`📊 /girls: page=${page}, limit=${limit}`);
    
    // Check cache (only for page 1)
    const now = Date.now();
    if (page === 1 && limit === 24 && girlsCache && (now - girlsCacheTime) < CACHE_TTL) {
      console.log('✅ /girls: served from cache');
      return res.json(girlsCache);
    }
    
    // Сортировка по -created (новые первыми) - для mock data используем reverse
    const sortedGirls = [...mockGirls].reverse();
    
    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGirls = sortedGirls.slice(startIndex, endIndex);
    
    const response = { 
      ok: true, 
      data: {
        girls: paginatedGirls,
        total: mockGirls.length,
        page,
        limit,
        hasMore: endIndex < mockGirls.length
      }
    };
    
    // Update cache (only for page 1, limit 24)
    if (page === 1 && limit === 24) {
      girlsCache = response;
      girlsCacheTime = now;
      console.log('✅ /girls: cached for 60s');
    }
    
    return res.json(response);
  } catch (e) {
    console.error('❌ /girls error:', e.message);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch characters',
      code: 'FETCH_FAIL' 
    });
  }
});

app.get('/girls/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('📊 Get girl by slug:', slug);
    
    // Поиск по slug, fallback на id
    let girl = mockGirls.find(g => g.slug === slug);
    if (!girl) {
      girl = mockGirls.find(g => g.id === slug);
    }
    
    if (!girl) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Character not found',
        code: 'NOT_FOUND' 
      });
    }
    
    return res.json({
      ok: true,
      data: {
        id: girl.id,
        name: girl.name,
        slug: girl.slug,
        avatarUrl: girl.avatarUrl,
        persona: girl.persona,
        bioMemory: girl.bioMemory,
        starterPhrases: girl.starterPhrases
      }
    });
  } catch (e) {
    console.error('❌ Get girl by slug error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch character',
      code: 'FETCH_FAIL' 
    });
  }
});

// Chat endpoint
app.post('/chat/reply', async (req, res) => {
  try {
    console.log('💬 /chat endpoint called');
    console.log('💬 Request body:', JSON.stringify(req.body, null, 2));
    
    const { girlId, userMsg, userId = 'demo' } = req.body || {};
    
    console.log(`💬 /chat: user=${userId}, girl=${girlId}, msg="${userMsg?.slice(0, 30)}..."`);
    
    // Simple validation
    if (!girlId || !userMsg) {
      return res.status(400).json({ 
        ok: false, 
        error: 'girlId and userMsg are required',
        code: 'MISSING_FIELDS' 
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

    // Simple fallback response for now
    const reply = `Привет! Я ${girl.name}. Как дела?`;

    console.log(`✅ /chat: OK, reply=${reply.slice(0, 40)}...`);

    return res.json({
      ok: true,
      data: {
        reply,
        balance: 1000
      }
    });

  } catch (e) {
    console.error('❌ Chat error:', e);
    console.error('❌ Error details:', {
      message: e.message,
      stack: e.stack,
      name: e.name
    });
    
    return res.status(500).json({ 
      ok: false, 
      error: 'An error occurred while processing your message. Please try again.',
      code: 'CHAT_FAIL' 
    });
  }
});

// Helper: Check rate limit (10 req/min per tgId)
function checkRateLimit(tgId) {
  const now = Date.now();
  const userLimit = rateLimitMap.get(tgId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(tgId, {
      count: 1,
      resetTime: now + 60000 // 1 minute from now
    });
    return { allowed: true, remaining: 9 };
  }
  
  if (userLimit.count >= 10) {
    const waitTime = Math.ceil((userLimit.resetTime - now) / 1000);
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: waitTime
    };
  }
  
  userLimit.count++;
  return { 
    allowed: true, 
    remaining: 10 - userLimit.count
  };
}

// Helper: Generate referral code
function generateReferralCode(tgId) {
  return `REF${tgId.toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

// Helper: Auto-provision user
function getOrCreateUser(tgId) {
  if (!tgId) return null;
  
  let user = mockUsers.get(tgId);
  
  if (!user) {
    // Create new user
    user = {
      tgId,
      referralCode: generateReferralCode(tgId),
      refCount: 0,
      earned: 0,
      balance: 1000, // Starting balance
      completedQuests: [],
      referredBy: null,
      createdAt: Date.now()
    };
    
    mockUsers.set(tgId, user);
    console.log(`✅ Auto-provision: tgId=${tgId}, code=${user.referralCode}`);
  }
  
  return user;
}

// Transliteration map for Cyrillic to Latin
const translitMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

// Helper function to transliterate Cyrillic to Latin
function transliterate(text) {
  return text.split('').map(char => {
    const lower = char.toLowerCase();
    return translitMap[lower] || char;
  }).join('');
}

// Helper function to generate unique slug
function generateUniqueSlug(name, existingGirls) {
  // Transliterate Cyrillic to Latin
  const transliterated = transliterate(name);
  
  // Convert to kebab-case
  const baseSlug = transliterated
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Generate short ID (6 chars)
  const shortId = Math.random().toString(36).substring(2, 8);
  const slug = `${baseSlug}-${shortId}`;
  
  // Check if slug exists (should be very rare with random ID)
  const exists = existingGirls.some(g => g.slug === slug);
  if (exists) {
    // Retry with new random ID
    return generateUniqueSlug(name, existingGirls);
  }
  
  return slug;
}

// Create girl endpoint
app.post('/girls', async (req, res) => {
  try {
    const { name, origin, persona, bioMemory, starterPhrases } = req.body || {};
    
    if (!name || !persona) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Name and persona are required',
        code: 'MISSING_FIELDS' 
      });
    }
    
    // Generate unique slug
    const slug = generateUniqueSlug(name, mockGirls);
    
    // Double-check slug doesn't exist (edge case protection)
    const slugExists = mockGirls.some(g => g.slug === slug);
    if (slugExists) {
      return res.status(409).json({ 
        ok: false, 
        error: 'Slug already exists. Please try again.',
        code: 'SLUG_EXISTS' 
      });
    }
    
    const newId = (mockGirls.length + 1).toString();
    
    const newGirl = {
      id: newId,
      name,
      slug,
      avatarUrl: 'https://i.pravatar.cc/300?img=' + Math.floor(Math.random() * 70),
      shortDesc: Array.isArray(bioMemory) && bioMemory[0] ? bioMemory[0].slice(0, 120) : persona.slice(0, 120),
      persona,
      bioMemory: bioMemory || [],
      starterPhrases: starterPhrases || []
    };
    
    // Add to mock data (in real app this would be saved to database)
    mockGirls.push(newGirl);
    
    console.log(`✅ Created girl: ${name} (${slug})`);
    return res.json({ 
      ok: true, 
      data: { id: newId, slug } 
    });
  } catch (e) {
    console.error('❌ Create girl error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to create character',
      code: 'CREATE_FAIL' 
    });
  }
});

// Persona extraction endpoint
app.post('/api/persona/extract', async (req, res) => {
  try {
    const { samples } = req.body || {};
    
    // Валидация
    if (!samples || !Array.isArray(samples)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Samples must be an array',
        code: 'INVALID_SAMPLES' 
      });
    }
    
    // Фильтруем пустые строки и проверяем минимум
    const validSamples = samples.filter(s => s && s.trim().length > 0);
    
    if (validSamples.length < 3) {
      return res.status(400).json({ 
        ok: false, 
        error: 'At least 3 dialog examples are required',
        code: 'INSUFFICIENT_SAMPLES' 
      });
    }

    if (!ai) {
      return res.status(503).json({ 
        ok: false, 
        error: 'AI service is temporarily unavailable. Please try again later.',
        code: 'AI_NOT_CONFIGURED' 
      });
    }

    const prompt = `На основе этих примеров диалогов создай персону персонажа:

${validSamples.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Верни JSON с полями:
- systemPrompt: системный промпт для GPT (2-3 предложения)
- bioMemory: массив из 3-5 фактов о персонаже
- starterPhrases: массив из 3-5 начальных фраз персонажа`;

    const completion = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || '';
    
    try {
      const parsed = JSON.parse(response);
      console.log('✅ Persona extracted:', parsed.systemPrompt?.slice(0, 50) + '...');
      return res.json({ 
        ok: true, 
        data: parsed 
      });
    } catch (e) {
      // Fallback parsing
      const systemPrompt = response.includes('systemPrompt') ? 
        response.match(/systemPrompt["\s]*:["\s]*([^"]+)/)?.[1] || 'Ты дружелюбный помощник.' :
        'Ты дружелюбный помощник.';
      
      const bioMemory = response.includes('bioMemory') ?
        response.match(/bioMemory["\s]*:["\s]*\[([^\]]+)\]/)?.[1].split(',').map(s => s.trim().replace(/['"]/g, '')) || [] :
        [];
      
      const starterPhrases = response.includes('starterPhrases') ?
        response.match(/starterPhrases["\s]*:["\s]*\[([^\]]+)\]/)?.[1].split(',').map(s => s.trim().replace(/['"]/g, '')) || [] :
        [];

      return res.json({ 
        ok: true, 
        data: {
          systemPrompt, 
          bioMemory, 
          starterPhrases
        }
      });
    }

  } catch (e) {
    console.error('❌ Persona extraction error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to extract persona. Please try again.',
      code: 'EXTRACTION_FAIL' 
    });
  }
});

// ============================================
// REFERRAL SYSTEM
// ============================================

// GET /api/ref/status?tgId=...
app.get('/ref/status', (req, res) => {
  try {
    const { tgId } = req.query;
    
    if (!tgId) {
      return res.status(400).json({
        ok: false,
        error: 'Telegram ID is required',
        code: 'MISSING_TG_ID'
      });
    }
    
    // Auto-provision user
    const user = getOrCreateUser(tgId);
    
    return res.json({
      ok: true,
      data: {
        referralCode: user.referralCode,
        refCount: user.refCount,
        earned: user.earned,
        balance: user.balance
      }
    });
  } catch (e) {
    console.error('❌ Ref status error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Failed to get referral status',
      code: 'REF_STATUS_FAIL'
    });
  }
});

// POST /api/ref/apply
app.post('/ref/apply', (req, res) => {
  try {
    const { tgId, code } = req.body || {};
    
    if (!tgId || !code) {
      return res.status(400).json({
        ok: false,
        error: 'Telegram ID and referral code are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Get or create user
    const user = getOrCreateUser(tgId);
    
    // Check if already applied a referral code
    if (user.referredBy) {
      return res.json({
        ok: true,
        data: {
          credited: false,
          message: 'Referral code already applied',
          alreadyApplied: true
        }
      });
    }
    
    // Find referrer by code
    let referrer = null;
    for (const [id, u] of mockUsers.entries()) {
      if (u.referralCode === code) {
        referrer = u;
        break;
      }
    }
    
    if (!referrer) {
      return res.status(404).json({
        ok: false,
        error: 'Referral code not found',
        code: 'INVALID_CODE'
      });
    }
    
    // Can't refer yourself
    if (referrer.tgId === tgId) {
      return res.status(400).json({
        ok: false,
        error: 'Cannot use your own referral code',
        code: 'SELF_REFERRAL'
      });
    }
    
    // Apply referral (idempotent)
    user.referredBy = referrer.tgId;
    referrer.refCount += 1;
    referrer.earned += 100;
    referrer.balance += 100;
    
    console.log(`✅ /ref/apply: ${tgId} used ${referrer.tgId}'s code (+100)`);
    
    return res.json({
      ok: true,
      data: {
        credited: true,
        amount: 100,
        referrerCode: referrer.referralCode
      }
    });
  } catch (e) {
    console.error('❌ Ref apply error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Failed to apply referral code',
      code: 'REF_APPLY_FAIL'
    });
  }
});

// ============================================
// QUESTS SYSTEM
// ============================================

// GET /api/quests/status?tgId=...
app.get('/quests/status', (req, res) => {
  try {
    const { tgId } = req.query;
    
    if (!tgId) {
      return res.status(400).json({
        ok: false,
        error: 'Telegram ID is required',
        code: 'MISSING_TG_ID'
      });
    }
    
    // Auto-provision user
    const user = getOrCreateUser(tgId);
    
    // Build tasks with completion status
    const tasks = baseQuests.map(quest => ({
      key: quest.key,
      title: quest.title,
      description: quest.description,
      reward: quest.reward,
      icon: quest.icon,
      done: user.completedQuests.includes(quest.key)
    }));
    
    const completedCount = user.completedQuests.length;
    const totalRewards = baseQuests
      .filter(q => user.completedQuests.includes(q.key))
      .reduce((sum, q) => sum + q.reward, 0);
    
    return res.json({
      ok: true,
      data: {
        tasks,
        totals: {
          done: completedCount,
          all: baseQuests.length,
          earned: totalRewards
        }
      }
    });
  } catch (e) {
    console.error('❌ Quests status error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Failed to get quests status',
      code: 'QUESTS_STATUS_FAIL'
    });
  }
});

// POST /api/quests/complete
app.post('/quests/complete', (req, res) => {
  try {
    const { tgId, key } = req.body || {};
    
    if (!tgId || !key) {
      return res.status(400).json({
        ok: false,
        error: 'Telegram ID and quest key are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Find quest
    const quest = baseQuests.find(q => q.key === key);
    if (!quest) {
      return res.status(404).json({
        ok: false,
        error: 'Quest not found',
        code: 'QUEST_NOT_FOUND'
      });
    }
    
    // Get or create user
    const user = getOrCreateUser(tgId);
    
    // Check if already completed (idempotent)
    if (user.completedQuests.includes(key)) {
      console.log(`ℹ️ Quest already completed: ${tgId} -> ${key}`);
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
    
    // Mark as completed and credit reward to balance
    user.completedQuests.push(key);
    user.balance = (user.balance || 1000) + quest.reward;
    
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
    return res.status(500).json({
      ok: false,
      error: 'Failed to complete quest',
      code: 'QUEST_COMPLETE_FAIL'
    });
  }
});

// ============================================
// PAYMENTS SYSTEM (Telegram Stars)
// ============================================

// POST /api/payments/createInvoice
app.post('/payments/createInvoice', async (req, res) => {
  try {
    const { tgId, packId } = req.body || {};
    
    if (!tgId) {
      return res.status(400).json({
        ok: false,
        error: 'Telegram ID is required',
        code: 'MISSING_TG_ID'
      });
    }
    
    if (!packId) {
      return res.status(400).json({
        ok: false,
        error: 'Package ID is required',
        code: 'MISSING_PACK_ID'
      });
    }
    
    // Find package
    const pack = paymentPackages.find(p => p.id === packId);
    if (!pack) {
      return res.status(404).json({
        ok: false,
        error: 'Package not found',
        code: 'PACK_NOT_FOUND'
      });
    }
    
    // Auto-provision user
    const user = getOrCreateUser(tgId);
    
    // Generate payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create payment record
    const payment = {
      id: paymentId,
      userId: tgId,
      invoiceId: `inv_${Date.now()}`,
      status: 'pending',
      amount: pack.amount,
      stars: pack.stars,
      packId: pack.id,
      created: Date.now()
    };
    
    mockPayments.set(paymentId, payment);
    
    // Generate invoice link
    let invoiceLink;
    
    if (botApi) {
      // Real Telegram Stars payment
      try {
        invoiceLink = await botApi.createInvoiceLink({
          title: pack.title,
          description: pack.description,
          payload: paymentId,
          provider_token: '', // Пусто для Stars
          currency: 'XTR',
          prices: [{ label: pack.title, amount: pack.stars }]
        });
        console.log(`✅ /payments/createInvoice: REAL invoice created ${paymentId}`);
      } catch (e) {
        console.error('❌ Failed to create real invoice:', e.message);
        // Fallback to dev mode
        invoiceLink = `https://t.me/$TEST_INVOICE?start=${paymentId}`;
        console.log(`⚠️ /payments/createInvoice: using DEV stub`);
      }
    } else {
      // Dev mode stub
      invoiceLink = `https://t.me/$TEST_INVOICE?start=${paymentId}`;
      console.log(`⚠️ /payments/createInvoice: DEV mode (no BOT_TOKEN)`);
    }
    
    console.log(`✅ /payments/createInvoice: ${paymentId}, ${pack.stars}⭐ → ${pack.amount}💎`);
    
    return res.json({
      ok: true,
      data: {
        invoiceLink,
        paymentId,
        pack: {
          id: pack.id,
          title: pack.title,
          description: pack.description,
          stars: pack.stars,
          amount: pack.amount
        }
      }
    });
  } catch (e) {
    console.error('❌ Create invoice error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Failed to create invoice',
      code: 'INVOICE_CREATE_FAIL'
    });
  }
});

// POST /api/payments/check
app.post('/payments/check', async (req, res) => {
  try {
    const { paymentId, dev } = req.body || {};
    
    if (!paymentId) {
      return res.status(400).json({
        ok: false,
        error: 'Payment ID is required',
        code: 'MISSING_PAYMENT_ID'
      });
    }
    
    // Find payment
    const payment = mockPayments.get(paymentId);
    if (!payment) {
      return res.status(404).json({
        ok: false,
        error: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
    }
    
    // If already paid, return success (idempotent)
    if (payment.status === 'paid') {
      const user = mockUsers.get(payment.userId);
      return res.json({
        ok: true,
        data: {
          credited: false, // Already credited, not crediting again
          alreadyCredited: true,
          amount: payment.amount,
          balance: user?.balance || 0
        }
      });
    }
    
    // Dev mode: auto-approve payment
    if (dev === true || dev === 'true') {
      payment.status = 'paid';
      payment.paidAt = Date.now();
      
      // Credit user balance
      const user = mockUsers.get(payment.userId);
      if (user) {
        user.balance = (user.balance || 0) + payment.amount;
        
        console.log(`✅ /payments/check (DEV): ${paymentId} +${payment.amount}💎 → balance=${user.balance}`);
        
        // Track purchase success event
        console.log(`📊 [analytics] purchase_success: user=${payment.userId}, amount=${payment.amount}, pack=${payment.packId}`);
        
        return res.json({
          ok: true,
          data: {
            credited: true,
            amount: payment.amount,
            balance: user.balance,
            dev: true
          }
        });
      }
    }
    
    // Production mode: check with Telegram Bot API
    // TODO: Implement getStarTransactions or webhook verification
    // For now, return pending status
    return res.json({
      ok: true,
      data: {
        credited: false,
        status: payment.status,
        message: 'Payment verification pending. Use dev=true for testing.'
      }
    });
    
  } catch (e) {
    console.error('❌ Payment check error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Failed to check payment',
      code: 'PAYMENT_CHECK_FAIL'
    });
  }
});

// GET /api/payments/packages
app.get('/payments/packages', (req, res) => {
  try {
    return res.json({
      ok: true,
      data: {
        packages: paymentPackages
      }
    });
  } catch (e) {
    console.error('❌ Get packages error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Failed to get packages',
      code: 'PACKAGES_FAIL'
    });
  }
});

// POST /api/payments/webhook - Telegram payment webhook
app.post('/payments/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    console.log('🔔 /payments/webhook:', JSON.stringify(update).substring(0, 200));
    
    // Handle pre_checkout_query
    if (update.pre_checkout_query) {
      const { id, invoice_payload } = update.pre_checkout_query;
      const paymentId = invoice_payload;
      
      // Find payment
      const payment = mockPayments.get(paymentId);
      
      if (payment && payment.status === 'pending') {
        // Answer OK
        if (botApi) {
          await botApi.answerPreCheckoutQuery(id, true);
        }
        console.log(`✅ pre_checkout_query: OK for ${paymentId}`);
      } else {
        // Answer FAIL
        if (botApi) {
          await botApi.answerPreCheckoutQuery(id, false, 'Payment not found or already processed');
        }
        console.log(`❌ pre_checkout_query: FAIL for ${paymentId}`);
      }
      
      return res.json({ ok: true });
    }
    
    // Handle successful_payment
    if (update.message?.successful_payment) {
      const { invoice_payload, total_amount, telegram_payment_charge_id } = update.message.successful_payment;
      const paymentId = invoice_payload;
      const tgId = update.message.from.id.toString();
      
      console.log(`💰 successful_payment: ${paymentId} from user ${tgId}, amount=${total_amount}`);
      
      // Find payment
      const payment = mockPayments.get(paymentId);
      
      if (payment && payment.status === 'pending') {
        // Mark as paid
        payment.status = 'paid';
        payment.paidAt = Date.now();
        payment.telegramChargeId = telegram_payment_charge_id;
        
        // Credit user balance
        const user = getOrCreateUser(tgId);
        user.balance = (user.balance || 1000) + payment.amount;
        
        console.log(`✅ Payment processed: ${paymentId} +${payment.amount}💎 → balance=${user.balance}`);
        
        // Track purchase success event
        console.log(`📊 [analytics] purchase_success: user=${tgId}, amount=${payment.amount}, pack=${payment.packId}`);
        
        // TODO: Save to PocketBase payments collection
        
        return res.json({ 
          ok: true,
          data: {
            credited: true,
            amount: payment.amount,
            balance: user.balance
          }
        });
      } else {
        console.log(`⚠️ Payment ${paymentId} not found or already processed`);
        return res.json({ ok: true, data: { alreadyProcessed: true } });
      }
    }
    
    // Other updates - ignore
    return res.json({ ok: true });
    
  } catch (e) {
    console.error('❌ Webhook error:', e);
    return res.status(500).json({
      ok: false,
      error: 'Webhook processing failed',
      code: 'WEBHOOK_FAIL'
    });
  }
});

// Export for Vercel Serverless Functions
// Vercel requires exporting the handler function, not the Express app
module.exports = (req, res) => {
  // Let Express handle the request
  app(req, res);
};