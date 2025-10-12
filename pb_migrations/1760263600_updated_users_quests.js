/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3754236674");

  // Добавляем поле streak
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number_user_streak",
    "max": null,
    "min": 0,
    "name": "streak",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));

  // Добавляем поле lastCheckin
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "date_last_checkin",
    "max": "",
    "min": "",
    "name": "lastCheckin",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3754236674");

  // Удаляем поле streak
  collection.fields.removeById("number_user_streak");

  // Удаляем поле lastCheckin
  collection.fields.removeById("date_last_checkin");

  return app.save(collection);
});
