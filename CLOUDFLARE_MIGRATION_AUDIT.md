# Midnight Society — Cloudflare Workers + D1 Migration Audit

**Phase:** 1 (Audit only)  
**Date:** 2026-09-17  
**Scope:** Inspection only — no application code, database, or deployment changes  
**Local Node.js app:** Preserved as-is  
**Local SQLite file (`midnight-society.db`):** Not modified  

---

## 1. Current architecture

Midnight Society is a **CommonJS Node.js** market-intelligence pipeline:

```
RSS sources
  → clean / dedupe / relevance / cluster / novelty
  → canonical event + scoring (impact, tags, assets, direction, priority)
  → save event + initial market snapshots (SQLite)
  → AI router (Gemini → Groq → OpenRouter → rules)
  → evidence check → final analysis → frozen prediction
  → Telegram publish (gated by priority ≥ 8.5 + pacing)
  → later: outcomes (1H/1D/1W) → expected vs actual → reactions
  → performance stats (every 30 min)
```

**Entry points today**

| Entry | Role |
|--------|------|
| `src/jobs/scheduler.js` | Production long-running process: loads news/publish/market jobs + schedules performance |
| `src/app.js` | Legacy one-shot outcome runner (not the full scheduler) |
| Manual `runNewsJob()` | One-off testing |

**Module style:** CommonJS (`require` / `module.exports`) everywhere.

**No Cloudflare config yet:** no `wrangler.toml` / `wrangler.json` / `wrangler.jsonc` found.

---

## 2. Database architecture

**Engine:** SQLite via `better-sqlite3`  
**File:** `midnight-society.db` (project root)  
**Init:** `src/database/database.js` → `initializeDatabase()` + outcomes migration helper  

**Tables**

| Table | Purpose |
|--------|---------|
| `events` | Canonical news events + classification + `priority_score` / `priority_level` |
| `snapshots` | Initial (and later) market prices per event/symbol |
| `outcomes` | Price change by event/symbol/horizon (`1H`/`1D`/`1W`) |
| `expected_vs_actual` | Prediction vs outcome grading per asset/horizon |
| `event_predictions` | Frozen prediction (direction, magnitude, type, timeframe, confidence) |
| `market_reactions` | Aggregated reaction summary per event/horizon |
| `published_posts` | Telegram send ledger (duplicate prevention + pacing) |
| `published_reactions` | Reaction Telegram send ledger |

**Access pattern**

- Repositories call `db.prepare(...).run/.get/.all` **synchronously**
- Many modules call `initializeDatabase()` on import
- App objects use **camelCase**; SQL columns use **snake_case** (mapping in repositories)

**Cloudflare implication:** D1 is SQLite-compatible SQL, but the API is **async** (`await env.DB.prepare(...).bind(...).all()`). The sync `better-sqlite3` style cannot be used as-is.

---

## 3. Scheduler architecture

| Job | Schedule | Where registered |
|-----|----------|------------------|
| News | `*/5 * * * *` | `newsJob.js` (self-cron on import) |
| Publish | `*/5 * * * *` | `publishJob.js` (self-cron on import) |
| Market | `*/5 * * * *` | `marketJob.js` (self-cron on import) |
| Performance | `*/30 * * * *` | `scheduler.js` only |

`scheduler.js` does:

1. `dotenv.config()`
2. `require("./newsJob")` / `publishJob` / `marketJob` (starts their crons as side effects)
3. Schedules `runPerformanceJob` every 30 minutes

**Cloudflare implication:** Replace with Worker `scheduled()` + Cron Triggers. Side-effect crons on `require` are incompatible and must not be imported unchanged into a Worker bundle without stripping cron registration.

---

## 4. Telegram architecture

| Piece | File | Notes |
|--------|------|--------|
| Send | `telegramPublisher.js` | Uses `node-telegram-bot-api` `Bot` + `bot.api.sendMessage` |
| Format | `postBuilder.js`, `postType.js`, `marketReactionMessage.js` | HTML string builders — portable |
| Gates | `publishDecision.js`, `publishEligibility.js`, `publishPacing.js` | Pure logic + DB read for last publish time |
| Ledger | `publishRepository.js` | `published_posts` |

**Secrets used:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` (via `process.env` / dotenv)

**Cloudflare implication:** Replace SDK with `fetch` to `https://api.telegram.org/bot<token>/sendMessage`. Message formatters can stay.

---

## 5. AI architecture

```
shouldUseAI (priority filter)
  → routeAI
      → Gemini (@google/genai SDK)
      → Groq (fetch OpenAI-compatible HTTPS)
      → OpenRouter (fetch HTTPS)
      → createRuleFallback
  → validateAnalysis
  → evidenceCheck → finalAnalysis → savePredictionIfNeeded
```

| Component | Status for Workers |
|-----------|-------------------|
| Prompts / validation / rules / evidence / final analysis | Mostly portable pure JS |
| Groq provider | Already `fetch`-based → adaptable |
| OpenRouter provider | Already `fetch`-based → adaptable |
| Gemini provider | Uses `@google/genai` SDK → likely needs REST/`fetch` adapter or SDK Worker test |
| `providerManager.js` | **In-memory object** → lost between Worker isolates; needs KV/D1/DO later |

**Env vars (names only):** `GOOGLE_API_KEY` / `GEMINI_API_KEY`, `GEMINI_MODEL`, `GROQ_API_KEY`, `GROQ_MODEL`, `OPENROUTER_*`, `AI_PROVIDER_ORDER`, `AI_PROVIDER_MAX_RETRIES`

---

## 6. Market-data architecture

`src/market/prices.js` (and related builder/outcome workers):

- **BTC/ETH:** Coinbase public HTTPS `fetch`
- **BRENT/WTI:** OilPriceAPI HTTPS `fetch` + `OILPRICEAPI_KEY`
- Fallback oil path / freshness checks exist in the broader market module set
- Horizons: `outcomeHorizon.js` → `1H`, `1D`, `1W`
- Calculations (`change.js`, `outcome.js`, `expectedVsActual.js`, reaction reports) are mostly pure JS

**Cloudflare implication:** HTTP market calls are compatible; inject secrets via Worker `env`; watch Worker CPU/time limits when processing many events.

---

## 7. News architecture

```
fetchNews + safeFetchRSS
  → processNews (pure pipeline of transforms)
  → newsJob: buildMarketEvent → save → analyze → paced publish
```

| Piece | Notes |
|--------|--------|
| `safeFetchRSS.js` | `fetch` + `rss-parser` `parseString` + AbortController timeout |
| `processNews.js` | Pure business logic — high reuse value |
| Scoring / tags / assets / priority | Pure JS |
| Source list | Multiple free RSS feeds (BBC, Fed, ECB, crypto, energy, metals, etc.) |

**Cloudflare implication:** RSS HTTP fetch is fine. `rss-parser` needs bundling/compatibility check; if problematic, swap XML parse library while keeping `processNews` intact.

---

## 8. Packages used

| Package | Used for | Workers note |
|---------|----------|--------------|
| `better-sqlite3` | SQLite DB | Native addon — **cannot** run on Workers |
| `node-cron` | Scheduling | Long-process only — **replace** with Cron Triggers |
| `dotenv` | Local `.env` load | Local-only; Workers use `env` / secrets |
| `node-telegram-bot-api` | Telegram send | Node-oriented SDK — **replace** with HTTPS `fetch` |
| `rss-parser` | Parse RSS XML | Likely bundleable — **needs test** |
| `@google/genai` | Gemini calls | May not be Worker-safe — **needs test / REST fallback** |

No other production dependencies in `package.json`.

---

## 9. Cloudflare compatibility classification

### COMPATIBLE (or nearly — with bundling / small env tweaks)

- Most of `src/news/*` business transforms (`processNews`, scoring, tags, direction, etc.)
- Most of `src/market/*` calculation modules (change, outcome math, horizons, reaction report builders)
- `src/ai/analysisPrompt.js`, `validateAnalysis.js`, `ruleFallback.js`, `evidenceCheck.js`, `finalAnalysis.js`, `aiFilter.js`
- `src/telegram/postBuilder.js`, `postType.js`, `publishDecision.js`, `publishEligibility.js`, `marketReactionMessage.js`
- `src/performance/performanceCalculator.js`, `publicPerformance.js`, `performanceSummary.js`
- Groq / OpenRouter provider **HTTP logic** (after `process.env` → `env`)
- Coinbase / OilPriceAPI **HTTP logic** (after secrets injection)

### NEEDS ADAPTER

- All `src/database/*Repository.js` (sync → async D1)
- `src/database/database.js` (file SQLite → D1 binding)
- `src/performance/performanceRepository.js` (SQL via D1)
- `src/telegram/publishPacing.js` (reads last publish time — OK once repo is async)
- `src/ai/providerManager.js` (persist cooldowns outside isolate memory)
- Config access (`process.env` → Worker `env`)
- CommonJS → Worker bundle (Wrangler will typically bundle; prefer gradual ESM or keep CJS via bundler)
- Job modules that **register cron on import** (strip side effects for Worker builds)

### REQUIRES REPLACEMENT

- `better-sqlite3`
- `node-cron` / long-running `scheduler.js` process model
- `node-telegram-bot-api` Telegram transport
- Local `dotenv`-based production secret loading

### UNKNOWN / NEEDS TEST

- `@google/genai` inside Workers runtime
- `rss-parser` inside Workers bundle (Node polyfills / XML deps)
- Full news+AI+publish pipeline within **Worker CPU/time limits** (may need job splitting)
- AmericasOilWatch / other HTML fallback scraping paths (if still used) under Worker constraints

---

## 10. Database migration plan

1. Extract exact DDL from current `initializeDatabase()` (already documented above).
2. Create D1 schema SQL (Phase 3) matching tables/indexes/uniques — keep snake_case columns.
3. Build a thin D1 client wrapper (`env.DB`) with async `run/get/all`.
4. Add parallel repositories under a new path (e.g. `src/cloudflare/d1/`) **without deleting** local `better-sqlite3` repos.
5. Optionally share SQL strings between local and D1 adapters later.
6. Do **not** auto-migrate or delete `midnight-society.db`.
7. Data copy (local → D1) only when explicitly requested; not required for first Worker smoke tests.

---

## 11. Scheduler migration plan

| Today | Target |
|-------|--------|
| `node-cron` in-process | Cloudflare Cron Triggers |
| Side-effect crons in job files | Pure `runXJob(env)` functions |
| One Node process | Worker `scheduled(event, env, ctx)` |

Suggested Cron mapping (later phase):

- News: every 5 minutes  
- Publish: every 5 minutes (or merge with news carefully)  
- Market: every 5 minutes  
- Performance: every 30 minutes  

**Risk:** One cron invocation doing full RSS + AI + Telegram + market may exceed Worker limits → split triggers / queue later.

---

## 12. Telegram migration plan

1. Keep `buildTelegramPost` / pacing / eligibility / decision logic.
2. Replace `telegramPublisher.js` transport with:

   `POST https://api.telegram.org/bot${TOKEN}/sendMessage`

3. Keep HTML `parse_mode`, disable link preview equivalently.
4. Continue writing `published_posts` after success only.
5. Test with a dedicated Worker route or one-shot scheduled test (Phase 7).

---

## 13. Secrets migration plan

| Local today | Cloudflare later |
|-------------|------------------|
| `.env` via dotenv | `wrangler secret put ...` / dashboard secrets |
| `process.env.X` | `env.X` in Worker handlers |

**Never commit secrets.** Do not print secret values in logs.

Names to migrate (when implementing):

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL_ID`
- `GOOGLE_API_KEY` / `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional plain var)
- `GROQ_API_KEY`, `GROQ_MODEL`
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, …
- `OILPRICEAPI_KEY`
- Pacing vars (`TELEGRAM_MAX_POSTS_PER_JOB`, `TELEGRAM_MIN_MINUTES_BETWEEN_POSTS`)
- `AI_PROVIDER_ORDER`, `AI_PROVIDER_MAX_RETRIES`

Local `.env` remains for Node development.

---

## 14. AI migration plan

1. Keep router order + validation + rule fallback.
2. Prefer **fetch-based** Gemini REST if `@google/genai` fails on Workers.
3. Pass `env` into providers (no global `process.env` assumption).
4. Persist provider cooldown state (KV or D1 table) so 429s survive isolate recycling.
5. Keep `shouldUseAI` to protect free-tier quotas.
6. Test each provider independently in Worker context.

---

## 15. Market API migration plan

1. Keep Coinbase + OilPriceAPI `fetch` flows.
2. Inject `OILPRICEAPI_KEY` from Worker secrets.
3. Ensure timestamps / freshness guards remain.
4. Cap work per cron (max events / symbols) to stay under Worker limits.
5. Reuse outcome / expected-vs-actual / reaction pure functions.

---

## 16. Files that can remain unchanged (initially)

High reuse / little infra coupling:

- Most `src/news/*` transform modules (`processNews` chain)
- `src/telegram/postBuilder.js`, `postType.js`, `publishDecision.js`, `publishEligibility.js`, `marketReactionMessage.js`
- `src/ai/analysisPrompt.js`, `validateAnalysis.js`, `ruleFallback.js`, `evidenceCheck.js`, `finalAnalysis.js`, `aiFilter.js`, `providerError.js`
- `src/market/change.js`, `outcome.js`, `outcomeHorizon.js`, `expectedVsActual.js`, `marketReaction.js`, `marketReactionReport.js`, `crossMarket.js`, `snapshot.js`
- `src/performance/performanceCalculator.js`, `publicPerformance.js`, `performanceSummary.js`
- `src/prediction/savePredictionIfNeeded.js` (logic; DB calls need adapter underneath)

---

## 17. Files that require modification (for Cloudflare path)

| Area | Files |
|------|--------|
| DB | `database.js`, all `*Repository.js`, `saveCompleteEvent.js`, performance repo |
| Jobs | `scheduler.js` pattern; strip cron side effects from `newsJob` / `publishJob` / `marketJob` |
| Telegram transport | `telegramPublisher.js` |
| AI | `geminiProvider.js` (likely), providers’ env access, `providerManager.js`, `aiRouter.js` env wiring |
| News fetch | `safeFetchRSS.js` / `fetchNews.js` if `rss-parser` fails |
| Market | `prices.js` env injection |
| Config | any `process.env` / `dotenv` usage in Worker entry |

**Important:** Prefer **parallel Cloudflare modules** so local Node files keep working.

---

## 18. Files that should be new

Suggested (future phases — not created in Phase 1):

```
wrangler.toml                 # Worker + D1 + cron config
schema/d1.sql                 # D1 schema from existing SQLite DDL
src/cloudflare/
  worker.js                   # fetch + scheduled handlers
  env.js                      # env accessor helpers
  d1/
    client.js
    eventRepository.js
    ...
  telegram/
    telegramPublisher.js      # fetch-based
  ai/
    geminiProvider.js         # fetch REST if needed
migrations/                   # optional
CLOUDFLARE_MIGRATION_AUDIT.md # this file
```

---

## 19. Risks

1. **Worker CPU/time limits** — full pipeline in one cron may timeout.  
2. **Sync DB API** — largest code churn; easy to break if rewriting in place.  
3. **In-memory provider cooldowns** — ineffective on Workers without persistence.  
4. **Gemini SDK compatibility** — may force REST rewrite.  
5. **Duplicate cron side effects** — importing current job files into Worker could be wrong unless crons are removed.  
6. **RSS parse library** — Node assumptions in `rss-parser`.  
7. **Beginner ops risk** — accidental deploy / secret leak / overwriting local DB if phases are rushed.  
8. **Dual maintenance** — local Node + Worker paths until cutover.  
9. **Freshness + pacing** — clock and isolate differences; verify `published_posts` still drives pacing.  
10. **No existing Wrangler project** — greenfield Worker setup required in Phase 2.

---

## 20. Recommended migration order

Matches the agreed future phases:

1. **Phase 1** — Audit (this document) ✅  
2. **Phase 2** — Worker local structure + `wrangler.toml` (no logic rewrite)  
3. **Phase 3** — D1 schema from existing SQLite DDL  
4. **Phase 4** — D1 adapter / repositories (parallel to local)  
5. **Phase 5** — Worker ↔ D1 smoke test  
6. **Phase 6** — Telegram HTTPS publisher  
7. **Phase 7** — Worker ↔ Telegram test  
8. **Phase 8** — Secrets / env mapping  
9. **Phase 9** — News pipeline on Worker  
10. **Phase 10** — AI providers on Worker  
11. **Phase 11** — Market APIs on Worker  
12. **Phase 12** — Cron Triggers replace `node-cron`  
13. **Phase 13** — Wire jobs end-to-end  
14. **Phase 14** — Logging / retries / hardening  
15. **Phase 15** — Full E2E test  
16. **Phase 16** — Production deploy  
17. **Phase 17** — Enable production crons  
18. **Phase 18** — Final verification  

---

## Inspection summary (Phase 1)

**Inspected**

- `package.json`
- Absence of Wrangler config
- `src/app.js`
- `src/database/database.js` (+ repository sync patterns)
- `src/jobs/scheduler.js`, `newsJob.js`, `publishJob.js`, `marketJob.js`, related workers
- `src/telegram/telegramPublisher.js` + publish gating modules
- `src/ai/aiRouter.js`, Gemini/Groq providers, `providerManager.js`
- `src/market/prices.js` (HTTP providers)
- `src/news/safeFetchRSS.js`, `processNews.js`

**Not changed**

- No application source rewrites
- No dependency installs for migration
- No deploy
- No SQLite data changes

---

## PHASE 1 COMPLETE

**Files created:**
- `CLOUDFLARE_MIGRATION_AUDIT.md`

**Files modified:**
- NONE

**Next step (wait for your approval):**  
**Phase 2 — Create Cloudflare Worker local structure and configuration** (without rewriting business logic or touching the local SQLite DB).
