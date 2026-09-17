-- Subscriber market preferences for welcome + personalized alerts.

CREATE TABLE subscriber_preferences (
  telegram_user_id TEXT PRIMARY KEY NOT NULL,
  username TEXT,
  first_name TEXT,
  preference TEXT NOT NULL DEFAULT 'all',
  welcome_sent_at TEXT,
  preference_set_at TEXT,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_subscriber_preferences_preference
  ON subscriber_preferences (preference);
