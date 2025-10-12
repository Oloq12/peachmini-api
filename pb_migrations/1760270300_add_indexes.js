/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Добавляем индексы для messages
  const messagesCollection = app.findCollectionByNameOrId("pbc_messages");
  messagesCollection.indexes = [
    "CREATE INDEX idx_messages_userid ON messages (userId)",
    "CREATE INDEX idx_messages_girlid ON messages (girlId)",
    "CREATE INDEX idx_messages_created ON messages (created)"
  ];
  app.save(messagesCollection);

  // Добавляем индексы для payments
  const paymentsCollection = app.findCollectionByNameOrId("pbc_payments");
  paymentsCollection.indexes = [
    "CREATE INDEX idx_payments_userid ON payments (userId)",
    "CREATE INDEX idx_payments_created ON payments (created)"
  ];
  app.save(paymentsCollection);

  return;
}, (app) => {
  // Удаляем индексы при откате
  const messagesCollection = app.findCollectionByNameOrId("pbc_messages");
  messagesCollection.indexes = [];
  app.save(messagesCollection);

  const paymentsCollection = app.findCollectionByNameOrId("pbc_payments");
  paymentsCollection.indexes = [];
  app.save(paymentsCollection);

  return;
})

