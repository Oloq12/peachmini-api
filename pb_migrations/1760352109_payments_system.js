/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Update users collection
  const users = app.findCollectionByNameOrId("pbc_3142635823");
  
  if (users) {
    // Add balance field if not exists
    try {
      users.fields.addAt(5, new Field({
        "autogeneratePattern": "",
        "hidden": false,
        "id": "number_balance",
        "max": null,
        "min": 0,
        "name": "balance",
        "onlyInt": true,
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "number"
      }));
    } catch (e) {
      // Field might already exist
    }

    // Add referralCode field if not exists
    try {
      users.fields.addAt(6, new Field({
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_referral_code",
        "max": 0,
        "min": 0,
        "name": "referralCode",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }));
    } catch (e) {
      // Field might already exist
    }

    // Add refCount field if not exists
    try {
      users.fields.addAt(7, new Field({
        "hidden": false,
        "id": "number_ref_count",
        "max": null,
        "min": 0,
        "name": "refCount",
        "onlyInt": true,
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "number"
      }));
    } catch (e) {
      // Field might already exist
    }

    // Add earned field if not exists
    try {
      users.fields.addAt(8, new Field({
        "hidden": false,
        "id": "number_earned",
        "max": null,
        "min": 0,
        "name": "earned",
        "onlyInt": true,
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "number"
      }));
    } catch (e) {
      // Field might already exist
    }

    // Add appliedRefCode field if not exists
    try {
      users.fields.addAt(9, new Field({
        "hidden": false,
        "id": "json_applied_ref_code",
        "maxSize": 2000000,
        "name": "appliedRefCode",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "json"
      }));
    } catch (e) {
      // Field might already exist
    }

    app.save(users);
  }

  // Create payments collection
  const payments = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_user_id",
        "max": 0,
        "min": 0,
        "name": "userId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_invoice_id",
        "max": 0,
        "min": 0,
        "name": "invoiceId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "select_status",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "pending",
          "paid",
          "failed"
        ]
      },
      {
        "hidden": false,
        "id": "number_amount",
        "max": null,
        "min": 0,
        "name": "amount",
        "onlyInt": true,
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number_stars",
        "max": null,
        "min": 0,
        "name": "stars",
        "onlyInt": true,
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_payments",
    "indexes": [
      "CREATE INDEX idx_payments_user ON payments (userId)",
      "CREATE INDEX idx_payments_invoice ON payments (invoiceId)",
      "CREATE INDEX idx_payments_status ON payments (status)"
    ],
    "listRule": null,
    "name": "payments",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(payments);
}, (app) => {
  // Rollback: delete payments collection
  const payments = app.findCollectionByNameOrId("pbc_payments");
  if (payments) {
    app.delete(payments);
  }
  
  // Note: We don't rollback users fields as they might be used elsewhere
  return null;
})

