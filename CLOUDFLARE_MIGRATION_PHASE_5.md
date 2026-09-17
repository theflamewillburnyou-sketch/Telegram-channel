# Midnight Society — Cloudflare Migration Phase 5

**Phase:** 5 (Remote Worker + isolated preview D1 integration)  
**Date:** 2026-09-17  
**Scope:** Preview D1 + `wrangler dev --remote` repository integration tests  
**Production deploy:** Not performed  
**Production D1 writes:** None  

---

## 1. Preview D1 database name

| Field | Value |
|--------|--------|
| Name | `midnightmarketnews-preview` |
| Created with | `npx wrangler d1 create midnightmarketnews-preview` |
| Purpose | Isolated remote development/testing only |

Production D1 remains `midnightmarketnews`.

---

## 2. Preview D1 configuration

`wrangler.toml`:

| Binding | Database | Role |
|---------|----------|------|
| `DB` | `midnightmarketnews` (`database_id`) | Production binding for future deploy |
| `DB` | `preview_database_id` → preview UUID | Used by `wrangler dev --remote` |
| `DB_PREVIEW` | `midnightmarketnews-preview` | Admin/migrations targeting only |

Worker application code uses **`env.DB` only**.

Confirmed during remote start:

```text
env.DB (60fa1e53-fced-40a9-943f-d0815b2b2d00)   ← preview UUID
```

Not the production database ID.

---

## 3. Schema migration result

```bash
npx wrangler d1 migrations apply midnightmarketnews-preview --remote
```

Result: `0001_initial_schema.sql` ✅

Preview tables match production application schema (8 tables):

- `events`
- `snapshots`
- `outcomes`
- `expected_vs_actual`
- `event_predictions`
- `market_reactions`
- `published_posts`
- `published_reactions`

No application data imported.

---

## 4. Remote Worker test result

```bash
npx wrangler dev --remote --ip 127.0.0.1 --port 8788
GET http://127.0.0.1:8788/test/remote-d1
```

**Result:** PASS

```json
{
  "status": "SUCCESS",
  "database": "PREVIEW",
  "steps": {
    "connect": "PASS",
    "insert": "PASS",
    "read": "PASS",
    "update": "PASS",
    "dependent_snapshot": "PASS",
    "dependent_outcome": "PASS",
    "nonexistent_lookup": "PASS",
    "duplicate_event_id": "PASS",
    "duplicate_link": "PASS",
    "foreign_key": "PASS",
    "cleanup": "PASS"
  }
}
```

---

## 5. Repository tests

Remote route used `src/cloudflare/d1/*` repositories:

- `saveEvent` / `getEvent` / `updateEventFinalAnalysis`
- `saveSnapshot` / `getLatestSnapshot`
- `saveOutcome` / `outcomeExists`
- `dbGet` for `SELECT 1`

No raw SQL business logic in `worker.js` for the test path (cleanup deletes ordered by FK).

---

## 6–9. Insert / read / update / cleanup

| Step | Status |
|------|--------|
| Insert test event | PASS |
| Read back (camelCase + JSON tags) | PASS |
| Update via `updateEventFinalAnalysis` | PASS |
| Cleanup dependents then parent | PASS |
| Post-cleanup `getEvent` → `null` | PASS |

Dependent rows also tested: event → snapshot, event → outcome.

---

## 10. Foreign-key test

Orphan snapshot insert → constraint error surfaced → PASS.

---

## 11. Duplicate constraint test

| Constraint | Status |
|------------|--------|
| Duplicate `events.event_id` | PASS |
| Duplicate `events.link` | PASS |

---

## 12. Production read-only verification

After remote tests, production (`midnightmarketnews`) counts:

| Table | COUNT(*) |
|-------|----------|
| events | 0 |
| snapshots | 0 |
| outcomes | 0 |
| expected_vs_actual | 0 |
| event_predictions | 0 |
| market_reactions | 0 |
| published_posts | 0 |
| published_reactions | 0 |

Also:

```sql
SELECT COUNT(*) FROM events WHERE event_id LIKE 'cloudflare-remote-test-%';
```

→ `0` on production.

Preview leftovers of the same pattern → `0` (cleanup succeeded).

---

## 13. Confirmation: production data untouched

- Remote Worker bound to **preview** D1 UUID during `wrangler dev --remote`
- No production inserts of test event IDs
- Production row counts remain empty / unchanged
- `npx wrangler deploy` was **not** run

---

## 14. Confirmation: no deployment

**NOT DEPLOYED**

---

## 15. Files created

- `src/cloudflare/d1/testRemoteD1.js`
- `CLOUDFLARE_MIGRATION_PHASE_5.md`

---

## 16. Files modified

- `wrangler.toml` — added `preview_database_id` + `DB_PREVIEW` binding for migrations
- `src/cloudflare/worker.js` — temporary `/test/remote-d1` used during testing, then **removed**; kept minimal `/health/db`

Repository test modules retained (not deleted):

- `src/cloudflare/d1/testD1Repositories.js` (Phase 4)
- `src/cloudflare/d1/testRemoteD1.js` (Phase 5)

---

## 17. Known issues

1. Wrangler CLI sometimes labels remote executes as “preview database” even when targeting production by name; verification used production UUID + zero test-row checks.
2. `DB_PREVIEW` exists only to allow `d1 migrations apply midnightmarketnews-preview`; Worker code does not use it.
3. Temporary remote test route was removed after success; re-add only if another remote smoke test is needed.
4. Cloudflare now advertises “remote bindings” as an alternative to `wrangler dev --remote`; Phase 5 used `--remote` as specified.

---

## Success criteria checklist

- [x] Preview D1 exists  
- [x] Preview schema matches production  
- [x] Worker remote development starts  
- [x] Worker connects to preview D1  
- [x] D1 repositories work remotely  
- [x] Insert / read / update / cleanup work  
- [x] Constraints work  
- [x] Production D1 untouched  
- [x] Local SQLite untouched  
- [x] No production deployment  
- [x] Temporary `/test/remote-d1` removed after testing  

**Phase 5 status:** COMPLETE — stop here; do not start Phase 6.
