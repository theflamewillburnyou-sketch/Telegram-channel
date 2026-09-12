const Database = require("better-sqlite3");

const db = new Database("midnight-society.db");

db.pragma("journal_mode = WAL");

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT UNIQUE NOT NULL,

      title TEXT NOT NULL,

      source TEXT,

      link TEXT UNIQUE,

      published_at TEXT,

      market_tags TEXT,

      affected_assets TEXT,

      direction TEXT,

      magnitude TEXT,

      event_type TEXT,

      timeframe TEXT,

      confidence TEXT,

      priority_score INTEGER NOT NULL DEFAULT 0,

      priority_level TEXT NOT NULL DEFAULT 'LOW',

      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT NOT NULL,

      symbol TEXT NOT NULL,

      price REAL NOT NULL,

      currency TEXT,

      timestamp TEXT NOT NULL,

      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );

    CREATE TABLE IF NOT EXISTS outcomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT NOT NULL,

      symbol TEXT NOT NULL,

      horizon TEXT NOT NULL,

      initial_price REAL NOT NULL,

      later_price REAL NOT NULL,

      percentage_change REAL NOT NULL,

      direction TEXT NOT NULL,

      initial_timestamp TEXT,

      later_timestamp TEXT,

      UNIQUE (
        event_id,
        symbol,
        horizon
      ),

      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );

    CREATE TABLE IF NOT EXISTS market_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT NOT NULL,

      horizon TEXT NOT NULL,

      expected_direction TEXT,

      total_assets INTEGER NOT NULL,

      confirmed INTEGER NOT NULL,

      divergences INTEGER NOT NULL,

      neutral INTEGER NOT NULL,

      overall TEXT NOT NULL,

      created_at TEXT NOT NULL,

      UNIQUE(event_id, horizon),

      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );

    CREATE TABLE IF NOT EXISTS published_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      telegram_message_id INTEGER,
      published_at TEXT NOT NULL,
      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );

    CREATE TABLE IF NOT EXISTS expected_vs_actual (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT NOT NULL,

      symbol TEXT NOT NULL,

      horizon TEXT NOT NULL,

      expected TEXT NOT NULL,

      actual TEXT NOT NULL,

      percentage_change REAL NOT NULL,

      threshold REAL NOT NULL,

      result TEXT NOT NULL,

      created_at TEXT NOT NULL,

      UNIQUE(event_id, symbol, horizon),

      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );

    CREATE TABLE IF NOT EXISTS event_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT NOT NULL UNIQUE,

      direction TEXT NOT NULL,
      magnitude TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      confidence TEXT NOT NULL,

      predicted_at TEXT NOT NULL,

      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );

    CREATE TABLE IF NOT EXISTS published_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT NOT NULL,

      horizon TEXT NOT NULL,

      telegram_message_id INTEGER,

      published_at TEXT NOT NULL,

      UNIQUE(event_id, horizon),

      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );
  `);

  migrateOutcomesTable();
}

function migrateOutcomesTable() {
  const table = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'outcomes'
  `).get();

  if (!table) {
    return;
  }

  const columns = db
    .prepare(`PRAGMA table_info(outcomes)`)
    .all()
    .map(column => column.name);

  if (columns.includes("initial_price")) {
    return;
  }

  db.pragma("foreign_keys = OFF");

  db.exec(`
    BEGIN;

    ALTER TABLE outcomes RENAME TO outcomes_legacy;

    CREATE TABLE outcomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id TEXT NOT NULL,

      symbol TEXT NOT NULL,

      horizon TEXT NOT NULL,

      initial_price REAL NOT NULL,

      later_price REAL NOT NULL,

      percentage_change REAL NOT NULL,

      direction TEXT NOT NULL,

      initial_timestamp TEXT,

      later_timestamp TEXT,

      UNIQUE (
        event_id,
        symbol,
        horizon
      ),

      FOREIGN KEY (event_id)
        REFERENCES events(event_id)
    );

    INSERT INTO outcomes (
      event_id,
      symbol,
      horizon,
      initial_price,
      later_price,
      percentage_change,
      direction,
      initial_timestamp,
      later_timestamp
    )
    SELECT
      event_id,
      symbol,
      horizon,
      event_price,
      outcome_price,
      percentage_change,
      actual_direction,
      event_timestamp,
      outcome_timestamp
    FROM outcomes_legacy;

    DROP TABLE outcomes_legacy;

    COMMIT;
  `);

  db.pragma("foreign_keys = ON");
}

module.exports = {
  db,
  initializeDatabase
};
