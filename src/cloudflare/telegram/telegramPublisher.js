/**
 * Cloudflare Worker Telegram transport via Bot API HTTPS fetch.
 * Does not use node-telegram-bot-api.
 *
 * Pattern: publishTelegramMessage(env, message, options?)
 */

export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

function requireEnvValue(env, key) {
  const value = env?.[key];

  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${key} is not configured`);
  }

  return String(value);
}

function sanitizeTelegramError(status, bodyText, telegramDescription) {
  const description =
    telegramDescription ||
    (bodyText && bodyText.length < 300 ? bodyText : "Telegram request failed");

  return `Telegram API HTTP ${status}: ${description}`;
}

function parseTelegramJson(rawText) {
  if (!rawText || !String(rawText).trim()) {
    throw new Error("Telegram API returned an empty response");
  }

  try {
    return JSON.parse(rawText);
  } catch (_error) {
    throw new Error("Telegram API returned invalid JSON");
  }
}

/**
 * Low-level transport: send one HTML message via Telegram Bot API.
 *
 * @param {object} env - Worker env (TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID)
 * @param {string} message - HTML text (from postBuilder / marketReactionMessage)
 * @param {object} [options]
 * @param {string} [options.chatId] - override channel/chat
 * @param {string} [options.parseMode] - default "HTML"
 * @param {boolean} [options.disableLinkPreview] - default true
 * @param {typeof fetch} [options.fetchImpl] - injectable fetch for tests
 * @returns {Promise<{ok:true, messageId:number, chatId:number|string, result:object}>}
 */
export async function publishTelegramMessage(env, message, options = {}) {
  const token = requireEnvValue(env, "TELEGRAM_BOT_TOKEN");
  const chatId =
    options.chatId !== undefined && options.chatId !== null
      ? String(options.chatId)
      : requireEnvValue(env, "TELEGRAM_CHANNEL_ID");

  if (message === undefined || message === null || String(message).trim() === "") {
    throw new Error("Telegram message cannot be empty");
  }

  const text = String(message);

  if (text.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Telegram message exceeds ${TELEGRAM_MAX_MESSAGE_LENGTH} characters (${text.length})`
    );
  }

  const parseMode = options.parseMode || "HTML";
  const disableLinkPreview =
    options.disableLinkPreview === undefined
      ? true
      : Boolean(options.disableLinkPreview);

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    link_preview_options: {
      is_disabled: disableLinkPreview
    }
  };

  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new Error("fetch is not available");
  }

  // Token is used only to build the request URL and is never returned or logged.
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  let response;

  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw new Error(
      `Telegram API network error: ${String(error.message || error)}`
    );
  }

  const rawText = await response.text();
  let data;

  try {
    data = parseTelegramJson(rawText);
  } catch (error) {
    throw new Error(
      sanitizeTelegramError(response.status, rawText, error.message)
    );
  }

  if (!response.ok) {
    throw new Error(
      sanitizeTelegramError(
        response.status,
        rawText,
        data?.description
      )
    );
  }

  if (!data || data.ok !== true) {
    throw new Error(
      sanitizeTelegramError(
        response.status,
        rawText,
        data?.description || "ok was not true"
      )
    );
  }

  const result = data.result;

  if (!result || result.message_id === undefined || result.message_id === null) {
    throw new Error("Telegram API success response missing message_id");
  }

  return {
    ok: true,
    messageId: result.message_id,
    chatId: result.chat?.id ?? chatId,
    // Compatibility with local publisher callers that read message_id
    message_id: result.message_id,
    result
  };
}
