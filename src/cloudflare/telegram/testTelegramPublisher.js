/**
 * Phase 6 — mocked Telegram transport + ledger sequence tests.
 * Does NOT call the real Telegram API.
 *
 * Run:
 *   node --experimental-default-type=module src/cloudflare/telegram/testTelegramPublisher.js
 */
import {
  publishTelegramMessage,
  TELEGRAM_MAX_MESSAGE_LENGTH
} from "./telegramPublisher.js";

import {
  publishAndRecordPost,
  publishAndRecordReaction
} from "./publishWithLedger.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fakeEnv(overrides = {}) {
  return {
    TELEGRAM_BOT_TOKEN: "TEST_BOT_TOKEN_NOT_REAL",
    TELEGRAM_CHANNEL_ID: "-1009999999999",
    ...overrides
  };
}

function mockFetch(handler) {
  return async (url, init) => {
    // Never leak token into assertions via accidental logging of URL.
    assert(
      typeof url === "string" && url.includes("/bot") && url.endsWith("/sendMessage"),
      "unexpected Telegram URL shape"
    );
    assert(!String(init?.body || "").includes("TEST_BOT_TOKEN_NOT_REAL"), "token leaked into body");

    return handler(url, init);
  };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    }
  };
}

async function run() {
  const steps = [];

  // 1. Successful Telegram response
  {
    const fetchImpl = mockFetch(async (_url, init) => {
      const body = JSON.parse(init.body);
      assert(body.parse_mode === "HTML", "parse_mode should be HTML");
      assert(body.link_preview_options?.is_disabled === true, "link preview should be disabled");
      assert(body.chat_id === "-1009999999999", "chat_id mismatch");
      assert(body.text.includes("<b>"), "HTML bold should be preserved");

      return jsonResponse(200, {
        ok: true,
        result: {
          message_id: 4242,
          chat: { id: -1009999999999 }
        }
      });
    });

    const result = await publishTelegramMessage(
      fakeEnv(),
      "🚨 <b>BREAKING</b>\n\n<b>Test headline</b>\n\n— <i>Midnight Society</i>",
      { fetchImpl }
    );

    assert(result.ok === true, "success ok");
    assert(result.messageId === 4242, "messageId");
    assert(result.message_id === 4242, "message_id compat");
    assert(result.chatId === -1009999999999, "chatId");
    steps.push({ step: "successful_response", status: "PASS" });
  }

  // 2–5. HTTP errors
  for (const status of [400, 401, 403, 429]) {
    const fetchImpl = mockFetch(async () =>
      jsonResponse(status, {
        ok: false,
        description: `http_${status}`
      })
    );

    let failed = false;
    try {
      await publishTelegramMessage(fakeEnv(), "hello", { fetchImpl });
    } catch (error) {
      failed = true;
      assert(String(error.message).includes(`HTTP ${status}`), `status ${status} in error`);
      assert(!String(error.message).includes("TEST_BOT_TOKEN"), "token must not appear in error");
      assert(!String(error.message).includes("/botTEST_"), "tokenized URL must not appear");
    }

    assert(failed, `HTTP ${status} should throw`);
    steps.push({ step: `http_${status}`, status: "PASS" });
  }

  // 6. Telegram JSON ok=false with HTTP 200
  {
    const fetchImpl = mockFetch(async () =>
      jsonResponse(200, {
        ok: false,
        description: "Bad Request: chat not found"
      })
    );

    let failed = false;
    try {
      await publishTelegramMessage(fakeEnv(), "hello", { fetchImpl });
    } catch (error) {
      failed = true;
      assert(String(error.message).includes("chat not found"), "description surfaced");
    }

    assert(failed, "ok=false should throw");
    steps.push({ step: "telegram_ok_false", status: "PASS" });
  }

  // 7. empty / invalid JSON
  {
    const emptyFetch = mockFetch(async () => ({
      ok: true,
      status: 200,
      async text() {
        return "";
      }
    }));

    let emptyFailed = false;
    try {
      await publishTelegramMessage(fakeEnv(), "hello", { fetchImpl: emptyFetch });
    } catch (_error) {
      emptyFailed = true;
    }
    assert(emptyFailed, "empty response should throw");

    const invalidFetch = mockFetch(async () => ({
      ok: true,
      status: 200,
      async text() {
        return "<html>nope</html>";
      }
    }));

    let invalidFailed = false;
    try {
      await publishTelegramMessage(fakeEnv(), "hello", { fetchImpl: invalidFetch });
    } catch (_error) {
      invalidFailed = true;
    }
    assert(invalidFailed, "invalid JSON should throw");
    steps.push({ step: "empty_invalid_response", status: "PASS" });
  }

  // 8. missing TELEGRAM_BOT_TOKEN
  {
    let failed = false;
    try {
      await publishTelegramMessage(
        fakeEnv({ TELEGRAM_BOT_TOKEN: "" }),
        "hello",
        {
          fetchImpl: mockFetch(async () => {
            throw new Error("fetch should not be called");
          })
        }
      );
    } catch (error) {
      failed = true;
      assert(String(error.message).includes("TELEGRAM_BOT_TOKEN"), "token error");
    }
    assert(failed, "missing token should throw");
    steps.push({ step: "missing_bot_token", status: "PASS" });
  }

  // 9. missing TELEGRAM_CHANNEL_ID
  {
    let failed = false;
    try {
      await publishTelegramMessage(
        fakeEnv({ TELEGRAM_CHANNEL_ID: "" }),
        "hello",
        {
          fetchImpl: mockFetch(async () => {
            throw new Error("fetch should not be called");
          })
        }
      );
    } catch (error) {
      failed = true;
      assert(String(error.message).includes("TELEGRAM_CHANNEL_ID"), "channel error");
    }
    assert(failed, "missing channel should throw");
    steps.push({ step: "missing_channel_id", status: "PASS" });
  }

  // 10–11. HTML parse mode + link preview preserved (also covered in success)
  {
    let captured;
    const fetchImpl = mockFetch(async (_url, init) => {
      captured = JSON.parse(init.body);
      return jsonResponse(200, {
        ok: true,
        result: { message_id: 1, chat: { id: 1 } }
      });
    });

    await publishTelegramMessage(
      fakeEnv(),
      `<b>Headline</b>\n<a href="https://example.com">x</a>`,
      { fetchImpl }
    );

    assert(captured.parse_mode === "HTML", "HTML parse mode");
    assert(captured.link_preview_options.is_disabled === true, "preview disabled");
    assert(captured.text.includes("<b>Headline</b>"), "HTML unchanged");
    steps.push({ step: "html_and_link_preview", status: "PASS" });
  }

  // Message length guard
  {
    let failed = false;
    try {
      await publishTelegramMessage(
        fakeEnv(),
        "x".repeat(TELEGRAM_MAX_MESSAGE_LENGTH + 1),
        {
          fetchImpl: mockFetch(async () => {
            throw new Error("should not send oversized message");
          })
        }
      );
    } catch (error) {
      failed = true;
      assert(String(error.message).includes("exceeds"), "length error");
    }
    assert(failed, "oversize should throw");
    steps.push({ step: "message_length_guard", status: "PASS" });
  }

  // Ledger: Telegram success/failure vs published_* writes
  {
    const env = fakeEnv({
      DB: {
        prepare(_sql) {
          return {
            bind() {
              return this;
            },
            async first() {
              return null;
            },
            async run() {
              return { success: true };
            },
            async all() {
              return { results: [] };
            }
          };
        }
      }
    });

    let savedPost = null;
    const okResult = await publishAndRecordPost(env, "evt-ledger-ok", "<b>x</b>", {
      send: async () => ({ ok: true, messageId: 55, message_id: 55, chatId: 1 }),
      save: async (_env, eventId, messageId) => {
        savedPost = { eventId, messageId };
      }
    });

    assert(okResult.published === true, "ledger success published");
    assert(savedPost?.messageId === 55, "ledger saved after success");
    steps.push({ step: "ledger_success_saves_post", status: "PASS" });

    let savedOnFailure = false;
    let failed = false;
    try {
      await publishAndRecordPost(env, "evt-ledger-fail", "<b>x</b>", {
        send: async () => {
          throw new Error("Telegram API HTTP 500: boom");
        },
        save: async () => {
          savedOnFailure = true;
        }
      });
    } catch (_error) {
      failed = true;
    }

    assert(failed, "ledger failure should throw");
    assert(savedOnFailure === false, "must not save published_posts on Telegram failure");
    steps.push({ step: "ledger_failure_skips_post", status: "PASS" });

    let savedReaction = null;
    const reactionOk = await publishAndRecordReaction(
      env,
      "evt-reaction-ok",
      "1H",
      "<b>reaction</b>",
      {
        send: async () => ({ ok: true, messageId: 88, message_id: 88, chatId: 1 }),
        save: async (_env, eventId, horizon, messageId) => {
          savedReaction = { eventId, horizon, messageId };
        }
      }
    );

    assert(reactionOk.published === true, "reaction ledger success");
    assert(savedReaction?.horizon === "1H", "reaction horizon saved");
    steps.push({ step: "ledger_success_saves_reaction", status: "PASS" });

    let savedReactionOnFailure = false;
    let reactionFailed = false;
    try {
      await publishAndRecordReaction(env, "evt-reaction-fail", "1D", "<b>x</b>", {
        send: async () => {
          throw new Error("Telegram API HTTP 403: forbidden");
        },
        save: async () => {
          savedReactionOnFailure = true;
        }
      });
    } catch (_error) {
      reactionFailed = true;
    }

    assert(reactionFailed, "reaction ledger failure should throw");
    assert(
      savedReactionOnFailure === false,
      "must not save published_reactions on Telegram failure"
    );
    steps.push({ step: "ledger_failure_skips_reaction", status: "PASS" });
  }

  console.log(
    JSON.stringify(
      {
        status: "SUCCESS",
        steps
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(
    JSON.stringify(
      {
        status: "ERROR",
        message: String(error.message || error)
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});
