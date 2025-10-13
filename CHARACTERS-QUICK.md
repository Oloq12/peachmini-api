# 🎨 Персонажи Peachmini - Quick Reference

## ✅ Добавлено: 10 персонажей (ID 18-27)

### 📊 Краткая статистика

| ID | Имя | Slug | Тип |
|----|-----|------|-----|
| 18 | Алиса Солнечная | `alisa-solnechnaya-uec7fv` | 💫 Романтичная |
| 19 | Вера Стратегова | `vera-strategova-tg2b38` | 🚀 Стартаперша |
| 20 | Кира Геймерская | `kira-geymerskaya-3pjn4l` | 🎮 Геймерша |
| 21 | Софья Лирика | `sofya-lirika-7vyinc` | 📝 Поэтесса |
| 22 | Диана Кристалл | `diana-kristall-gjuca4` | 💎 Интеллектуалка |
| 23 | Маша Забота | `masha-zabota-28s9ng` | 🤗 Заботливая |
| 24 | Лена Энергия | `lena-energiya-rliest` | ⚡ Энергичная |
| 25 | Анна Мудрость | `anna-mudrost-kq8zv6` | 🕊️ Наставница |
| 26 | Полина Хаос | `polina-haos-g8fwn3` | 🌪️ Хаос |
| 27 | EVA-2049 | `eva-2049-m21yed` | 🤖 ИИ |

---

## 🚀 Quick Commands

### Добавить персонажей
```bash
npm run seed:characters
```

### Проверить количество
```bash
curl -s "https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/girls?limit=50" | jq '.data.total'
```

### Получить список
```bash
curl -s "https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/girls?limit=30" | jq '.data.girls[] | {id, name, slug}'
```

---

## 🔗 Links

**Frontend Gallery:**
```
https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app/companions
```

**API Endpoint:**
```
https://peach-mini-qt4sgywv0-trsoyoleg-4006s-projects.vercel.app/api/girls
```

**Chat with character:**
```
https://peach-mini-5outqmj04-trsoyoleg-4006s-projects.vercel.app/chat/{slug}
```

---

## 📝 Файлы

- **Полный отчёт:** [CHARACTERS-SEEDED-REPORT.md](CHARACTERS-SEEDED-REPORT.md)
- **Скрипт:** [scripts/seed-characters.js](scripts/seed-characters.js)
- **Quick ref:** Этот файл

---

**Статус:** ✅ Complete  
**Всего персонажей в БД:** 27  
**Дата:** 2025-10-13

