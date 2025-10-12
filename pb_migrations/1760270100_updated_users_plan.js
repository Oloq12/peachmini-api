/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3754236674");

  // Обновляем tgId с number на text и делаем unique
  collection.fields.removeById("number3823461503");
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_tg_id",
    "max": 0,
    "min": 0,
    "name": "tgId",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  // Добавляем поле plan
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_plan",
    "max": 0,
    "min": 0,
    "name": "plan",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  // Обновляем индексы (добавляем уникальность для tgId и referralCode)
  collection.indexes = [
    "CREATE UNIQUE INDEX idx_unique_tgid ON users (tgId)",
    "CREATE UNIQUE INDEX idx_unique_refcode ON users (referralCode)"
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3754236674");

  // Возвращаем tgId к number
  collection.fields.removeById("text_tg_id");
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "number3823461503",
    "max": null,
    "min": null,
    "name": "tgId",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));

  // Удаляем поле plan
  collection.fields.removeById("text_plan");

  // Возвращаем индексы
  collection.indexes = [
    "CREATE UNIQUE INDEX idx_unique_refcode ON users (referralCode)"
  ];

  return app.save(collection);
});

