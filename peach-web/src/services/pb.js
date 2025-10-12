import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_PB_URL;

let pb = null;

if (PB_URL) {
  pb = new PocketBase(PB_URL);
}

export { pb, PB_URL };

// Функция для получения персонажей
export async function getCharacters() {
  if (!pb) {
    // Возвращаем моковые данные если PocketBase не настроен
    return getMockCharacters();
  }

  try {
    const records = await pb.collection('girls').getList(1, 50, {
      sort: '-created',
    });
    return records.items;
  } catch (error) {
    console.error('Ошибка загрузки персонажей:', error);
    throw error;
  }
}

// Функция для получения персонажа по slug
export async function getCharacterBySlug(slug) {
  if (!pb) {
    const mockChars = getMockCharacters();
    return mockChars.find(c => c.slug === slug);
  }

  try {
    const records = await pb.collection('girls').getList(1, 1, {
      filter: `slug = "${slug}"`,
    });
    return records.items[0] || null;
  } catch (error) {
    console.error('Ошибка загрузки персонажа:', error);
    throw error;
  }
}

// Моковые данные
function getMockCharacters() {
  return [
    {
      id: '1',
      name: 'Амелия',
      slug: 'amelia',
      shortDesc: 'Милая и застенчивая',
      avatar: 'https://i.pravatar.cc/300?img=1'
    },
    {
      id: '2',
      name: 'Вероника',
      slug: 'veronika',
      shortDesc: 'Смелая и независимая',
      avatar: 'https://i.pravatar.cc/300?img=5'
    },
    {
      id: '3',
      name: 'София',
      slug: 'sofia',
      shortDesc: 'Умная и элегантная',
      avatar: 'https://i.pravatar.cc/300?img=9'
    },
    {
      id: '4',
      name: 'Диана',
      slug: 'diana',
      shortDesc: 'Веселая и общительная',
      avatar: 'https://i.pravatar.cc/300?img=10'
    },
    {
      id: '5',
      name: 'Кристина',
      slug: 'kristina',
      shortDesc: 'Таинственная и загадочная',
      avatar: 'https://i.pravatar.cc/300?img=20'
    },
    {
      id: '6',
      name: 'Валерия',
      slug: 'valeria',
      shortDesc: 'Дружелюбная и открытая',
      avatar: 'https://i.pravatar.cc/300?img=23'
    }
  ];
}

