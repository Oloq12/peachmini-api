/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_929686065");

  // Добавляем недостающие поля
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_slug",
    "max": 0,
    "min": 0,
    "name": "slug",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }));

  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_avatar",
    "max": 0,
    "min": 0,
    "name": "avatar",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_short_desc",
    "max": 0,
    "min": 0,
    "name": "shortDesc",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_origin",
    "max": 0,
    "min": 0,
    "name": "origin",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json_bio_memory",
    "maxSize": 2000000,
    "name": "bioMemory",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "json"
  }));

  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json_starter_phrases",
    "maxSize": 2000000,
    "name": "starterPhrases",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "json"
  }));

  // Обновляем name чтобы был required
  collection.fields.getById("text1579384326").required = true;

  // Добавляем индексы
  collection.indexes = [
    "CREATE UNIQUE INDEX idx_girls_slug ON girls (slug)"
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_929686065");

  // Удаляем добавленные поля
  collection.fields.removeById("text_slug");
  collection.fields.removeById("text_avatar");
  collection.fields.removeById("text_short_desc");
  collection.fields.removeById("text_origin");
  collection.fields.removeById("json_bio_memory");
  collection.fields.removeById("json_starter_phrases");

  // Возвращаем name к не-required
  collection.fields.getById("text1579384326").required = false;

  // Удаляем индексы
  collection.indexes = [];

  return app.save(collection);
})

