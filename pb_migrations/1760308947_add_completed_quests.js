/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("pbc_3754236674");
  
  usersCollection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "json_completed_quests",
    "maxSize": 0,
    "name": "completedQuests",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }));

  return app.save(usersCollection);
}, (app) => {
  const usersCollection = app.findCollectionByNameOrId("pbc_3754236674");
  usersCollection.fields.removeById("json_completed_quests");
  return app.save(usersCollection);
})
