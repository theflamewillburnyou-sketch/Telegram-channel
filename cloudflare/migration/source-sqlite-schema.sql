-- Source SQLite schema for Midnight Society
-- Captured from local midnight-society.db / src/database/database.js (Phase 3)
-- Read-only reference. No D1-specific changes. No data.

CREATE TABLE events (
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

CREATE TABLE snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  event_id TEXT NOT NULL,

  symbol TEXT NOT NULL,

  price REAL NOT NULL,

  currency TEXT,

  timestamp TEXT NOT NULL,

  FOREIGN KEY (event_id)
    REFERENCES events(event_id)
);

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

CREATE TABLE market_reactions (
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

CREATE TABLE published_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  telegram_message_id INTEGER,
  published_at TEXT NOT NULL,
  FOREIGN KEY (event_id)
    REFERENCES events(event_id)
);

CREATE TABLE expected_vs_actual (
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

CREATE TABLE event_predictions (
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

CREATE TABLE published_reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  event_id TEXT NOT NULL,

  horizon TEXT NOT NULL,

  telegram_message_id INTEGER,

  published_at TEXT NOT NULL,

  UNIQUE(event_id, horizon),

  FOREIGN KEY (event_id)
    REFERENCES events(event_id)
);
