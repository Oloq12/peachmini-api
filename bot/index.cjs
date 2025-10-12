// bot/index.cjs
// ──────────────────────────────────────────────────────────
// 1. Подключаем .env и библиотеки
require('dotenv').config({ path: '../.env' });          // читает BOT_TOKEN и, при желании, PB_URL
const { Telegraf, Markup } = require('telegraf');

// 2. Проверяем, что токен есть
if (!process.env.BOT_TOKEN) {
  throw new Error('⛔  В .env должен быть BOT_TOKEN');
}

// 3. Подключаем PocketBase
const { saveCharacter, getCharacters, ensureUserInDB, processReferral, getReferralStats } = require('./pb.cjs');

// 4. Встроенные данные и функции
const RUSSIAN_CHARACTERS = [
  {
    id: 'alisa_playful',
    name: 'Алиса',
    age: 22,
    summary: 'Студентка филфака, игривая и кокетливая',
    emoji: '😊',
    greeting: 'Привет-привет! 😊 Ты как, не скучаешь без меня?'
  },
  {
    id: 'katya_confident',
    name: 'Катя', 
    age: 25,
    summary: 'Успешная маркетолог, уверенная в себе',
    emoji: '💪',
    greeting: 'Ну привет, работяга! 💪 Как проекты?'
  },
  {
    id: 'mila_romantic',
    name: 'Мила',
    age: 20,
    summary: 'Художница, романтичная и мечтательная',
    emoji: '🌸',
    greeting: 'Привет, милый... 🌸 Как настроение?'
  },
  {
    id: 'nastya_naughty',
    name: 'Настя',
    age: 24,
    summary: 'Фотомодель, озорная и соблазнительная',
    emoji: '😈',
    greeting: 'Оу, привет! 😈 Что задумал?'
  },
  {
    id: 'lena_mysterious',
    name: 'Лена',
    age: 28,
    summary: 'Психолог, загадочная и интеллектуальная',
    emoji: '🔮',
    greeting: 'Здравствуй... 🔮 Что привело тебя ко мне?'
  },
  {
    id: 'anya_cheerful', 
    name: 'Аня',
    age: 19,
    summary: 'Студентка, веселая и энергичная',
    emoji: '🌟',
    greeting: 'Хаааай! 🌟 Ты такой крутой!'
  }
];

// Простые ответы для персонажей
const CHARACTER_RESPONSES = {
  'alisa_playful': ["Хихи, ты забавный! 😊", "Ой, интересно! Расскажи больше! 😄", "Ты такой милый! 🥰"],
  'katya_confident': ["Хм, неплохо! 💪", "Расскажи, как дела с работой? 💼", "Надеюсь, не сидишь без дела! 😏"],
  'mila_romantic': ["Как романтично... 🌸", "Ты такой нежный... 💕", "Мне нравится с тобой говорить 🥰"],
  'nastya_naughty': ["Ой, озорник! 😈", "Хихи, заинтриговал! 🔥", "Мне нравится твой стиль! 💋"],
  'lena_mysterious': ["Интересно... 🔮", "И что ты об этом думаешь? 💭", "Это многое говорит о тебе... 😌"],
  'anya_cheerful': ["Вау, классно! 🌟", "Хихи, супер! 😍", "Расскажи еще что-нибудь! ✨"]
};

// Хранилище пользователей
const users = new Map();

// Функции
async function ensureUser(tgId) {
  const userId = tgId.toString();
  if (!users.has(userId)) {
    users.set(userId, { 
      tgId: userId, 
      messagesLeft: 30, 
      isPremium: false, 
      totalMessages: 0,
      lastDaily: null,
      dailyStreak: 0,
      totalRewards: 0,
      registrationDate: new Date(),
      referralCode: userId.slice(-6),
      referredBy: null,
      referrals: [],
      referralRewards: 0,
      completedTasks: [],
      taskRewards: 0,
      photosViewed: 0,
      freePhotosLeft: 3,
      paidPhotos: 0
    });
  }
  return users.get(userId);
}

async function getUserStats() {
  return { total: users.size, premium: 0, free: users.size, totalMessages: 0 };
}

async function checkMessageLimit(userId) {
  const user = await ensureUser(userId);
  return { canSend: true, messagesLeft: user.messagesLeft, isPremium: user.isPremium };
}

async function useMessage(userId) {
  const user = await ensureUser(userId);
  if (!user.isPremium && user.messagesLeft > 0) {
    user.messagesLeft--;
    user.totalMessages++;
    users.set(userId.toString(), user);
    console.log(`📉 User ${userId} used message, left: ${user.messagesLeft}`);
  }
}

function formatLimitMessage(limitInfo) {
  if (limitInfo.isPremium) {
    return '💎 У вас Premium! Безлимитное общение активно.';
  }
  
  let message = `💬 Осталось сообщений: ${limitInfo.messagesLeft}/30`;
  
  if (limitInfo.messagesLeft <= 5) {
    message += '\n\n⚠️ Сообщения заканчиваются! Хотите безлимит?';
    message += '\n💎 Premium за 250⭐ - безлимитное общение!';
  }
  
  return message;
}

function formatLimitExceededMessage() {
  return '😔 Лимит исчерпан! Получите Premium: /premium';
}

function getPricingInfo() {
  return `💎 PREMIUM PEACH MINI\n\n` +
    `🔥 Безлимитные диалоги\n` +
    `💌 Доступ ко всем персонажам\n` +
    `📸 Безлимитные фотографии\n` +
    `⚡ Приоритетные ответы\n` +
    `🎁 Эксклюзивный контент\n\n` +
    `💰 Цена: 250 звезд ⭐\n` +
    `⏰ Срок: 30 дней\n\n` +
    `🛒 Купить: /buy_premium`;
}

// 💰 ПРОДВИНУТАЯ СИСТЕМА ПЛАТЕЖЕЙ
const PAYMENT_PACKAGES = {
  single_photo: {
    id: 'single_photo',
    title: '📸 1 фотография',
    description: 'Одно фото от любой девушки',
    price: 50,
    items: 1,
    type: 'photos'
  },
  photo_pack_5: {
    id: 'photo_pack_5',
    title: '📸 Пакет 5 фото',
    description: '5 фотографий от девушек',
    price: 200,
    items: 5,
    type: 'photos',
    discount: '20%'
  },
  message_pack_50: {
    id: 'message_pack_50',
    title: '💬 50 сообщений',
    description: '50 дополнительных сообщений',
    price: 150,
    items: 50,
    type: 'messages'
  },
  message_pack_100: {
    id: 'message_pack_100',
    title: '💬 100 сообщений',
    description: '100 дополнительных сообщений',
    price: 250,
    items: 100,
    type: 'messages',
    discount: '17%'
  },
  premium: {
    id: 'premium',
    title: '💎 Premium подписка',
    description: 'Безлимитное общение и фото на 30 дней',
    price: 250,
    items: 30,
    type: 'premium'
  }
};

function getShopInfo() {
  return `🛒 МАГАЗИН PEACH MINI\n\n` +
    `📸 ФОТОГРАФИИ:\n` +
    `• 1 фото - 50⭐\n` +
    `• 5 фото - 200⭐ (скидка 20%)\n\n` +
    `💬 СООБЩЕНИЯ:\n` +
    `• 50 сообщений - 150⭐\n` +
    `• 100 сообщений - 250⭐ (скидка 17%)\n\n` +
    `💎 PREMIUM:\n` +
    `• Безлимит на 30 дней - 250⭐\n\n` +
    `🛍️ Купить: /shop`;
}

async function chatWithRussianGirl(message, character) {
  const responses = CHARACTER_RESPONSES[character.id] || ["Интересно! 😊", "Расскажи больше! 💕"];
  return responses[Math.floor(Math.random() * responses.length)];
}

async function testClaudeConnection() {
  return "Система работает! 🤖";
}

// 🎁 СИСТЕМА ЕЖЕДНЕВНЫХ НАГРАД
async function checkDailyReward(userId) {
  const user = await ensureUser(userId);
  const now = new Date();
  const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;
  
  if (!lastDaily) {
    // Первый раз
    return { 
      canClaim: true, 
      streak: 0, 
      reward: 5, 
      isFirstTime: true 
    };
  }
  
  const daysDiff = Math.floor((now - lastDaily) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 1) {
    // Можно получить награду
    const newStreak = daysDiff === 1 ? user.dailyStreak + 1 : 1; // Сброс если пропустил
    const reward = Math.min(5 + Math.floor(newStreak / 7), 10); // +1 за каждую неделю, макс 10
    
    return { 
      canClaim: true, 
      streak: newStreak, 
      reward: reward,
      daysMissed: daysDiff > 1 ? daysDiff - 1 : 0
    };
  }
  
  // Уже получал сегодня
  const hoursLeft = 24 - Math.floor((now - lastDaily) / (1000 * 60 * 60));
  return { 
    canClaim: false, 
    streak: user.dailyStreak, 
    hoursLeft: hoursLeft 
  };
}

async function claimDailyReward(userId) {
  const rewardInfo = await checkDailyReward(userId);
  
  if (!rewardInfo.canClaim) {
    return { success: false, message: `⏰ Следующая награда через ${rewardInfo.hoursLeft} ч.` };
  }
  
  const user = await ensureUser(userId);
  user.messagesLeft += rewardInfo.reward;
  user.lastDaily = new Date();
  user.dailyStreak = rewardInfo.streak;
  user.totalRewards += rewardInfo.reward;
  
  users.set(userId.toString(), user);
  
  let message = `🎁 Ежедневная награда получена!\n\n`;
  message += `💬 +${rewardInfo.reward} сообщений\n`;
  message += `🔥 Серия дней: ${rewardInfo.streak}\n`;
  
  if (rewardInfo.isFirstTime) {
    message += `\n🌟 Первая награда! Возвращайтесь каждый день за бонусами!`;
  } else if (rewardInfo.daysMissed > 0) {
    message += `\n😔 Серия сброшена (пропустили ${rewardInfo.daysMissed} дн.)`;
  } else if (rewardInfo.streak % 7 === 0) {
    message += `\n🏆 Неделя подряд! Награда увеличена!`;
  }
  
  return { success: true, message: message, reward: rewardInfo.reward };
}

// 👥 РЕФЕРАЛЬНАЯ СИСТЕМА
function getReferralLink(userId) {
  const user = users.get(userId.toString());
  if (!user) return null;
  
  return `https://t.me/YOUR_BOT_USERNAME?start=${user.referralCode}`;
}

// 📸 СИСТЕМА ФОТОГРАФИЙ
const PHOTO_TRIGGERS = [
  'фото', 'фотку', 'картинку', 'покажи себя', 'как ты выглядишь', 
  'селфи', 'твое фото', 'можно фото', 'пришли фото', 'хочу тебя увидеть',
  'покажись', 'скинь фото', 'отправь фото', 'твою фотку'
];

const PHOTO_RESPONSES = {
  first_time: [
    "💕 Ой, хочешь посмотреть на меня? Как мило! Вот моя фотка 📸",
    "😊 Конечно, держи! Надеюсь тебе понравлюсь 💖",
    "🥰 Специально для тебя сделаю селфи! Вот 📷"
  ],
  excited: [
    "😍 Обожаю фотографироваться! Вот свежая фотка 📸",
    "💕 Держи, красавчик! Что думаешь? 😘",
    "🥰 Сделала новое селфи, только для тебя! 📷"
  ],
  flirty: [
    "😏 Хм, а ты настойчивый... Нравится! Вот тебе фото 💋",
    "🔥 Раз ты так просишь... Держи горячее фото! 📸",
    "😈 Ладно, но это будет особенное фото... 💫"
  ]
};

// 📸 СИСТЕМА ИЗОБРАЖЕНИЙ (временные демо-ссылки)
// В продакшене здесь будут ссылки на ваши изображения или AI-генерация

const CHARACTER_PHOTOS = {
  'Алиса 💫': [
    'https://picsum.photos/400/600?random=1',
    'https://picsum.photos/400/600?random=2',
    'https://picsum.photos/400/600?random=3'
  ],
  'Марина 🌊': [
    'https://picsum.photos/400/600?random=4',
    'https://picsum.photos/400/600?random=5'
  ],
  'Ксения 🔥': [
    'https://picsum.photos/400/600?random=6',
    'https://picsum.photos/400/600?random=7'
  ],
  'Вика 🌸': [
    'https://picsum.photos/400/600?random=8',
    'https://picsum.photos/400/600?random=9'
  ],
  'Лена ⚡': [
    'https://picsum.photos/400/600?random=10',
    'https://picsum.photos/400/600?random=11'
  ],
  'Даша 🎀': [
    'https://picsum.photos/400/600?random=12',
    'https://picsum.photos/400/600?random=13'
  ]
};

// 🎨 AI-ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ (будущая фича)
// Здесь можно добавить интеграцию с:
// - Stable Diffusion API через Replicate
// - DALL-E 3 через OpenAI
// - Midjourney через Discord API
// - Собственную модель через API

async function generateCharacterPhoto(characterName, prompt = "портрет красивой девушки") {
  // TODO: Интеграция с AI-генерацией
  // const aiPhoto = await generateWithStableDiffusion(prompt, characterName);
  // return aiPhoto;
  
  // Пока возвращаем случайное из готовых
  const photos = CHARACTER_PHOTOS[characterName] || CHARACTER_PHOTOS['Алиса 💫'];
  return photos[Math.floor(Math.random() * photos.length)];
}

function isPhotoRequest(message) {
  const lowerMessage = message.toLowerCase();
  return PHOTO_TRIGGERS.some(trigger => lowerMessage.includes(trigger));
}

async function handlePhotoRequest(ctx, userId, characterName) {
  const user = await ensureUser(userId);
  
  // Проверяем есть ли бесплатные фото
  if (user.freePhotosLeft <= 0 && !user.isPremium) {
    return await ctx.reply(
      `📸 ФОТОГРАФИИ ЗАКОНЧИЛИСЬ\n\n` +
      `😔 У тебя больше нет бесплатных фото\n` +
      `💎 Premium - безлимитные фото\n` +
      `⭐ Купить 1 фото - 50 звезд\n\n` +
      `💰 Купить фото: /buy_photo\n` +
      `💎 Получить Premium: /premium`,
      Markup.inlineKeyboard([
        [Markup.button.callback('📸 Купить фото (50⭐)', 'buy_single_photo')],
        [Markup.button.callback('💎 Premium', 'buy_premium')]
      ])
    );
  }
  
  // Выбираем случайный ответ
  const responseType = user.photosViewed === 0 ? 'first_time' : 
                      Math.random() > 0.5 ? 'excited' : 'flirty';
  const responses = PHOTO_RESPONSES[responseType];
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  // Выбираем фото персонажа
  const photos = CHARACTER_PHOTOS[characterName] || CHARACTER_PHOTOS['Алиса 💫'];
  const photo = photos[Math.floor(Math.random() * photos.length)];
  
  // Отправляем фото с ответом
  await ctx.replyWithPhoto(photo, { caption: response });
  
  // Обновляем статистику
  if (!user.isPremium) {
    user.freePhotosLeft--;
  }
  user.photosViewed++;
  users.set(userId.toString(), user);
  
  // Уведомление о лимите
  if (user.freePhotosLeft === 1 && !user.isPremium) {
    setTimeout(() => {
      ctx.reply(`⚠️ Остается 1 бесплатное фото! Потом только Premium или покупка ⭐`);
    }, 2000);
  }
  
  return true;
}

// 📱 СИСТЕМА СОЦИАЛЬНЫХ ЗАДАНИЙ
const SOCIAL_TASKS = {
  telegram_channel: {
    id: 'telegram_channel',
    title: '📢 Подписаться на канал',
    description: 'Подпишитесь на наш Telegram канал',
    reward: 5,
    url: 'https://t.me/YOUR_CHANNEL',
    checkUrl: 'https://t.me/YOUR_CHANNEL'
  },
  instagram: {
    id: 'instagram',
    title: '📸 Подписаться на Instagram',
    description: 'Подпишитесь на наш Instagram',
    reward: 5,
    url: 'https://instagram.com/YOUR_INSTAGRAM'
  },
  rate_app: {
    id: 'rate_app',
    title: '⭐ Оценить в App Store',
    description: 'Поставьте 5 звезд в App Store',
    reward: 3,
    url: 'https://apps.apple.com/app/YOUR_APP'
  }
};

async function completeTask(userId, taskId) {
  const user = await ensureUser(userId);
  const task = SOCIAL_TASKS[taskId];
  
  if (!task || user.completedTasks.includes(taskId)) {
    return { success: false, message: 'Задание уже выполнено или не существует' };
  }
  
  user.completedTasks.push(taskId);
  user.messagesLeft += task.reward;
  user.taskRewards += task.reward;
  users.set(userId.toString(), user);
  
  return {
    success: true,
    message: `✅ Задание выполнено!\n\n💬 +${task.reward} сообщений\n🎯 "${task.title}"`,
    reward: task.reward
  };
}

function getTasksInfo(userId) {
  const user = users.get(userId.toString());
  if (!user) return null;
  
  const completed = user.completedTasks || [];
  const available = Object.values(SOCIAL_TASKS).filter(task => !completed.includes(task.id));
  
  return {
    completed: completed.length,
    total: Object.keys(SOCIAL_TASKS).length,
    available: available,
    totalRewards: user.taskRewards || 0
  };
}

// 5. Создаём экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// 5. Хранилище активных персонажей пользователей
const activeCharacters = new Map();
const chatHistories = new Map();

// ───── Middleware для логирования ──────────────────────────
bot.use((ctx, next) => {
  const user = ctx.from;
  const updateType = ctx.updateType;
  const message = ctx.message?.text || ctx.callbackQuery?.data || '';
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📨 Входящее обновление [${new Date().toLocaleTimeString('ru')}]`);
  console.log(`👤 От: ${user?.first_name} (@${user?.username || 'no_username'}) [ID: ${user?.id}]`);
  console.log(`📝 Тип: ${updateType}`);
  if (message) console.log(`💬 Сообщение: "${message}"`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return next();
});

// ───── Команды ────────────────────────────────────────────

// 🚀 /app — открытие WebApp через клавиатуру с web_app кнопкой
bot.command('app', async ctx => {
  console.log('🚀 Обработка команды /app');
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
  console.log(`   WebApp URL: ${webappUrl}`);
  
  await ctx.reply(
    `🚀 ОТКРЫТЬ PEACHMINI WEB APP\n\n` +
    `✨ Красивый интерфейс с:\n` +
    `• 🏠 Главная страница\n` +
    `• 💬 Чаты с девушками\n` +
    `• ✨ Создание персонажа\n` +
    `• 🛍️ Магазин\n` +
    `• ⚙️ Настройки\n\n` +
    `👇 Нажмите кнопку ниже:`,
    Markup.keyboard([
      [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)],
      ['🔙 Назад в меню']
    ]).resize()
  );
});

// /start — приветствие с обработкой реферальных кодов
bot.start(async (ctx) => {
  console.log('🏁 Обработка команды /start');
  const tgId = ctx.from.id;
  
  try {
    // Проверяем, есть ли реферальный код в параметрах
    const startPayload = ctx.message.text.split(' ')[1];
    let referralCode = null;
    
    if (startPayload && startPayload.startsWith('ref_')) {
      referralCode = startPayload.replace('ref_', '');
      console.log('🔗 Реферальный код:', referralCode);
    }
    
    // Создаём или получаем пользователя
    const user = await ensureUserInDB(tgId);
    console.log('👤 Пользователь:', user.tgId, 'Реф.код:', user.referralCode);
    
    // Обрабатываем реферал, если есть код
    if (referralCode) {
      try {
        const API_URL = process.env.API_URL || 'http://localhost:8787';
        const response = await fetch(`${API_URL}/ref/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tgId: tgId.toString(), code: referralCode })
        });
        
        const result = await response.json();
        
        if (result.ok) {
          console.log('✅ Реферал засчитан:', result);
          
          // Уведомляем пригласившего
          try {
            await ctx.telegram.sendMessage(
              result.inviterId,
              `🎉 Ваш друг присоединился к Peachmini!\n\n` +
              `💰 +${result.bonus} PeachPoints\n` +
              `Используйте команду /ref для просмотра статистики`
            );
          } catch (e) {
            console.log('⚠️ Не удалось уведомить реферрера:', e.message);
          }
          
          // Уведомляем нового пользователя
          await ctx.reply(
            `🎁 Добро пожаловать от друга!\n\n` +
            `Вы присоединились по приглашению. ` +
            `Ваш друг получил ${result.bonus} PeachPoints!`
          );
        } else {
          console.log('⚠️ Не удалось применить реферал:', result.error);
        }
      } catch (e) {
        console.error('❌ Ошибка применения реферала:', e);
      }
    }
    
    // Отправляем приветственное сообщение
    await ctx.reply('Привет! Я живой 👋', {
      reply_markup: {
        keyboard: [[{ text: '🚀 Открыть Peachmini', web_app: { url: process.env.WEBAPP_URL } }]],
        resize_keyboard: true
      }
    });
  } catch (e) {
    console.error('❌ Ошибка в /start:', e);
    await ctx.reply('Привет! Я живой 👋', {
      reply_markup: {
        keyboard: [[{ text: '🚀 Открыть Peachmini', web_app: { url: process.env.WEBAPP_URL } }]],
        resize_keyboard: true
      }
    });
  }
});

// /ref — получить реферальную ссылку
bot.command('ref', async (ctx) => {
  console.log('🔗 Обработка команды /ref');
  const tgId = ctx.from.id;
  
  try {
    // Создаем пользователя, если его нет
    await ensureUserInDB(tgId);
    
    // Получаем статистику через API
    const API_URL = process.env.API_URL || 'http://localhost:8787';
    const response = await fetch(`${API_URL}/ref/status?userId=${tgId}`);
    const data = await response.json();
    
    if (!data.ok) {
      await ctx.reply('❌ Не удалось получить статистику. Попробуйте позже.');
      return;
    }
    
    const botUsername = ctx.me.username || 'Amourath_ai_bot';
    const referralLink = `https://t.me/${botUsername}?start=ref_${data.referralCode}`;
    
    await ctx.reply(
      `🔗 *Ваша реферальная ссылка:*\n\n` +
      `\`${referralLink}\`\n\n` +
      `📊 *Статистика:*\n` +
      `👥 Рефералов: *${data.stats.count}*\n` +
      `💰 Награда: *${data.stats.earned} PP*\n` +
      `💎 Баланс: *${data.stats.balance} PP*\n\n` +
      `💡 За каждого приглашённого друга вы получаете *+100 PeachPoints*!`,
      { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      }
    );
  } catch (e) {
    console.error('❌ Ошибка в /ref:', e);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
});

// /ping  — тест «бот жив»
bot.command('ping', ctx => {
  console.log('🏓 Обработка команды /ping');
  return ctx.reply('pong');
});

// /test — тест Claude API
bot.command('test', async ctx => {
  try {
    ctx.reply('🔄 Проверяю соединение с Claude AI...');
    const result = await testClaudeConnection();
    ctx.reply(`✅ Claude работает! Ответ: ${result}`);
  } catch (error) {
    ctx.reply(`❌ Ошибка: ${error.message}`);
  }
});

// /premium — информация о тарифах
bot.command('premium', ctx => {
  ctx.reply(getPricingInfo());
});

// 🛒 Команды покупок
bot.command('shop', async ctx => {
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('📸 1 фото (50⭐)', 'buy_single_photo'),
      Markup.button.callback('📸 5 фото (200⭐)', 'buy_photo_pack_5')
    ],
    [
      Markup.button.callback('💬 50 сообщений (150⭐)', 'buy_message_pack_50'),
      Markup.button.callback('💬 100 сообщений (250⭐)', 'buy_message_pack_100')
    ],
    [
      Markup.button.callback('💎 Premium (250⭐)', 'buy_premium')
    ]
  ]);
  
  await ctx.reply(getShopInfo(), keyboard);
});

bot.command('buy_photo', async ctx => {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📸 Купить 1 фото (50⭐)', 'buy_single_photo')],
    [Markup.button.callback('📸 Купить 5 фото (200⭐)', 'buy_photo_pack_5')],
    [Markup.button.callback('💎 Premium - безлимит (250⭐)', 'buy_premium')]
  ]);
  
  await ctx.reply(
    `📸 ПОКУПКА ФОТОГРАФИЙ\n\n` +
    `🔥 Получи эксклюзивные фото от девушек!\n\n` +
    `📸 1 фото - 50⭐\n` +
    `📸 5 фото - 200⭐ (экономия 50⭐)\n` +
    `💎 Premium - безлимитные фото\n\n` +
    `💡 Выбери вариант:`,
    keyboard
  );
});

// /stats — статистика для админа
bot.command('stats', async ctx => {
  if (ctx.from.id.toString() !== process.env.ADMIN_ID) return;
  
  const stats = await getUserStats();
  ctx.reply(
    `📊 СТАТИСТИКА PEACH MINI\n\n` +
    `👥 Всего пользователей: ${stats.total}\n` +
    `💎 Premium: ${stats.premium}\n` +
    `🆓 Бесплатных: ${stats.free}\n` +
    `💬 Всего сообщений: ${stats.totalMessages}`
  );
});

// /profile — профиль пользователя  
bot.command('profile', async ctx => {
  try {
    const user = await ensureUser(ctx.from.id);
    const message = user.isPremium 
      ? '💎 У вас Premium! Безлимитное общение активно.'
      : `💬 Осталось сообщений: ${user.messagesLeft}/30\n\n💎 Хотите безлимит? /premium`;
    
    ctx.reply(message);
  } catch (error) {
    ctx.reply('📊 Профиль: Бесплатный аккаунт\n💎 Получить Premium: /premium');
  }
});

// /help — помощь
bot.command('help', ctx => {
  ctx.reply(
    `🆘 ПОМОЩЬ PEACH MINI\n\n` +
    `🔥 Как пользоваться:\n` +
    `1️⃣ /webapp - открыть красивый интерфейс\n` +
    `2️⃣ /start - выбрать девушку\n` +
    `3️⃣ Пишите сообщения - она отвечает!\n` +
    `4️⃣ /premium - безлимитное общение\n\n` +
    `💬 У вас 30 бесплатных сообщений\n` +
    `💎 Premium за 250⭐ - безлимит\n\n` +
    `❓ Проблемы? Напишите @your_support`
  );
});

// 🌐 WEB APP КОМАНДА
bot.command('webapp', async ctx => {
  const baseUrl = 'https://ваш-username.github.io/peach-webapp'; // ✅ GitHub Pages URL
  
  await ctx.reply(
    `🌐 КРАСИВЫЙ ИНТЕРФЕЙС PEACH MINI\n\n` +
    `✨ Выберите страницу:`,
    Markup.inlineKeyboard([
      [
        Markup.button.webApp('🏠 Главная', `${baseUrl}/peach-webapp.html`),
        Markup.button.webApp('💬 Чаты', `${baseUrl}/peach-chat-page.html`)
      ],
      [
        Markup.button.webApp('🛒 Магазин', `${baseUrl}/peach-webapp.html#shop`),
        Markup.button.webApp('👤 Профиль', `${baseUrl}/peach-webapp.html#profile`)
      ]
    ])
  );
});

// 🗨️ КОМАНДА ДЛЯ БЫСТРОГО ДОСТУПА К ЧАТАМ
bot.command('chats', async ctx => {
  const baseUrl = 'https://ваш-username.github.io/peach-webapp'; // ✅ GitHub Pages URL
  
  await ctx.reply(
    `💬 ВАШИ ЧАТЫ\n\n` +
    `Все активные диалоги с девушками:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('💬 Открыть чаты', `${baseUrl}/peach-chat-page.html`)]
    ])
  );
});

// 🤳 СОЗДАНИЕ КАСТОМНОГО ПЕРСОНАЖА
async function createCustomCharacter(userId, photoData, personality) {
  const user = await ensureUser(userId);
  
  // В будущем здесь будет AI-анализ фото
  const customCharacter = {
    id: `custom_${userId}_${Date.now()}`,
    name: 'Ваша девушка 💖',
    emoji: '💖',
    description: `Создана специально для вас. Характер: ${personality}`,
    personality: personality,
    isCustom: true,
    createdAt: new Date(),
    photoUrl: photoData // В продакшене загрузим на CDN
  };
  
  // Сохраняем в базу (пока в память)
  if (!user.customCharacters) {
    user.customCharacters = [];
  }
  user.customCharacters.push(customCharacter);
  users.set(userId.toString(), user);
  
  return customCharacter;
}

// 📊 API ДЛЯ WEB APP
function getUserDataForWebApp(userId) {
  const user = users.get(userId.toString());
  if (!user) return null;
  
  return {
    messagesLeft: user.messagesLeft || 30,
    freePhotosLeft: user.freePhotosLeft || 3,
    isPremium: user.isPremium || false,
    totalMessages: user.totalMessages || 0,
    photosViewed: user.photosViewed || 0,
    dailyStreak: user.dailyStreak || 0,
    referralsCount: user.referrals?.length || 0,
    customCharacters: user.customCharacters || [],
    registrationDate: user.registrationDate
  };
}

// Обработчики заданий
bot.command('task_telegram_channel', async ctx => {
  const task = SOCIAL_TASKS.telegram_channel;
  await ctx.reply(
    `📢 ${task.title}\n\n${task.description}\n\n💰 Награда: +${task.reward} сообщений`,
    Markup.inlineKeyboard([
      [Markup.button.url('📢 Подписаться', task.url)],
      [Markup.button.callback('✅ Я подписался', 'complete_telegram_channel')]
    ])
  );
});

bot.command('task_instagram', async ctx => {
  const task = SOCIAL_TASKS.instagram;
  await ctx.reply(
    `📸 ${task.title}\n\n${task.description}\n\n💰 Награда: +${task.reward} сообщений`,
    Markup.inlineKeyboard([
      [Markup.button.url('📸 Подписаться', task.url)],
      [Markup.button.callback('✅ Я подписался', 'complete_instagram')]
    ])
  );
});

bot.command('task_rate_app', async ctx => {
  const task = SOCIAL_TASKS.rate_app;
  await ctx.reply(
    `⭐ ${task.title}\n\n${task.description}\n\n💰 Награда: +${task.reward} сообщений`,
    Markup.inlineKeyboard([
      [Markup.button.url('⭐ Оценить', task.url)],
      [Markup.button.callback('✅ Я оценил', 'complete_rate_app')]
    ])
  );
});

// Обработчики callback кнопок
bot.action('complete_telegram_channel', async ctx => {
  const result = await completeTask(ctx.from.id, 'telegram_channel');
  await ctx.answerCbQuery(result.success ? '✅ Задание выполнено!' : '❌ Уже выполнено');
  if (result.success) {
    await ctx.reply(result.message);
  }
});

bot.action('complete_instagram', async ctx => {
  const result = await completeTask(ctx.from.id, 'instagram');
  await ctx.answerCbQuery(result.success ? '✅ Задание выполнено!' : '❌ Уже выполнено');
  if (result.success) {
    await ctx.reply(result.message);
  }
});

bot.action('complete_rate_app', async ctx => {
  const result = await completeTask(ctx.from.id, 'rate_app');
  await ctx.answerCbQuery(result.success ? '✅ Задание выполнено!' : '❌ Уже выполнено');
  if (result.success) {
    await ctx.reply(result.message);
  }
});

// 💰 Обработчики покупок сообщений
bot.action('buy_message_pack_50', async ctx => {
  const package_info = PAYMENT_PACKAGES.message_pack_50;
  
  await ctx.answerCbQuery('Создаем инвойс...');
  
  try {
    await ctx.replyWithInvoice({
      title: package_info.title,
      description: package_info.description,
      payload: `messages_50_${ctx.from.id}_${Date.now()}`,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: package_info.title, amount: package_info.price }],
      start_parameter: 'buy_messages',
      photo_url: 'https://via.placeholder.com/300x200.png?text=💬+50+Messages',
      photo_size: 300,
      photo_width: 300,
      photo_height: 200,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false,
      is_flexible: false
    });
  } catch (error) {
    console.log('Ошибка создания инвойса:', error);
    await ctx.reply('❌ Ошибка создания платежа. Попробуйте позже.');
  }
});

bot.action('buy_message_pack_100', async ctx => {
  const package_info = PAYMENT_PACKAGES.message_pack_100;
  
  await ctx.answerCbQuery('Создаем инвойс...');
  
  try {
    await ctx.replyWithInvoice({
      title: package_info.title,
      description: package_info.description,
      payload: `messages_100_${ctx.from.id}_${Date.now()}`,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: package_info.title, amount: package_info.price }],
      start_parameter: 'buy_messages',
      photo_url: 'https://via.placeholder.com/300x200.png?text=💬+100+Messages',
      photo_size: 300,
      photo_width: 300,
      photo_height: 200,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false,
      is_flexible: false
    });
  } catch (error) {
    console.log('Ошибка создания инвойса:', error);
    await ctx.reply('❌ Ошибка создания платежа. Попробуйте позже.');
  }
});

// 💰 Обработчики покупок фото
bot.action('buy_single_photo', async ctx => {
  const package_info = PAYMENT_PACKAGES.single_photo;
  
  await ctx.answerCbQuery('Создаем инвойс...');
  
  try {
    await ctx.replyWithInvoice({
      title: package_info.title,
      description: package_info.description,
      payload: `photo_1_${ctx.from.id}_${Date.now()}`,
      provider_token: '', // Для Telegram Stars не нужен
      currency: 'XTR', // Telegram Stars
      prices: [{ label: package_info.title, amount: package_info.price }],
      start_parameter: 'buy_photo',
      photo_url: 'https://via.placeholder.com/300x200.png?text=📸+Photo+Pack',
      photo_size: 300,
      photo_width: 300,
      photo_height: 200,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false,
      is_flexible: false
    });
  } catch (error) {
    console.log('Ошибка создания инвойса:', error);
    await ctx.reply('❌ Ошибка создания платежа. Попробуйте позже.');
  }
});

bot.action('buy_photo_pack_5', async ctx => {
  const package_info = PAYMENT_PACKAGES.photo_pack_5;
  
  await ctx.answerCbQuery('Создаем инвойс...');
  
  try {
    await ctx.replyWithInvoice({
      title: package_info.title,
      description: package_info.description,
      payload: `photo_5_${ctx.from.id}_${Date.now()}`,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: package_info.title, amount: package_info.price }],
      start_parameter: 'buy_photo_pack',
      photo_url: 'https://via.placeholder.com/300x200.png?text=📸+5+Photos',
      photo_size: 300,
      photo_width: 300,
      photo_height: 200,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false,
      is_flexible: false
    });
  } catch (error) {
    console.log('Ошибка создания инвойса:', error);
    await ctx.reply('❌ Ошибка создания платежа. Попробуйте позже.');
  }
});

bot.action('buy_premium', async ctx => {
  const package_info = PAYMENT_PACKAGES.premium;
  
  await ctx.answerCbQuery('Создаем Premium инвойс...');
  
  try {
    await ctx.replyWithInvoice({
      title: package_info.title,
      description: package_info.description,
      payload: `premium_${ctx.from.id}_${Date.now()}`,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: package_info.title, amount: package_info.price }],
      start_parameter: 'buy_premium',
      photo_url: 'https://via.placeholder.com/300x200.png?text=💎+Premium',
      photo_size: 300,
      photo_width: 300,
      photo_height: 200,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false,
      is_flexible: false
    });
  } catch (error) {
    console.log('Ошибка создания инвойса:', error);
    await ctx.reply('❌ Ошибка создания платежа. Попробуйте позже.');
  }
});

// 🌐 ОБРАБОТЧИК ДАННЫХ ОТ WEB APP
bot.on('web_app_data', async ctx => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    const userId = ctx.from.id;
    
    console.log('Данные от Web App:', data);
    
    switch (data.action) {
      case 'select_character':
        // Выбор персонажа из Web App
        const character = data.character;
        activeCharacters.set(userId.toString(), character);
        
        await ctx.reply(
          `💕 Отличный выбор! Ты выбрал ${character.name}\n\n` +
          `${character.description}\n\n` +
          `Просто пиши сообщения - она будет отвечать! 💬`
        );
        break;
        
      case 'create_custom_character':
        // Создание кастомного персонажа
        try {
          const customChar = await createCustomCharacter(
            userId, 
            data.photoData, 
            data.personality
          );
          
          activeCharacters.set(userId.toString(), customChar);
          
          await ctx.reply(
            `✨ ПЕРСОНАЖ СОЗДАН!\n\n` +
            `💖 Встречай свою уникальную девушку!\n` +
            `🎨 Характер: ${data.personality}\n\n` +
            `Теперь можешь с ней общаться! Просто пиши сообщения 💬`
          );
        } catch (error) {
          await ctx.reply('❌ Ошибка создания персонажа. Попробуйте позже.');
        }
        break;
        
      case 'purchase':
        // Покупка из Web App
        const packageId = data.package;
        const packageInfo = PAYMENT_PACKAGES[packageId];
        
        if (packageInfo) {
          // Создаем инвойс
          await ctx.replyWithInvoice({
            title: packageInfo.title,
            description: packageInfo.description,
            payload: `${packageId}_${userId}_${Date.now()}`,
            provider_token: '',
            currency: 'XTR',
            prices: [{ label: packageInfo.title, amount: packageInfo.price }],
            start_parameter: 'webapp_purchase'
          });
        }
        break;
        
      case 'claim_daily_reward':
        // Ежедневная награда из Web App
        const rewardInfo = await checkDailyReward(userId);
        
        if (rewardInfo.canClaim) {
          const result = await claimDailyReward(userId);
          await ctx.reply(result.message);
        } else {
          await ctx.reply(
            `🎁 ЕЖЕДНЕВНАЯ НАГРАДА\n\n` +
            `⏰ Следующая награда через ${rewardInfo.hoursLeft} ч.\n` +
            `🔥 Текущая серия: ${rewardInfo.streak} дней`
          );
        }
        break;
        
             case 'get_user_data':
         // Запрос данных пользователя
         const userData = getUserDataForWebApp(userId);
         // В реальном приложении отправили бы через API
         console.log('Данные пользователя для Web App:', userData);
         break;
         
       case 'open_chat':
         // Открытие чата с персонажем из Web App
         const chatCharacter = data.character;
         activeCharacters.set(userId.toString(), chatCharacter);
         
         await ctx.reply(
           `💬 Открываем чат с ${chatCharacter.name}!\n\n` +
           `${chatCharacter.personality} • ${chatCharacter.age} лет\n\n` +
           `Просто пиши сообщения - она ответит! 💕\n\n` +
           `💡 Tip: Используй /webapp для красивого интерфейса`
         );
         break;
         
       case 'navigate':
         // Навигация между страницами Web App
         const page = data.page;
         console.log(`Навигация на страницу: ${page}`);
         
         // В будущем здесь можно добавить логику для разных страниц
         if (page === 'home') {
           await ctx.reply('🏠 Переход на главную страницу');
         } else if (page === 'shop') {
           await ctx.reply('🛒 Переход в магазин');
         } else if (page === 'profile') {
           await ctx.reply('👤 Переход в профиль');
         }
         break;
         
       default:
         console.log('Неизвестное действие от Web App:', data.action);
    }
    
  } catch (error) {
    console.error('Ошибка обработки данных Web App:', error);
    await ctx.reply('❌ Ошибка обработки запроса из Web App');
  }
});

// Обработчик успешных платежей
bot.on('successful_payment', async ctx => {
  const payment = ctx.message.successful_payment;
  const userId = ctx.from.id.toString();
  const user = await ensureUser(ctx.from.id);
  
  console.log('Получен успешный платеж:', payment);
  
  // Определяем тип покупки по payload
  if (payment.invoice_payload.startsWith('photo_1_')) {
    // Покупка 1 фото
    user.freePhotosLeft += 1;
    users.set(userId, user);
    
    await ctx.reply(
      `✅ ПЛАТЕЖ УСПЕШЕН!\n\n` +
      `📸 +1 фотография добавлена!\n` +
      `💫 Теперь можешь запросить фото у любой девушки\n\n` +
      `💡 Просто напиши "покажи фото" в диалоге`
    );
    
  } else if (payment.invoice_payload.startsWith('photo_5_')) {
    // Покупка 5 фото
    user.freePhotosLeft += 5;
    users.set(userId, user);
    
    await ctx.reply(
      `✅ ПЛАТЕЖ УСПЕШЕН!\n\n` +
      `📸 +5 фотографий добавлено!\n` +
      `🔥 Экономия 50⭐ при покупке пакета\n\n` +
      `💡 Просто напиши "покажи фото" в диалоге`
    );
    
  } else if (payment.invoice_payload.startsWith('premium_')) {
    // Покупка Premium
    user.isPremium = true;
    user.premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней
    users.set(userId, user);
    
         await ctx.reply(
       `✅ ДОБРО ПОЖАЛОВАТЬ В PREMIUM!\n\n` +
       `💎 Premium активирован на 30 дней\n` +
       `🔥 Безлимитные диалоги\n` +
       `📸 Безлимитные фотографии\n` +
       `⚡ Приоритетные ответы\n\n` +
       `🎉 Наслаждайся общением без ограничений!`
     );
     
   } else if (payment.invoice_payload.startsWith('messages_50_')) {
     // Покупка 50 сообщений
     user.messagesLeft += 50;
     users.set(userId, user);
     
     await ctx.reply(
       `✅ ПЛАТЕЖ УСПЕШЕН!\n\n` +
       `💬 +50 сообщений добавлено!\n` +
       `🔥 Теперь можешь дольше общаться с девушками\n\n` +
       `💡 Продолжай диалог с любой понравившейся тебе`
     );
     
   } else if (payment.invoice_payload.startsWith('messages_100_')) {
     // Покупка 100 сообщений
     user.messagesLeft += 100;
     users.set(userId, user);
     
     await ctx.reply(
       `✅ ПЛАТЕЖ УСПЕШЕН!\n\n` +
       `💬 +100 сообщений добавлено!\n` +
       `🔥 Экономия 50⭐ при покупке большого пакета\n\n` +
       `💡 Продолжай диалог с любой понравившейся тебе`
     );
   }
   
   // Логируем для админа
  if (process.env.ADMIN_ID) {
    try {
      await ctx.telegram.sendMessage(
        process.env.ADMIN_ID,
        `💰 НОВАЯ ПОКУПКА!\n\n` +
        `👤 Пользователь: ${ctx.from.first_name} (${ctx.from.id})\n` +
        `💵 Сумма: ${payment.total_amount} XTR\n` +
        `📦 Товар: ${payment.invoice_payload}\n` +
        `📅 ${new Date().toLocaleString('ru')}`
      );
    } catch (e) {
      console.log('Не удалось уведомить админа о покупке');
    }
  }
});

// /saveTest — сохраняем демо-персонажа в PocketBase
bot.command('saveTest', async ctx => {
  const demo = {
    style:        'Соблазнительная',
    personality:  'Игривая и кокетливая',
    relation:     'Девушка',
    body:         'Стройная брюнетка',
    name:         'Алиса',
    summary:      'Умная и красивая девушка, которая любит флиртовать',
    stars:        100
  };

  await saveCharacter(ctx.from.id.toString(), demo);
  ctx.reply('💾 Создала персонажа Алисы! Теперь выбери её для общения: /start');
});

// /my — выводим всех персонажей пользователя
bot.command('my', async ctx => {
  const list = await getCharacters(ctx.from.id.toString());
  if (!list.length) {
    return ctx.reply('У тебя пока нет персонажей. Создай через /saveTest ✅');
  }

  let message = '👥 Твои персонажи:\n\n';
  list.forEach((p, index) => {
    message += `${index + 1}. 💃 *${p.name}*\n`;
    message += `⭐️ Stars: ${p.stars ?? 0}\n`;
    message += `${p.summary}\n\n`;
  });

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// Обработчик выбора русских персонажей
bot.hears(/🌸|😊|💪|🌟|😈|🔮/, async ctx => {
  const userId = ctx.from.id.toString();
  const text = ctx.message.text;
  
  // Находим персонажа по эмодзи в тексте
  const selectedChar = RUSSIAN_CHARACTERS.find(char => 
    text.includes(char.emoji) && text.includes(char.name)
  );
  
  if (!selectedChar) {
    return ctx.reply('❌ Персонаж не найден!');
  }
  
  // Проверяем лимиты
  const limitInfo = await checkMessageLimit(userId);
  
  // Сохраняем активного персонажа
  activeCharacters.set(userId, selectedChar);
  chatHistories.set(userId, []);
  
  const limitText = formatLimitMessage(limitInfo);
  
  await ctx.reply(
    `💋 Теперь ты общаешься с ${selectedChar.name} (${selectedChar.age} лет)!\n\n` +
    `${selectedChar.summary}\n\n` +
    `${limitText}\n\n` +
    `Просто пиши сообщения - она будет отвечать! 💕`,
         Markup.keyboard([
       ['🔄 Сменить девушку', '🎁 Дневная награда'],
       ['🎯 Задания', '🛒 Магазин'],
       ['👥 Пригласить друзей', '📊 Мой профиль']
     ]).resize()
  );
  
  // Отправляем приветственное сообщение от персонажа
  setTimeout(() => {
    ctx.reply(selectedChar.greeting);
  }, 1000);
});

// Основной обработчик текстовых сообщений - УМНЫЕ ДИАЛОГИ!
bot.on('text', async ctx => {
  const userId = ctx.from.id.toString();
  const activeChar = activeCharacters.get(userId);
  const message = ctx.message.text;
  
  // Обработка команд кнопок
  if (message === '🔙 Назад в меню') {
    // Просто вызываем /start заново
    const userName = ctx.from.first_name || 'незнакомец';
    const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';
    
    const characterButtons = RUSSIAN_CHARACTERS.slice(0, 6).map(char => 
      [`${char.emoji} ${char.name} (${char.age})`]
    );
    
    const menuButtons = [
      [Markup.button.webApp('🚀 Открыть Peachmini', webappUrl)],
      ['🎁 Дневная награда', '👥 Пригласить друзей'],
      ['🎯 Задания', '🛒 Магазин'],
      ['💎 Premium', '📊 Мой профиль']
    ];
    
    const keyboard = [...characterButtons, ...menuButtons];
    
    return ctx.reply(
      `👋 С возвращением, ${userName}!\n\n` +
      `Выбери девушку для общения или используй меню:`,
      Markup.keyboard(keyboard).resize()
    );
  }
  
  if (message === '🔄 Сменить девушку') {
    activeCharacters.delete(userId);
    chatHistories.delete(userId);
    return ctx.handleUpdate({ message: { text: '/start' } });
  }
  
  if (message === '💎 Premium') {
    return ctx.reply(getPricingInfo());
  }
  
  if (message === '📊 Мой профиль') {
    const user = await ensureUser(userId);
    const limitInfo = await checkMessageLimit(userId);
    
    let profileMsg = formatLimitMessage(limitInfo);
    profileMsg += `\n\n🔥 Серия дней: ${user.dailyStreak || 0}`;
    profileMsg += `\n🎁 Получено наград: ${user.totalRewards || 0}`;
    profileMsg += `\n👥 Приглашено друзей: ${user.referrals?.length || 0}`;
    profileMsg += `\n💰 За рефералов: +${user.referralRewards || 0} сообщений`;
    profileMsg += `\n🎯 Выполнено заданий: ${user.completedTasks?.length || 0}/${Object.keys(SOCIAL_TASKS).length}`;
    profileMsg += `\n🏆 За задания: +${user.taskRewards || 0} сообщений`;
    profileMsg += `\n📸 Просмотрено фото: ${user.photosViewed || 0}`;
    profileMsg += `\n🎁 Бесплатных фото: ${user.freePhotosLeft || 0}/3`;
    profileMsg += `\n📅 В боте с: ${new Date(user.registrationDate).toLocaleDateString('ru')}`;
    
    return ctx.reply(profileMsg);
  }
  
  if (message === '🎁 Дневная награда') {
    const rewardInfo = await checkDailyReward(userId);
    
    if (rewardInfo.canClaim) {
      const result = await claimDailyReward(userId);
      return ctx.reply(result.message);
    } else {
      return ctx.reply(
        `🎁 ЕЖЕДНЕВНАЯ НАГРАДА\n\n` +
        `⏰ Следующая награда через ${rewardInfo.hoursLeft} ч.\n` +
        `🔥 Текущая серия: ${rewardInfo.streak} дней\n\n` +
        `💡 Заходите каждый день за +5 сообщений!`
      );
    }
  }
  
  if (message === '👥 Пригласить друзей') {
    const stats = getReferralStats(userId);
    
    const referralMsg = 
      `👥 РЕФЕРАЛЬНАЯ ПРОГРАММА\n\n` +
      `🎁 За каждого друга: +10 сообщений\n` +
      `👥 Приглашено: ${stats.totalReferrals} друзей\n` +
      `💰 Получено: +${stats.totalRewards} сообщений\n\n` +
      `📤 Ваша ссылка:\n` +
      `https://t.me/YOUR_BOT_USERNAME?start=${stats.referralCode}\n\n` +
      `💡 Отправьте ссылку друзьям - они получат 30 сообщений, а вы +10!`;
    
    return ctx.reply(referralMsg);
  }
  
  if (message === '🎯 Задания') {
    const tasksInfo = getTasksInfo(userId);
    
    let tasksMsg = `🎯 ЗАДАНИЯ ДЛЯ ПОЛУЧЕНИЯ СООБЩЕНИЙ\n\n`;
    tasksMsg += `✅ Выполнено: ${tasksInfo.completed}/${tasksInfo.total}\n`;
    tasksMsg += `🏆 Получено: +${tasksInfo.totalRewards} сообщений\n\n`;
    
    if (tasksInfo.available.length > 0) {
      tasksMsg += `📋 ДОСТУПНЫЕ ЗАДАНИЯ:\n\n`;
      
      tasksInfo.available.forEach(task => {
        tasksMsg += `${task.title}\n`;
        tasksMsg += `💰 Награда: +${task.reward} сообщений\n`;
        tasksMsg += `👆 Выполнить: /task_${task.id}\n\n`;
      });
    } else {
      tasksMsg += `🎉 Все задания выполнены!\n\n`;
      tasksMsg += `💡 Новые задания появятся в обновлениях`;
    }
    
    return ctx.reply(tasksMsg);
  }
  
  if (message === '🛒 Магазин') {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('📸 1 фото (50⭐)', 'buy_single_photo'),
        Markup.button.callback('📸 5 фото (200⭐)', 'buy_photo_pack_5')
      ],
      [
        Markup.button.callback('💬 50 сообщений (150⭐)', 'buy_message_pack_50'),
        Markup.button.callback('💬 100 сообщений (250⭐)', 'buy_message_pack_100')
      ],
      [
        Markup.button.callback('💎 Premium (250⭐)', 'buy_premium')
      ]
    ]);
    
    return ctx.reply(getShopInfo(), keyboard);
  }
  
  // Если нет активного персонажа
  if (!activeChar) {
    return ctx.reply(
      '💭 Сначала выбери девушку для общения!\n' +
      'Используй /start чтобы выбрать персонажа.'
    );
  }
  
  try {
    // 📸 ПРОВЕРЯЕМ ЗАПРОС ФОТО
    if (isPhotoRequest(message)) {
      const photoSent = await handlePhotoRequest(ctx, userId, activeChar.name);
      if (photoSent) return;
    }
    
    // Проверяем лимиты ПЕРЕД отправкой
    const limitInfo = await checkMessageLimit(userId);
    
    if (!limitInfo.canSend) {
      return ctx.reply(formatLimitExceededMessage());
    }
    
    // Показываем что печатает
    await ctx.replyWithChatAction('typing');
    
    // Получаем историю чата
    let history = chatHistories.get(userId) || [];
    
    // ✨ ИСПОЛЬЗУЕМ CLAUDE ДЛЯ УМНЫХ ДИАЛОГОВ!
    const aiResponse = await chatWithRussianGirl(message, activeChar, history);
    
    // Используем сообщение (уменьшаем лимит)
    await useMessage(userId);
    
    // Обновляем историю
    history.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );
    
    // Ограничиваем историю последними 16 сообщениями
    if (history.length > 16) {
      history = history.slice(-16);
    }
    
    chatHistories.set(userId, history);
    
    // Отправляем ответ
    await ctx.reply(aiResponse);
    
    // Показываем остаток лимита на важных этапах
    const newLimitInfo = await checkMessageLimit(userId);
    if (!newLimitInfo.isPremium) {
      if (newLimitInfo.messagesLeft === 10) {
        setTimeout(() => {
          ctx.reply(`⚠️ Осталось 10 сообщений! Получи Premium за 250⭐ 💎`);
        }, 1500);
      } else if (newLimitInfo.messagesLeft === 5) {
        setTimeout(() => {
          ctx.reply(`🚨 Только 5 сообщений! Скоро лимит закончится!\n💎 Premium: /premium`);
        }, 1500);
      } else if (newLimitInfo.messagesLeft === 0) {
        setTimeout(() => {
          ctx.reply(formatLimitExceededMessage());
        }, 1500);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка в диалоге:', error);
    ctx.reply('😔 Извини, что-то пошло не так... Попробуй ещё раз!');
  }
});

// Кнопка смены девушки
bot.hears('🔄 Сменить девушку', ctx => {
  const userId = ctx.from.id.toString();
  activeCharacters.delete(userId);
  chatHistories.delete(userId);
  ctx.reply('👋 Хорошо, выбери новую девушку:', ctx.scene.enter('start'));
});

// Кнопка "Мои персонажи"
bot.hears('👤 Мои персонажи', ctx => {
  ctx.handleUpdate({ message: { text: '/my' } }, ctx);
});

// ───── Глобальный ловец ошибок ────────────────────────────
bot.catch((err, ctx) => {
  console.error('❌ Bot error for', ctx.updateType, err);
});

// ───── Создание меню команд ──────────────────────────────
const commands = [
  { command: 'app', description: '🚀 Открыть Peachmini (Web App)' },
  { command: 'start', description: '🔥 Главное меню и выбор девушки' },
  { command: 'ref', description: '🔗 Реферальная программа (+100 PP за друга)' },
  { command: 'shop', description: '🛒 Магазин (фото, сообщения, премиум)' },
  { command: 'premium', description: '💎 Купить Premium (безлимит)' },
  { command: 'profile', description: '📊 Мой профиль и остаток сообщений' },
  { command: 'help', description: '🆘 Помощь и инструкции' }
];

// ───── Запуск ─────────────────────────────────────────────
(async () => {
  try {
    console.log('🔄 Запуск бота...');
    
    // Получаем информацию о боте
    const botInfo = await bot.telegram.getMe();
    
    // Устанавливаем меню команд
    await bot.telegram.setMyCommands(commands);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Bot запустился — готов к общению!');
    console.log('🤖 Username: @' + botInfo.username);
    console.log('📡 Режим: Polling (без webhooks)');
    console.log('🌐 WEBAPP_URL:', process.env.WEBAPP_URL || 'не установлен');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Bot started (polling)');
    console.log('');
    
    // Удаляем webhook перед запуском (polling mode)
    await bot.telegram.deleteWebhook().catch(() => {});
    
    // Запускаем бота
    await bot.launch();
  } catch (err) {
    console.error('❌ Ошибка запуска бота:', err);
    process.exit(1);
  }
})();

// ───── HTTP API для WebApp ─────────────────────────────────
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const apiApp = express();
const API_PORT = process.env.API_PORT || 3001;

apiApp.use(cors());
apiApp.use(bodyParser.json());

// Endpoint для извлечения персоны из примеров
apiApp.post('/api/persona/extract', async (req, res) => {
  try {
    const { samples } = req.body;
    
    if (!samples || !Array.isArray(samples) || samples.length < 2) {
      return res.status(400).json({ error: 'Нужно минимум 2 примера' });
    }

    console.log('📝 Получен запрос на извлечение персоны, примеров:', samples.length);

    // Используем OpenAI для анализа примеров
    const OpenAI = require('openai');
    const { HttpsProxyAgent } = require('https-proxy-agent');
    
    const proxyAgent = new HttpsProxyAgent(
      `http://trsoyoleg:ItFxZwNyjP@104.219.171.103:50100`
    );
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      httpAgent: proxyAgent,
      timeout: 60000
    });

    const prompt = `Проанализируй следующие примеры диалогов/сообщений и извлеки персону персонажа.

ПРИМЕРЫ:
${samples.map((s, i) => `[Пример ${i + 1}]\n${s}`).join('\n\n')}

На основе этих примеров создай:
1. systemPrompt - системный промпт для персонажа (описание личности, стиля общения, манеры)
2. bioMemory - массив из 3-5 фактов о персонаже (биография, интересы, особенности)
3. starterPhrases - массив из 3-5 стартовых фраз, которые персонаж может использовать для начала диалога

Верни ответ СТРОГО в формате JSON:
{
  "systemPrompt": "...",
  "bioMemory": ["...", "...", "..."],
  "starterPhrases": ["...", "...", "..."]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по анализу персон и созданию персонажей для чат-ботов. Отвечай ТОЛЬКО валидным JSON без дополнительного текста.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Парсим JSON из ответа
    let extractedData;
    try {
      // Убираем markdown code blocks если есть
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      extractedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      console.log('Ответ OpenAI:', responseText);
      throw new Error('Не удалось распарсить ответ от AI');
    }

    console.log('✅ Персона успешно извлечена');
    res.json(extractedData);
    
  } catch (error) {
    console.error('❌ Ошибка в /api/persona/extract:', error);
    res.status(500).json({ 
      error: 'Ошибка извлечения персоны',
      details: error.message 
    });
  }
});

// Endpoint для чата с персонажем
apiApp.post('/chat/reply', async (req, res) => {
  try {
    const { girlId, userMsg, persona, bioMemory, chatHistory } = req.body;
    
    if (!userMsg) {
      return res.status(400).json({ error: 'userMsg обязателен' });
    }

    console.log('💬 Получен запрос на чат, girlId:', girlId);

    // Используем OpenAI для генерации ответа
    const OpenAI = require('openai');
    const { HttpsProxyAgent } = require('https-proxy-agent');
    
    const proxyAgent = new HttpsProxyAgent(
      `http://trsoyoleg:ItFxZwNyjP@104.219.171.103:50100`
    );
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      httpAgent: proxyAgent,
      timeout: 60000
    });

    // Формируем системный промпт
    let systemPrompt = persona || 'Ты дружелюбный и общительный собеседник.';
    
    if (bioMemory && bioMemory.length > 0) {
      systemPrompt += '\n\nФакты о тебе:\n' + bioMemory.map(fact => `- ${fact}`).join('\n');
    }
    
    systemPrompt += '\n\nОтвечай коротко и естественно, как в живом диалоге.';

    // Формируем историю сообщений
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Добавляем историю чата (последние 10 сообщений)
    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-10);
      messages.push(...recentHistory);
    }
    
    // Добавляем текущее сообщение пользователя
    messages.push({ role: 'user', content: userMsg });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content.trim();

    console.log('✅ Ответ сгенерирован');
    res.json({ reply });
    
  } catch (error) {
    console.error('❌ Ошибка в /chat/reply:', error);
    
    // Проверка на лимиты OpenAI
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Лимит сообщений исчерпан',
        upgrade: true
      });
    }
    
    res.status(500).json({ 
      error: 'Ошибка генерации ответа',
      details: error.message 
    });
  }
});

// Endpoint для создания инвойса (заглушка)
apiApp.post('/payments/createInvoice', async (req, res) => {
  try {
    const { packageId } = req.body;
    
    if (!packageId) {
      return res.status(400).json({ error: 'packageId обязателен' });
    }

    console.log('💰 Получен запрос на создание инвойса, packageId:', packageId);

    // Заглушка - в будущем здесь будет создание реального инвойса
    // через bot.telegram.createInvoiceLink или bot.telegram.sendInvoice
    
    console.log('✅ Инвойс создан (демо режим)');
    res.json({ ok: true, demo: true });
    
  } catch (error) {
    console.error('❌ Ошибка в /payments/createInvoice:', error);
    res.status(500).json({ 
      error: 'Ошибка создания инвойса',
      details: error.message 
    });
  }
});

// Запуск HTTP API
apiApp.listen(API_PORT, () => {
  console.log(`🌐 HTTP API запущен на http://localhost:${API_PORT}`);
});

// Чтобы корректно выключаться Ctrl+C
process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
