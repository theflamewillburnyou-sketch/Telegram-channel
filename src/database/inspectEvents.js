const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

const rows = db.prepare(`
  SELECT *
  FROM events
  ORDER BY id ASC
`).all();

console.log(
  "\n========== STORED EVENTS ==========\n"
);

console.log(rows);
