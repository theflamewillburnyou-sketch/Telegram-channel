# Midnight Society — Cloudflare Production Deployment Guide

**Date:** 2026-09-17  
**Worker:** `old-shape-9da6telegramchannel`  
**Production D1:** `midnightmarketnews`  
**Preview D1:** `midnightmarketnews-preview`  
**Entry:** `src/cloudflare/worker.js`

---

## Architecture

```
Cron Triggers (UTC)
  → Worker scheduled()
    → runNewsJob / runPublishJob / runMarketJob / runReactionJob
    → runPerformanceJob / runMaintenanceJob
      → D1 repositories (env.DB)
      → AI router (Gemini REST → Groq → OpenRouter → rules)
      → Market fetch (Coinbase / OilPriceAPI / AmericasOilWatch)
      → Telegram HTTPS sendMessage (gated)
```

Local Node + SQLite remains available under `src/jobs/scheduler.js` for development.

---

## Production Worker

| Item | Value |
|------|--------|
| Name | `old-shape-9da6telegramchannel` |
| Compatibility date | `2026-09-17` |
| Flags | `nodejs_compat` |
| Main | `src/cloudflare/worker.js` |

---

## Production D1

| Binding | Database | Role |
|---------|----------|------|
| `DB` | `midnightmarketnews` | Production (deploy) |
| `DB` preview_database_id | `midnightmarketnews-preview` | `wrangler dev --remote` |
| `DB_PREVIEW` | `midnightmarketnews-preview` | Migrations/admin only |

Migrations:

- `0001_initial_schema.sql` — application tables
- `0002_ai_provider_state.sql` — persistent AI cooldowns

---

## Cron schedules (UTC)

| Expression | Handler |
|------------|---------|
| `*/5 * * * *` | News (UTC minutes 0–4 of each 10) or Market (minutes 5–9) |
| `1-59/5 * * * *` | Publish sweep |
| `2-59/5 * * * *` | Reaction publish sweep |
| `*/30 * * * *` | Performance |
| `15 3 * * *` | Maintenance (03:15 UTC) |

Cron changes can take several minutes to propagate after deploy.

---

## Secret names (values never stored in git)

| Name | Category |
|------|----------|
| `TELEGRAM_BOT_TOKEN` | SECRET |
| `TELEGRAM_CHANNEL_ID` | SECRET |
| `TELEGRAM_TEST_CHANNEL_ID` | SECRET (optional test dest) |
| `OILPRICEAPI_KEY` | SECRET |
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` | SECRET |
| `GROQ_API_KEY` | SECRET |
| `OPENROUTER_API_KEY` | SECRET |
| `GEMINI_MODEL` | PLAIN |
| `GROQ_MODEL` | PLAIN |
| `OPENROUTER_MODEL` | PLAIN |
| `AI_PROVIDER_ORDER` | PLAIN |
| `AI_PROVIDER_MAX_RETRIES` | PLAIN |
| `TELEGRAM_MAX_POSTS_PER_JOB` | PLAIN |
| `TELEGRAM_MIN_MINUTES_BETWEEN_POSTS` | PLAIN |
| `CF_MAX_*` bounds | PLAIN |
| `CF_ALLOW_PRODUCTION_TELEGRAM` | PLAIN gate |

Set production secrets with Wrangler (example names only):

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHANNEL_ID
npx wrangler secret put GOOGLE_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put OILPRICEAPI_KEY
```

Do **not** put secrets in `wrangler.toml` `[vars]`.

---

## AI providers

Order (default): Gemini → Groq → OpenRouter → rule fallback  

- Gemini via REST `generateContent` (no `@google/genai` in Worker)
- Cooldowns persisted in D1 `ai_provider_state`
- No paid OpenRouter path in Worker code
- Low priority events use rule fallback (`priorityScore < 7`)

---

## Market providers

- BTC / ETH → Coinbase spot
- BRENT / WTI → OilPriceAPI then AmericasOilWatch
- Stale timestamps rejected when a minimum timestamp is required

---

## Telegram architecture

- Transport: `src/cloudflare/telegram/telegramPublisher.js` (`fetch` → `sendMessage`)
- Ledger: write `published_posts` / `published_reactions` **only after** Telegram success
- HTML `parse_mode` + disabled link previews preserved
- **Production sends are disabled** unless:
  - `TELEGRAM_TEST_CHANNEL_ID` is set (preferred for testing), or
  - `CF_ALLOW_PRODUCTION_TELEGRAM=true` is explicitly enabled

---

## Data retention

Permanent (do not auto-delete):

- events, event_predictions, outcomes, expected_vs_actual, market_reactions, published_*  

Maintenance job:

- expires AI cooldowns only  
- does not delete incomplete horizon data

---

## Error handling

- Per-source RSS isolation
- Per-event try/catch in news/market jobs
- AI provider failover + D1 cooldown
- Telegram failure → no ledger write
- Structured logs without secrets

---

## Known limitations

1. Live Telegram E2E to a dedicated test chat is still a **manual gate**.
2. First production runs use conservative `CF_MAX_*` bounds.
3. RSS parser is a minimal Worker-safe XML extractor (not `rss-parser`).
4. Local `node-cron` jobs remain for Node development; Worker uses Cron Triggers.

---

## Manual gates (must complete before “production complete”)

1. Configure dedicated `TELEGRAM_TEST_CHANNEL_ID` and verify one test send.
2. Put all required production secrets via `wrangler secret put`.
3. Confirm production D1 binding UUID is `midnightmarketnews` (not preview).
4. Only then set `CF_ALLOW_PRODUCTION_TELEGRAM=true` (or equivalent) and deploy.

---

## Rollback strategy

1. Redeploy previous Worker version from Cloudflare dashboard / Wrangler version history.
2. Do **not** drop D1 tables or delete production rows.
3. Keep local Node scheduler as emergency fallback (`src/jobs/scheduler.js`).
4. Migrations are additive; do not reverse-delete schema without a backup plan.

---

## Deploy command (only after gates pass)

```bash
npx wrangler deploy
```

Not executed automatically by this migration until manual gates are cleared.
