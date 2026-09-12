const { db, initializeDatabase } = require("./database");

initializeDatabase();

const rows = db.prepare(`
  SELECT *
  FROM outcomes
  ORDER BY id ASC
`).all();

console.log(
  "\n========== STORED OUTCOMES ==========\n"
);

console.log(rows);
