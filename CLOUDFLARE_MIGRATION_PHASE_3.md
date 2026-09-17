# Midnight Society — Cloudflare Migration Phase 3

**Phase:** 3 (D1 schema only)  
**Date:** 2026-09-17  
**Scope:** Capture local SQLite schema → Wrangler D1 migration → local apply → remote apply  
**Data import:** Not performed  
**Worker deploy:** Not performed  

---

## 1. Source SQLite tables discovered

Inspected:

- `src/database/database.js` → `initializeDatabase()` + `migrateOutcomesTable()`
- Live `midnight-society.db` via read-only `sqlite_master` dump
- `src/database/inspectSchema.js` (partial helper; does not list all tables)

**Application tables (8):**

| Table | Notes |
|--------|--------|
| `events` | Root table; `event_id` UNIQUE; `link` UNIQUE |
| `snapshots` | FK → `events(event_id)` |
| `outcomes` | Current shape uses `initial_price` / `later_price` (post-migration); UNIQUE `(event_id, symbol, horizon)`; FK → `events` |
| `expected_vs_actual` | UNIQUE `(event_id, symbol, horizon)`; FK → `events` |
| `event_predictions` | `event_id` UNIQUE; FK → `events` |
| `market_reactions` | UNIQUE `(event_id, horizon)`; FK → `events` |
| `published_posts` | `event_id` UNIQUE; FK → `events` |
| `published_reactions` | UNIQUE `(event_id, horizon)`; FK → `events` |

**Explicit `CREATE INDEX` statements:** none in project or live DB.  
**Triggers:** none.  
**Standalone indexes beyond UNIQUE/PK:** none.

`inspectSchema.js` only queries a subset of tables and was not used as the schema authority.

Reference capture file:

- `cloudflare/migration/source-sqlite-schema.sql`

---

## 2. Exact migration file created

Wrangler generated:

```text
migrations/0001_initial_schema.sql
```

Command:

```bash
npx wrangler d1 migrations create midnightmarketnews initial_schema
```

(Wrangler named it `0001_…`, not `0000_…`.)

Default migrations directory: `migrations/` (project root). No custom `migrations_dir` was required in `wrangler.toml`.

---

## 3. D1 compatibility changes

Authority: [Cloudflare D1 Migrations](https://developers.cloudflare.com/d1/reference/migrations/) and [D1 Foreign Keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/).

| Feature in source schema | D1 status | Action taken |
|--------------------------|-----------|--------------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | Supported | Kept as-is |
| `UNIQUE` / composite UNIQUE | Supported | Kept as-is |
| `FOREIGN KEY (... ) REFERENCES events(event_id)` | Supported; D1 enforces FKs by default | Kept as-is |
| `DEFAULT 0` / `DEFAULT 'LOW'` | Supported | Kept as-is |
| TEXT columns storing JSON-like strings (`market_tags`, `affected_assets`) | Supported as TEXT | Kept as-is |
| Explicit indexes | N/A (none exist) | None invented |
| Local-only `PRAGMA journal_mode = WAL` | Not part of table schema / not needed in D1 migration | Omitted from migration |
| Legacy `migrateOutcomesTable()` ALTER/RENAME path | One-time local SQLite upgrade only | Not included; D1 created with final `outcomes` shape |

**Conclusion:** No SQL syntax rewrites were required for D1. Schema SQL matches the live SQLite application schema.

---

## 4. Local migration result

```bash
npx wrangler d1 migrations apply midnightmarketnews --local
```

Result: `0001_initial_schema.sql` ✅ (9 commands executed)

Local tables after apply:

- Application: all 8 listed above  
- Metadata: `d1_migrations`, `sqlite_sequence`, `_cf_METADATA`

`d1_migrations` contains: `0001_initial_schema.sql`

---

## 5. Remote migration result

Pre-check (before apply): remote only had Cloudflare internal `_cf_KV` — **no unexpected application tables/data**. Proceeded.

```bash
npx wrangler d1 migrations apply midnightmarketnews --remote
```

Result: `0001_initial_schema.sql` ✅ (9 commands executed)

---

## 6. Tables created remotely

Remote `sqlite_schema` tables:

| name | Role |
|------|------|
| `events` | Application |
| `snapshots` | Application |
| `outcomes` | Application |
| `expected_vs_actual` | Application |
| `event_predictions` | Application |
| `market_reactions` | Application |
| `published_posts` | Application |
| `published_reactions` | Application |
| `d1_migrations` | Wrangler migration ledger |
| `sqlite_sequence` | SQLite AUTOINCREMENT helper |
| `_cf_KV` | Cloudflare internal (pre-existing) |

Row counts sampled after migration: `events=0`, `snapshots=0`, `outcomes=0` (no application data imported).

---

## 7. Indexes created

No explicit `CREATE INDEX` statements.

Indexes present are those SQLite/D1 create automatically for:

- PRIMARY KEY (`id`)
- UNIQUE columns / UNIQUE constraints, including:
  - `events(event_id)`, `events(link)`
  - `outcomes(event_id, symbol, horizon)`
  - `expected_vs_actual(event_id, symbol, horizon)`
  - `event_predictions(event_id)`
  - `market_reactions(event_id, horizon)`
  - `published_posts(event_id)`
  - `published_reactions(event_id, horizon)`

No extra indexes were invented.

---

## 8. Foreign keys created

Each dependent table has:

`FOREIGN KEY (event_id) REFERENCES events(event_id)`

Verified locally and remotely via `PRAGMA foreign_key_list(...)` for:

- `snapshots`
- `outcomes`
- `market_reactions`
- `published_posts`
- `expected_vs_actual`
- `event_predictions`
- `published_reactions`

---

## 9. Data migration status

**NOT PERFORMED**

Local `midnight-society.db` was not imported into D1.

---

## 10. Worker deployment status

**NOT PERFORMED**

`npx wrangler deploy` was not run.

---

## 11. Remaining issues / notes

1. `src/database/inspectSchema.js` is incomplete vs the full schema (missing some tables); Phase 3 used `database.js` + live dump instead.
2. Remote `_cf_KV` remains (Cloudflare internal); not an application table.
3. Application repositories / Worker code still use local SQLite only; D1 is schema-ready for a later adapter phase.
4. Existing Node app files were not modified.

---

## Success criteria checklist

- [x] Actual SQLite schema inspected  
- [x] Source schema SQL captured  
- [x] D1 migration file created (`0001_initial_schema.sql`)  
- [x] Local D1 migration succeeded + validated  
- [x] Remote D1 migration succeeded + validated  
- [x] No application code modified  
- [x] Local SQLite data untouched  
- [x] No application data imported  
- [x] No Worker deployment  

**Phase 3 status:** COMPLETE — stop here; do not start Phase 4.
