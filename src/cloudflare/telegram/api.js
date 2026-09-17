/**
 * Low-level Telegram Bot API caller for Workers.
 * Never logs tokens or full secret-bearing URLs.
 */

function requireToken(env) {
  const token = env?.TELEGRAM_BOT_TOKEN;

  if (!token || !String(token).trim()) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  return String(token);
}

export async function callTelegramApi(env, method, payload = {}, options = {}) {
  const token = requireToken(env);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const url = `https://api.telegram.org/bot${token}/${method}`;

  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  let data;

  try {
    data = JSON.parse(rawText);
  } catch (_error) {
    throw new Error(`Telegram API HTTP ${response.status}: invalid JSON`);
  }

  if (!response.ok || data.ok !== true) {
    const description = data?.description || "Telegram request failed";
    const error = new Error(`Telegram API HTTP ${response.status}: ${description}`);
    error.status = response.status;
    error.telegramDescription = description;
    throw error;
  }

  return data.result;
}
