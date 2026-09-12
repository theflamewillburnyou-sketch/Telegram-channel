const { db, initializeDatabase } = require("./database");

initializeDatabase();

console.log("\n========== RECENT EVENTS ==========\n");
console.log(
  db.prepare(`
    SELECT event_id, title, market_tags, affected_assets
    FROM events
    ORDER BY id DESC
    LIMIT 10
  `).all()
);

console.log("\n========== RECENT SNAPSHOTS ==========\n");
console.log(
  db.prepare(`
    SELECT event_id, symbol, price, timestamp
    FROM snapshots
    ORDER BY id DESC
    LIMIT 20
  `).all()
);
