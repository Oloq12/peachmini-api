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

// Mock data
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

let ai = null;

// Initialize OpenAI
try {
  if (OPENAI_KEY) {
    ai = new OpenAI({
      apiKey: OPENAI_KEY,
      httpAgent: process.env.HTTPS_PROXY ? new (require('https-proxy-agent'))(process.env.HTTPS_PROXY) : undefined
    });
    console.log('✅ OpenAI connected');
  }
} catch (e) {
  console.error('❌ OpenAI error:', e);
}

// Health check
app.get('/health', (req, res) => {
  console.log('[API] /health called');
  res.json({
    ok: true,
    time: Date.now(),
    pb: true, // Mock data available
    ai: !!ai
  });
});

// Girls endpoints
app.get('/girls', async (req, res) => {
  try {
    console.log('📊 Get girls called');
    return res.json({ ok: true, girls: mockGirls });
  } catch (e) {
    console.error('❌ Get girls error:', e);
    return res.status(500).json({ ok: false, error: 'FETCH_FAIL' });
  }
});

app.get('/girls/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('📊 Get girl by slug:', slug);
    
    const girl = mockGirls.find(g => g.slug === slug);
    if (!girl) {
      return res.status(404).json({ ok: false, error: 'GIRL_NOT_FOUND' });
    }
    
    return res.json({
      ok: true,
      girl: {
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
    return res.status(500).json({ ok: false, error: 'FETCH_FAIL' });
  }
});

// Chat endpoint
app.post('/chat/reply', async (req, res) => {
  try {
    const { girlId, userMsg, userId = 'demo' } = req.body || {};
    
    console.log('💬 Chat request:', { girlId, userMsg: userMsg?.slice(0, 20), userId });
    
    if (!girlId || !userMsg) {
      return res.status(400).json({ ok: false, error: 'GIRL_ID_AND_MESSAGE_REQUIRED' });
    }

    if (!ai) return res.status(503).json({ ok: false, error: 'AI_NOT_CONFIGURED' });

    // Get character data
    const girl = mockGirls.find(g => g.id === girlId);
    if (!girl) return res.status(404).json({ ok: false, error: 'GIRL_NOT_FOUND' });

    // Demo balance
    const balance = 1000;

    // Build conversation
    const conversation = [
      { role: 'system', content: girl.persona }
    ];

    // Add current message
    conversation.push({ role: 'user', content: userMsg });

    // Generate response
    const completion = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversation,
      max_tokens: 300,
      temperature: 0.8
    });

    const reply = completion.choices[0]?.message?.content || 'Извините, не могу ответить сейчас.';

    console.log(`✅ Chat: ${userId} -> ${girl.name}: "${userMsg.slice(0, 20)}..." -> "${reply.slice(0, 20)}..."`);

    return res.json({
      ok: true,
      reply,
      balance: balance - 2 // Demo: deduct 2 PP
    });

  } catch (e) {
    console.error('❌ Chat error:', e);
    return res.status(500).json({ ok: false, error: 'CHAT_FAIL' });
  }
});

// Create girl endpoint
app.post('/girls', async (req, res) => {
  try {
    const { name, origin, persona, bioMemory, starterPhrases } = req.body || {};
    if (!name || !persona) return res.status(400).json({ ok: false, error: 'NAME_AND_PERSONA_REQUIRED' });
    
    const slug = name.toLowerCase().replace(/[^a-zа-яё0-9\s]/gi, '').replace(/\s+/g, '-') + '-' + Date.now();
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
    return res.json({ ok: true, id: newId, slug });
  } catch (e) {
    console.error('❌ Create girl error:', e);
    return res.status(500).json({ ok: false, error: 'CREATE_FAIL' });
  }
});

// Persona extraction endpoint
app.post('/api/persona/extract', async (req, res) => {
  try {
    const { samples } = req.body || {};
    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ ok: false, error: 'SAMPLES_REQUIRED' });
    }

    if (!ai) return res.status(503).json({ ok: false, error: 'AI_NOT_CONFIGURED' });

    const prompt = `На основе этих примеров диалогов создай персону персонажа:

${samples.map((s, i) => `${i + 1}. ${s}`).join('\n')}

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
      return res.json({ ok: true, ...parsed });
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
        systemPrompt, 
        bioMemory, 
        starterPhrases 
      });
    }

  } catch (e) {
    console.error('❌ Persona extraction error:', e);
    return res.status(500).json({ ok: false, error: 'EXTRACTION_FAIL' });
  }
});

// Export for Vercel Serverless Functions
// Vercel requires exporting the handler function, not the Express app
module.exports = (req, res) => {
  // Let Express handle the request
  app(req, res);
};