/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("pbc_3754236674");
  
  usersCollection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "number_earned_total",
    "max": null,
    "min": 0,
    "name": "earned",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }));

  return app.save(usersCollection);
}, (app) => {
  const usersCollection = app.findCollectionByNameOrId("pbc_3754236674");
  usersCollection.fields.removeById("number_earned_total");
  return app.save(usersCollection);
})
