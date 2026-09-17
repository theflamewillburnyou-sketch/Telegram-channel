-- Persistent AI provider cooldown state for Cloudflare Workers.
-- Survives isolate recycling (unlike in-memory providerManager).

CREATE TABLE ai_provider_state (
  provider TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  failure_count INTEGER NOT NULL DEFAULT 0,
  cooldown_until TEXT,
  last_error_type TEXT,
  updated_at TEXT NOT NULL
);
