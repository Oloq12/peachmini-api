// bot/pb.cjs  (CommonJS-версия клиента)
const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');

async function saveCharacter(userId, character) {
  return pb.collection('characters').create({ userId, ...character });
}

async function getCharacters(userId) {
  return pb.collection('characters')
           .getFullList({ filter: `userId="${userId}"` });
}

// Генерация короткого реферального кода (base36)
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Создание или обновление пользователя
async function ensureUserInDB(tgId) {
  try {
    // Пытаемся найти пользователя
    const user = await pb.collection('users').getFirstListItem(`tgId=${tgId}`).catch(() => null);
    
    if (user) {
      return user;
    }
    
    // Создаём нового пользователя с уникальным referralCode
    let referralCode = generateReferralCode();
    let attempts = 0;
    
    while (attempts < 5) {
      try {
        const newUser = await pb.collection('users').create({
          tgId: tgId,
          used: 0,
          isPremium: false,
          balance: 0,
          refCount: 0,
          referralCode: referralCode
        });
        return newUser;
      } catch (e) {
        if (e.message && e.message.includes('referralCode')) {
          // Код уже занят, генерируем новый
          referralCode = generateReferralCode();
          attempts++;
        } else {
          throw e;
        }
      }
    }
    
    throw new Error('Failed to generate unique referral code');
  } catch (e) {
    console.error('Error in ensureUserInDB:', e);
    throw e;
  }
}

// Найти пользователя по реферальному коду
async function findUserByReferralCode(code) {
  try {
    return await pb.collection('users').getFirstListItem(`referralCode="${code}"`);
  } catch (e) {
    return null;
  }
}

// Обработка реферала
async function processReferral(inviteeTgId, referralCode) {
  try {
    // Находим пригласившего
    const inviter = await findUserByReferralCode(referralCode);
    if (!inviter) {
      console.log('❌ Inviter not found for code:', referralCode);
      return null;
    }
    
    // Проверяем, что пользователь не приглашает сам себя
    if (inviter.tgId === inviteeTgId) {
      console.log('❌ User cannot refer themselves');
      return null;
    }
    
    // Создаём нового пользователя (если еще не существует)
    const invitee = await ensureUserInDB(inviteeTgId);
    
    // Проверяем, что реферал ещё не был зарегистрирован
    const existingRef = await pb.collection('referrals')
      .getFirstListItem(`inviteeId="${invitee.id}"`)
      .catch(() => null);
    
    if (existingRef) {
      console.log('❌ User already referred by someone');
      return null;
    }
    
    // Создаём запись реферала
    await pb.collection('referrals').create({
      inviterId: inviter.id,
      inviteeId: invitee.id,
      code: referralCode
    });
    
    // Обновляем счётчик рефералов и начисляем бонус
    await pb.collection('users').update(inviter.id, {
      refCount: (inviter.refCount || 0) + 1,
      balance: (inviter.balance || 0) + 100
    });
    
    console.log('✅ Referral processed:', {
      inviter: inviter.tgId,
      invitee: invitee.tgId,
      bonus: 100
    });
    
    return {
      inviter: {
        ...inviter,
        refCount: (inviter.refCount || 0) + 1,
        balance: (inviter.balance || 0) + 100
      },
      invitee,
      bonus: 100
    };
  } catch (e) {
    console.error('Error processing referral:', e);
    return null;
  }
}

// Получить статистику рефералов
async function getReferralStats(tgId) {
  try {
    const user = await pb.collection('users').getFirstListItem(`tgId=${tgId}`);
    const referrals = await pb.collection('referrals')
      .getFullList({ filter: `inviterId="${user.id}"` });
    
    const totalBonus = referrals.length * 100;
    
    return {
      code: user.referralCode,
      count: user.refCount || 0,
      bonus: totalBonus,
      balance: user.balance || 0
    };
  } catch (e) {
    console.error('Error getting referral stats:', e);
    return null;
  }
}

module.exports = { 
  saveCharacter, 
  getCharacters,
  ensureUserInDB,
  findUserByReferralCode,
  processReferral,
  getReferralStats
};
