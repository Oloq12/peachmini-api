/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_929686065");

  // Обновляем поле slug для большей строгости
  const slugField = collection.fields.getById("text_slug");
  if (slugField) {
    slugField.required = true;
    slugField.pattern = "^[a-z0-9]+(-[a-z0-9]+)*$"; // kebab-case pattern
    slugField.min = 3;
    slugField.max = 255;
  }

  // Убеждаемся, что уникальный индекс существует
  const hasUniqueIndex = collection.indexes.some(idx => 
    idx.includes('idx_girls_slug') || idx.includes('UNIQUE') && idx.includes('slug')
  );

  if (!hasUniqueIndex) {
    collection.indexes.push("CREATE UNIQUE INDEX idx_girls_slug ON girls (slug)");
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_929686065");

  // Откатываем изменения поля slug
  const slugField = collection.fields.getById("text_slug");
  if (slugField) {
    slugField.required = true;
    slugField.pattern = "";
    slugField.min = 0;
    slugField.max = 0;
  }

  // Индекс оставляем, так как он был в предыдущей миграции

  return app.save(collection);
})

