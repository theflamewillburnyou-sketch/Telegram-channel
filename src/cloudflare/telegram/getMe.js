import { getConfig, requireEnvString } from "../config.js";

/**
 * Telegram getMe authentication check (does not send a channel message).
 */
export async function getTelegramMe(env, options = {}) {
  const token = requireEnvString(env, "TELEGRAM_BOT_TOKEN");
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const url = `https://api.telegram.org/bot${token}/getMe`;

  const response = await fetchImpl(url, { method: "GET" });
  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch (_error) {
    throw new Error(`Telegram getMe HTTP ${response.status}: invalid JSON`);
  }

  if (!response.ok || data.ok !== true) {
    throw new Error(
      `Telegram getMe HTTP ${response.status}: ${data.description || "failed"}`
    );
  }

  return {
    ok: true,
    botUsername: data.result?.username || null,
    botId: data.result?.id || null
  };
}

export function resolveTelegramTestChatId(env) {
  const config = getConfig(env);
  return config.telegramTestChannelId || null;
}
