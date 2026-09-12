const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

const tables = db.prepare(`
  SELECT name
  FROM sqlite_master
  WHERE type = 'table'
    AND name NOT LIKE 'sqlite_%'
`).all();

console.log("Before truncate:");

for (const table of tables) {
  const count = db.prepare(
    `SELECT COUNT(*) AS c FROM ${table.name}`
  ).get();

  console.log(`  ${table.name}: ${count.c}`);
}

const truncateOrder = [
  "published_reactions",
  "published_posts",
  "market_reactions",
  "expected_vs_actual",
  "outcomes",
  "event_predictions",
  "snapshots",
  "events"
];

db.exec("PRAGMA foreign_keys = OFF;");

const tx = db.transaction(() => {
  for (const name of truncateOrder) {
    const exists = tables.some(
      table => table.name === name
    );

    if (!exists) {
      continue;
    }

    db.prepare(`DELETE FROM ${name}`).run();
  }

  // Clear any remaining app tables not listed above
  for (const table of tables) {
    if (truncateOrder.includes(table.name)) {
      continue;
    }

    db.prepare(`DELETE FROM ${table.name}`).run();
  }
});

tx();

db.exec("PRAGMA foreign_keys = ON;");

console.log("\nAfter truncate:");

for (const table of tables) {
  const count = db.prepare(
    `SELECT COUNT(*) AS c FROM ${table.name}`
  ).get();

  console.log(`  ${table.name}: ${count.c}`);
}

console.log("\nDatabase truncated successfully.");
