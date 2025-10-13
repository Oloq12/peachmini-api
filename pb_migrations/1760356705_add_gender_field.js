/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_929686065");

  // Add gender field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "select_gender",
    "maxSelect": 1,
    "name": "gender",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "female",
      "male"
    ]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_929686065");

  // Remove gender field
  collection.fields.removeById("select_gender");

  return app.save(collection);
})

