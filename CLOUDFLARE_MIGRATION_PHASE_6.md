# Midnight Society — Cloudflare Migration Phase 6

**Phase:** 6 (Cloudflare Telegram HTTPS publisher)  
**Date:** 2026-09-17  
**Scope:** `fetch()` Bot API transport + D1 ledger helpers + mocked tests  
**External Telegram send:** Not performed  
**Production deploy:** Not performed  

---

## 1. Existing Telegram functions inspected

| File | Role |
|------|------|
| `telegramPublisher.js` | `publishMessage(message)` via `node-telegram-bot-api` `bot.api.sendMessage` |
| `postBuilder.js` | `buildTelegramPost(event, marketReactionReport?)` → HTML string |
| `postType.js` | `detectPostType(event)` |
| `publishDecision.js` | `shouldPublish(event)` — priority ≥ 8.5 |
| `publishEligibility.js` | `isFreshEvent(event)` |
| `publishPacing.js` | pacing / sort helpers (uses local `publishRepository`) |
| `marketReactionMessage.js` | `buildMarketReactionMessage(event, reaction)` → HTML |

**Existing send options (preserved):**

- `parse_mode: "HTML"`
- `link_preview_options: { is_disabled: true }`
- `chat_id` from `TELEGRAM_CHANNEL_ID`
- callers use `result.message_id` after success, then write ledger

**Callers (unchanged):** `publishJob.js`, `reactionPublishWorker.js`

---

## 2. New Cloudflare publisher

| File | Purpose |
|------|---------|
| `src/cloudflare/telegram/telegramPublisher.js` | `publishTelegramMessage(env, message, options?)` |
| `src/cloudflare/telegram/publishWithLedger.js` | `publishAndRecordPost` / `publishAndRecordReaction` |
| `src/cloudflare/telegram/testTelegramPublisher.js` | Mocked unit tests |
| `src/cloudflare/package.json` | `{ "type": "module" }` so Node can run Cloudflare ESM tests |

Transport uses **`fetch()` only** — not `node-telegram-bot-api`.

---

## 3. Telegram API endpoint

```text
POST https://api.telegram.org/bot<TOKEN>/sendMessage
Content-Type: application/json
```

JSON body:

- `chat_id`
- `text`
- `parse_mode: "HTML"`
- `link_preview_options: { is_disabled: true }`

Token appears only in the request URL construction and is never logged or returned.

---

## 4. env / secrets usage

| Value | Source |
|-------|--------|
| Bot token | `env.TELEGRAM_BOT_TOKEN` |
| Channel/chat | `env.TELEGRAM_CHANNEL_ID` (or `options.chatId`) |

- No `process.env` in Cloudflare publisher
- No secrets in `wrangler.toml` / `vars`
- No token printed by tests or errors

---

## 5. Error handling

Throws sanitized errors for:

- missing token / channel
- empty message
- message longer than 4096 chars
- network failure
- HTTP non-OK
- JSON `ok !== true`
- empty / invalid JSON
- missing `message_id` on success

Error text includes HTTP status + Telegram `description` when present.  
Does **not** include bot token or tokenized API URLs.

---

## 6. Response normalization

Success return shape:

```js
{
  ok: true,
  messageId,   // from Telegram result.message_id
  chatId,      // from result.chat.id when present
  message_id,  // compatibility alias
  result       // raw Telegram message object
}
```

---

## 7. Message formatting compatibility

- Builders (`postBuilder`, `marketReactionMessage`) **not modified**
- HTML (`<b>`, `<i>`, links) passed through unchanged
- `parse_mode: "HTML"` preserved
- Link preview disabled preserved
- Soft length guard at Telegram’s 4096 limit (throw, do not mid-tag truncate)

---

## 8. Local mock test results

```bash
node src/cloudflare/telegram/testTelegramPublisher.js
```

**Result:** `status: SUCCESS` — all steps PASS:

- successful response
- HTTP 400 / 401 / 403 / 429
- Telegram `ok: false`
- empty / invalid JSON
- missing token / channel
- HTML + link preview preservation
- message length guard
- ledger success → save post/reaction
- ledger failure → **no** ledger write

---

## 9. Remote external Telegram test

**SKIPPED**

Reason:

> Telegram external test skipped because no dedicated test chat/channel was configured.

Project env only defines production-oriented `TELEGRAM_CHANNEL_ID` (no `TELEGRAM_TEST_CHANNEL_ID` / dedicated test chat).  
Per Phase 6 rules, no message was sent to the real Midnight Society channel.  
No `/test/telegram` route was added. No Worker secrets were written for this phase.

---

## 10. D1 ledger behavior

Helpers in `publishWithLedger.js`:

1. Optional duplicate check (`isPublished` / `isReactionPublished`)
2. `publishTelegramMessage` (or injectable `send`)
3. **Only on success** → `savePublishedPost` / `savePublishedReaction`

Telegram failure → ledger unchanged (verified in mocks).

Uses `src/cloudflare/d1/publishRepository.js` and `reactionPublishRepository.js` by default — not local SQLite repos.

---

## 11. Local Node Telegram path status

**UNCHANGED**

- `src/telegram/telegramPublisher.js` intact
- `node-telegram-bot-api` still in root `package.json`
- `publishJob.js` / `reactionPublishWorker.js` still use local publisher

---

## 12. Files created

- `src/cloudflare/telegram/telegramPublisher.js`
- `src/cloudflare/telegram/publishWithLedger.js`
- `src/cloudflare/telegram/testTelegramPublisher.js`
- `src/cloudflare/package.json`
- `CLOUDFLARE_MIGRATION_PHASE_6.md`

---

## 13. Files modified

- None of the existing `src/telegram/*` application modules
- No job files
- No schema / D1 production data
- Worker not modified in this phase (no live send route)

---

## 14. Deployment status

**NOT PERFORMED** (`npx wrangler deploy` not run)

---

## 15. Known issues

1. External Telegram send deferred until a dedicated test chat/channel is configured.
2. Job wiring (`publishJob` → Cloudflare publisher) intentionally not done yet.
3. `publishPacing.js` still depends on local SQLite; Cloudflare pacing adapter is a later phase.
4. `src/cloudflare/package.json` (`type: module`) is only to run Cloudflare ESM unit tests under Node; root app remains CommonJS.

---

## Success criteria checklist

- [x] Cloudflare Telegram publisher exists (`fetch`)
- [x] Does not use `node-telegram-bot-api`
- [x] Uses `env` secrets fields
- [x] Errors handled / success validated
- [x] Local mocked tests pass
- [x] No ledger write on failed send
- [x] Local Telegram publisher intact
- [x] No production Telegram message
- [x] No production D1 writes
- [x] No production Worker deploy

**Phase 6 status:** COMPLETE — stop here; do not start Phase 7.
