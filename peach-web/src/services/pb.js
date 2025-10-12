import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_PB_URL;

let pb = null;

if (PB_URL) {
  pb = new PocketBase(PB_URL);
}

export { pb, PB_URL };

// Функция для получения персонажей
export async function getCharacters() {
  const API_URL = import.meta.env.VITE_API_URL || 'https://unrazed-wendell-pseudocentric.ngrok-free.dev';
  
  console.log('🔵 getCharacters: API_URL =', API_URL);
  
  try {
    console.log('🔵 getCharacters: Попытка загрузить через API...');
    const response = await fetch(`${API_URL}/girls`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('🟢 getCharacters: Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('📊 getCharacters: Data from API:', data);
    if (data.ok && data.girls) {
      console.log('✅ getCharacters: Возвращаем данные из API:', data.girls.length, 'персонажей');
      return data.girls;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('🔴 getCharacters: Ошибка загрузки персонажей:', error);
    console.log('⚠️ getCharacters: Используем моковые данные как fallback');
    // Возвращаем моковые данные в случае ошибки
    const mockData = getMockCharacters();
    console.log('📊 getCharacters: Mock data:', mockData);
    return mockData;
  }
}

// Функция для получения персонажа по slug
export async function getCharacterBySlug(slug) {
  const API_URL = import.meta.env.VITE_API_URL || 'https://unrazed-wendell-pseudocentric.ngrok-free.dev';
  
  console.log('🔵 getCharacterBySlug: slug =', slug);
  
  try {
    console.log('🔵 getCharacterBySlug: Загрузка через API...');
    const response = await fetch(`${API_URL}/girls/${slug}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('🟢 getCharacterBySlug: Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('📊 getCharacterBySlug: Data from API:', data);
    if (data.ok && data.girl) {
      console.log('✅ getCharacterBySlug: Персонаж найден');
      return data.girl;
    } else {
      throw new Error('Character not found');
    }
  } catch (error) {
    console.error('🔴 getCharacterBySlug: Ошибка загрузки персонажа:', error);
    console.log('⚠️ getCharacterBySlug: Fallback на моковые данные');
    const mockChars = getMockCharacters();
    return mockChars.find(c => c.slug === slug) || null;
  }
}

// Моковые данные
function getMockCharacters() {
  return [
    {
      id: '1',
      name: 'Амелия',
      slug: 'amelia',
      shortDesc: 'Милая и застенчивая девушка, любящая книги и уютные вечера дома.',
      avatarUrl: 'https://i.pravatar.cc/300?img=1',
      avatar: 'https://i.pravatar.cc/300?img=1'
    },
    {
      id: '2',
      name: 'Вероника',
      slug: 'veronika',
      shortDesc: 'Смелая и независимая, всегда готова к новым приключениям.',
      avatarUrl: 'https://i.pravatar.cc/300?img=5',
      avatar: 'https://i.pravatar.cc/300?img=5'
    },
    {
      id: '3',
      name: 'София',
      slug: 'sofia',
      shortDesc: 'Умная и элегантная, ценит глубокие разговоры.',
      avatarUrl: 'https://i.pravatar.cc/300?img=9',
      avatar: 'https://i.pravatar.cc/300?img=9'
    },
    {
      id: '4',
      name: 'Диана',
      slug: 'diana',
      shortDesc: 'Веселая и общительная, заряжает позитивом всех вокруг.',
      avatarUrl: 'https://i.pravatar.cc/300?img=10',
      avatar: 'https://i.pravatar.cc/300?img=10'
    },
    {
      id: '5',
      name: 'Кристина',
      slug: 'kristina',
      shortDesc: 'Таинственная и загадочная, хранит множество секретов.',
      avatarUrl: 'https://i.pravatar.cc/300?img=20',
      avatar: 'https://i.pravatar.cc/300?img=20'
    },
    {
      id: '6',
      name: 'Валерия',
      slug: 'valeria',
      shortDesc: 'Дружелюбная и открытая, всегда рада помочь.',
      avatarUrl: 'https://i.pravatar.cc/300?img=23',
      avatar: 'https://i.pravatar.cc/300?img=23'
    }
  ];
}

// Функция для отправки сообщения в чат
export async function sendChatMessage(girlId, userMsg, userId = 'demo') {
  const API_URL = import.meta.env.VITE_API_URL || 'https://unrazed-wendell-pseudocentric.ngrok-free.dev';
  
  console.log('🔵 sendChatMessage: girlId =', girlId, 'userMsg =', userMsg);
  
  try {
    console.log('🔵 sendChatMessage: Отправка через API...');
    const response = await fetch(`${API_URL}/chat/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        girlId,
        userMsg,
        userId
      })
    });
    console.log('🟢 sendChatMessage: Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('NO_FUNDS');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 sendChatMessage: Data from API:', data);
    
    if (data.ok && data.reply) {
      console.log('✅ sendChatMessage: Сообщение отправлено');
      return {
        success: true,
        reply: data.reply,
        balance: data.balance
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('🔴 sendChatMessage: Ошибка отправки сообщения:', error);
    throw error;
  }
}

