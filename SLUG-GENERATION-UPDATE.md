# Обновление: Генерация уникального slug

## Дата: 2025-10-13

### ✅ Изменения API

#### POST `/api/girls` - Создание персонажа

**Генерация slug:**
- Формат: `kebab-case(name)-{shortId}`
- shortId: 6-символьный случайный идентификатор (a-z0-9)
- Автоматическая проверка уникальности с retry при коллизии

**Пример:**
```javascript
name: "Анна Красивая" → slug: "anna-krasivaya-a3k5m9"
name: "Super Girl!" → slug: "super-girl-x7p2q1"
name: "Мария-Луиза" → slug: "mariya-luiza-sr90qd"
name: "Кэтрин О'Хара" → slug: "ketrin-ohara-f3wcl0"
```

**Валидация:**
```json
// Успех
{
  "ok": true,
  "data": {
    "id": "7",
    "slug": "anna-krasivaya-a3k5m9"
  }
}

// Ошибка - slug существует (409)
{
  "ok": false,
  "error": "Slug already exists. Please try again.",
  "code": "SLUG_EXISTS"
}
```

**Алгоритм генерации:**

```javascript
// Таблица транслитерации кириллицы → латиница
const translitMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

function generateUniqueSlug(name, existingGirls) {
  // 1. Транслитерация кириллицы → латиница
  const transliterated = transliterate(name);
  
  // 2. Преобразование в kebab-case
  const baseSlug = transliterated
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')  // Только латиница, цифры, пробелы, дефисы
    .replace(/\s+/g, '-')            // Пробелы → дефисы
    .replace(/-+/g, '-')             // Множественные дефисы → один
    .replace(/^-|-$/g, '');          // Убрать дефисы с краёв
  
  // 3. Генерация shortId (6 символов)
  const shortId = Math.random().toString(36).substring(2, 8);
  const slug = `${baseSlug}-${shortId}`;
  
  // 4. Проверка уникальности
  const exists = existingGirls.some(g => g.slug === slug);
  if (exists) {
    return generateUniqueSlug(name, existingGirls); // Retry с новым ID
  }
  
  return slug;
}
```

### 🔤 Транслитерация кириллицы

**Поддерживаемые символы:**
- Русская кириллица (а-я) → латиница (a-z)
- Специальные буквы: ё→yo, ж→zh, ч→ch, ш→sh, щ→sch, ю→yu, я→ya
- Мягкий и твёрдый знаки удаляются
- Другие алфавиты (японский, китайский и т.д.) удаляются

**Примеры транслитерации:**
```
Анна → anna
Юлия → yuliya
Александр → aleksandr
Щёлково → schyolkovo
```

### ✅ PocketBase Миграции

#### Миграция: `1760350009_enforce_unique_slug.js`

**Что делает:**

1. **Обновляет поле `slug`:**
   - `required: true`
   - `pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"` (kebab-case validation)
   - `min: 3` символа
   - `max: 255` символов

2. **Создает уникальный индекс:**
   ```sql
   CREATE UNIQUE INDEX idx_girls_slug ON girls (slug)
   ```

3. **Защита от дублирования:**
   - База данных автоматически отклонит вставку/обновление с дублирующимся slug
   - API вернет 409 с кодом `SLUG_EXISTS`

**Применение миграции:**

```bash
# Автоматически применяется при запуске PocketBase
./pocketbase serve

# Или вручную
./pocketbase migrate up
```

**Откат миграции:**

```bash
./pocketbase migrate down 1760350009
```

### 📊 Схема коллекции `girls`

```javascript
{
  id: "text", // primary key, 15 chars
  name: "text", // required
  slug: "text", // required, unique, kebab-case pattern
  avatar: "text",
  shortDesc: "text",
  persona: "text",
  origin: "text",
  bioMemory: "json",
  starterPhrases: "json",
  created: "autodate",
  updated: "autodate"
}
```

### 🔒 Индексы

```sql
-- Уникальный индекс на slug
CREATE UNIQUE INDEX idx_girls_slug ON girls (slug)
```

### 🧪 Тестирование

**Тест 1: Создание с уникальным slug**
```bash
curl -X POST http://localhost:8787/girls \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Анна",
    "persona": "Дружелюбная девушка"
  }'

# Ответ:
# { "ok": true, "data": { "id": "7", "slug": "anna-x3k5m9" } }
```

**Тест 2: Попытка дублирования (симуляция)**
```bash
# Если slug каким-то образом совпадет (крайне редко):
# { "ok": false, "error": "Slug already exists...", "code": "SLUG_EXISTS" }
```

**Тест 3: Проверка на уровне БД**
```bash
# Попытка вставить дублирующийся slug напрямую в PocketBase
# Результат: UNIQUE constraint failed: girls.slug
```

### 📝 Примеры slug для разных имен

| Имя | Транслитерация | Сгенерированный slug | Валидация |
|-----|---------------|---------------------|-----------|
| Анна | anna | anna-oinio0 | ✅ |
| Super Girl | super girl | super-girl-052ca4 | ✅ |
| Мария-Луиза | mariya-luiza | mariya-luiza-sr90qd | ✅ |
| AI Assistant 2024 | ai assistant 2024 | ai-assistant-2024-egbwx0 | ✅ |
| Кэтрин О'Хара | ketrin ohara | ketrin-ohara-f3wcl0 | ✅ |
| Test!!!### | test | test-0aqawb | ✅ |
| Spaces   Around | spaces around | spaces-around-t2rrmj | ✅ |
| Multiple---Dashes | multiple dashes | multiple-dashes-rezj48 | ✅ |
| CamelCaseExample | camelcaseexample | camelcaseexample-orquu5 | ✅ |
| Японский 日本語 Test | yaponskiy  test | yaponskiy-test-gtqcti | ✅ |

### 🚀 Deployment

1. **Обновление API:**
   ```bash
   cd api
   # Deploy to Vercel
   vercel --prod
   ```

2. **Применение миграций PocketBase:**
   ```bash
   # На сервере PocketBase
   ./pocketbase migrate up
   ```

### ✅ Checklist

- [x] Генерация уникального slug в API
- [x] Транслитерация кириллицы → латиница
- [x] Валидация формата kebab-case
- [x] Проверка 409 SLUG_EXISTS
- [x] Миграция PocketBase с уникальным индексом
- [x] Pattern validation для slug
- [x] Min/max длина slug (3-255 символов)
- [x] Тесты генерации slug
- [x] Документация

---

**Статус:** ✅ ГОТОВО

