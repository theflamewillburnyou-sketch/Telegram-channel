const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

const rows = db.prepare(`
  SELECT *
  FROM snapshots
  ORDER BY id DESC
`).all();

console.log("\n========== SAVED SNAPSHOTS ==========\n");

console.log(rows);
