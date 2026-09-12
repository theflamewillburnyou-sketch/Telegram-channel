const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

console.log(
  "Database initialized successfully."
);

db.close();
