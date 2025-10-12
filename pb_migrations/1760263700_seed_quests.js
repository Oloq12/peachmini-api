/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("quests_collection");

  // Проверяем, есть ли уже записи
  const existingRecords = app.findRecordsByFilter(
    "quests",
    "",
    "",
    0,
    []
  );

  // Если записи уже есть, пропускаем семплирование
  if (existingRecords.length > 0) {
    console.log("Quests collection already has data, skipping seed");
    return;
  }

  const quests = [
    {
      code: "daily_checkin",
      title: "Ежедневный вход",
      reward: 20
    },
    {
      code: "first_chat",
      title: "Первое сообщение",
      reward: 30
    },
    {
      code: "create_persona",
      title: "Создать персону",
      reward: 50
    },
    {
      code: "invite_friend",
      title: "Пригласить друга",
      reward: 100
    }
  ];

  quests.forEach(quest => {
    const record = new Record(collection);
    record.set("code", quest.code);
    record.set("title", quest.title);
    record.set("reward", quest.reward);
    
    app.save(record);
    console.log(`Seeded quest: ${quest.code} (${quest.title})`);
  });

  return;
}, (app) => {
  // Не удаляем записи при откате, так как это данные пользователя
  console.log("Rollback: Keeping seeded quest data");
  return;
});
