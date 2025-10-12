/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3754236674");

  // add field: referralCode
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_refcode",
    "max": 20,
    "min": 0,
    "name": "referralCode",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }));

  // add field: refCount
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number_refcount",
    "max": null,
    "min": 0,
    "name": "refCount",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));

  // add field: balance
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number_balance",
    "max": null,
    "min": 0,
    "name": "balance",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));

  // add unique index for referralCode
  collection.indexes = [
    "CREATE UNIQUE INDEX idx_unique_refcode ON users (referralCode)"
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3754236674");

  // remove field: referralCode
  collection.fields.removeById("text_refcode");

  // remove field: refCount
  collection.fields.removeById("number_refcount");

  // remove field: balance
  collection.fields.removeById("number_balance");

  // remove index
  collection.indexes = [];

  return app.save(collection);
});

