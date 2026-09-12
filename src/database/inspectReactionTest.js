const { db, initializeDatabase } = require("./database");

initializeDatabase();

const eventId = "reaction-test-1789200761318";

console.log(
  db.prepare(
    "SELECT * FROM outcomes WHERE event_id = ?"
  ).all(eventId)
);

console.log(
  db.prepare(
    "SELECT * FROM expected_vs_actual WHERE event_id = ?"
  ).all(eventId)
);

console.log(
  db.prepare(
    "SELECT * FROM market_reactions WHERE event_id = ?"
  ).all(eventId)
);
