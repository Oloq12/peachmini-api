/************************************************************
 * AI-Girl Bot  v1.2  – OpenAI (gpt-3.5-turbo)
 ************************************************************/
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const PocketBase = require('pocketbase/cjs');
const { Configuration, OpenAIApi } = require('openai');

const FREE_LIMIT   = 30;                  // бесплатный лимит
const OPENAI_MODEL = 'gpt-3.5-turbo';     // сменишь на 'gpt-4o-mini', когда дадут доступ

/* ─── 1. init ───────────────────────────────────────────── */
const bot = new Telegraf(process.env.BOT_TOKEN);

// PocketBase
const pb = new PocketBase(process.env.PB_URL);
pb.autoCancellation(false);

// OpenAI
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_KEY })
);

/* ─── 2. helpers ────────────────────────────────────────── */
async function ensureUser(tgId) {
  try {
    return await pb.collection('users').getFirstListItem(`tgId=${tgId}`);
  } catch {
    return await pb.collection('users')
                   .create({ tgId, used: 0, isPremium:false, lastGirl:'' });
  }
}

/* ─── 3. /start ─────────────────────────────────────────── */
bot.start(ctx =>
  ctx.reply(
    `Привет! 👋 Нажми «💃 Мои девушки», выбери персонажа и общайся.\n`+
    `Бесплатно доступно ${FREE_LIMIT} сообщений, потом понадобится /premium.`,
    Markup.keyboard([['💃 Мои девушки']]).resize()
  )
);

/* ─── 4. список девушек ─────────────────────────────────── */
bot.hears('💃 Мои девушки', listGirls);
bot.command('my',          listGirls);

async function listGirls(ctx) {
  try {
    const girls = await pb.collection('girls').getFullList({ sort:'-stars' });
    if (!girls.length) return ctx.reply('Ещё нет ни одной девушки :(');

    const buttons = girls.map(g =>
      Markup.button.callback(`${g.name} ⭐${g.stars}`, `sel_${g.id}`));
    ctx.reply('Выбери персонажа:',
      Markup.inlineKeyboard(buttons, { columns:2 }));
  } catch (e) {
    console.error(e); ctx.reply('⚠️ Ошибка получения списка.');
  }
}

/* ─── 5. выбор девушки ─────────────────────────────────── */
bot.action(/sel_(.+)/, async ctx => {
  try {
    const charId = ctx.match[1];
    const girl   = await pb.collection('girls').getOne(charId);
    const user   = await ensureUser(ctx.from.id);

    await pb.collection('users').update(user.id, { lastGirl: charId });

    ctx.answerCbQuery();
    ctx.editMessageText(
      `✅ Ты выбрал *${girl.name}*. Пиши ей!`,
      { parse_mode:'Markdown' });
  } catch (e) {
    console.error(e); ctx.answerCbQuery('Не удалось выбрать персонажа');
  }
});

/* ─── 6. тестовый персонаж ─────────────────────────────── */
bot.command('saveTest', async ctx => {
  try {
    await pb.collection('girls').create({
      name:'Gandalf',
      persona:'A wise wandering wizard',
      stars:100
    });
    ctx.reply('💾 Сохранил тестового персонажа!');
  } catch (e) {
    console.error(e); ctx.reply('⚠️ Не удалось сохранить.');
  }
});

/* ─── 7. ping ──────────────────────────────────────────── */
bot.command('ping', ctx => ctx.reply('pong'));

/* ─── 8. сообщения ─────────────────────────────────────── */
bot.on('text', async ctx => {
  const user = await ensureUser(ctx.from.id);

  if (!user.lastGirl) {
    return ctx.reply('Сначала выбери девушку: /my');
  }

  if (!user.isPremium && user.used >= FREE_LIMIT) {
    return ctx.reply('🔒 Лимит исчерпан! Напиши /premium.');
  }

  try {
    const girl = await pb.collection('girls').getOne(user.lastGirl);

    const messages = [
      { role:'system',
        content:'Ты виртуальная девушка-компаньон. Отвечай дружелюбно, используй эмодзи, флиртуй.' },
      { role:'system', content:`О персонаже: ${girl.persona}` },
      { role:'user',   content:ctx.message.text }
    ];

    const res = await openai.createChatCompletion({
      model: OPENAI_MODEL,
      messages,
      max_tokens: 200,
      temperature: 0.8
    });

    const reply = res.data.choices[0].message.content.trim();

    await pb.collection('users').update(user.id, { used: user.used + 1 });
    ctx.reply(reply);
  } catch (e) {
    console.error('Generate error →', e.response?.status || e.message);
    ctx.reply('⚠️ Что-то пошло не так, попробуй ещё.');
  }
});

/* ─── 9. premium (заглушка) ────────────────────────────── */
bot.command('premium', ctx =>
  ctx.reply('🚧 Премиум появится позже, следите за обновлениями!')
);

/* ─── 10. launch ───────────────────────────────────────── */
bot.launch().then(() =>
  console.log(`✅ Bot запущен — модель ${OPENAI_MODEL}`));

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
