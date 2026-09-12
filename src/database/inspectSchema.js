const { db, initializeDatabase } = require("./database");

initializeDatabase();

const rows = db.prepare(`
  SELECT sql
  FROM sqlite_master
  WHERE type = 'table'
    AND name IN (
      'events',
      'snapshots',
      'outcomes',
      'expected_vs_actual',
      'market_reactions'
    )
`).all();

console.log(rows);
