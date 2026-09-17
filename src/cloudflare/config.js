/**
 * Cloudflare Worker configuration access.
 * Never uses process.env — only Worker env bindings/secrets.
 */

const REQUIRED_FOR_TELEGRAM = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHANNEL_ID"
];

export function getEnvString(env, key, fallback = "") {
  const value = env?.[key];

  if (value === undefined || value === null) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

export function requireEnvString(env, key) {
  const value = getEnvString(env, key, "");

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
}

export function getConfig(env) {
  return {
    telegramBotToken: getEnvString(env, "TELEGRAM_BOT_TOKEN"),
    telegramChannelId: getEnvString(env, "TELEGRAM_CHANNEL_ID"),
    telegramTestChannelId: getEnvString(
      env,
      "TELEGRAM_TEST_CHANNEL_ID",
      getEnvString(env, "TELEGRAM_TEST_CHAT_ID")
    ),
    telegramMaxPostsPerJob: Number(
      getEnvString(env, "TELEGRAM_MAX_POSTS_PER_JOB", "1")
    ),
    telegramMinMinutesBetweenPosts: Number(
      getEnvString(env, "TELEGRAM_MIN_MINUTES_BETWEEN_POSTS", "10")
    ),
    oilPriceApiKey: getEnvString(env, "OILPRICEAPI_KEY"),
    googleApiKey: getEnvString(
      env,
      "GOOGLE_API_KEY",
      getEnvString(env, "GEMINI_API_KEY")
    ),
    geminiModel: getEnvString(env, "GEMINI_MODEL", "gemini-2.0-flash"),
    groqApiKey: getEnvString(env, "GROQ_API_KEY"),
    groqModel: getEnvString(env, "GROQ_MODEL", "llama-3.1-8b-instant"),
    openRouterApiKey: getEnvString(env, "OPENROUTER_API_KEY"),
    openRouterModel: getEnvString(env, "OPENROUTER_MODEL", "openrouter/free"),
    openRouterSiteUrl: getEnvString(
      env,
      "OPENROUTER_SITE_URL",
      "https://midnight-society.local"
    ),
    openRouterAppName: getEnvString(
      env,
      "OPENROUTER_APP_NAME",
      "Midnight Society"
    ),
    aiProviderOrder: getEnvString(
      env,
      "AI_PROVIDER_ORDER",
      "GEMINI,GROQ,OPENROUTER"
    ),
    aiProviderMaxRetries: Number(
      getEnvString(env, "AI_PROVIDER_MAX_RETRIES", "1")
    ),
    // Conservative Worker bounds
    maxRssSourcesPerRun: Number(getEnvString(env, "CF_MAX_RSS_SOURCES", "8")),
    maxNewEventsPerRun: Number(getEnvString(env, "CF_MAX_NEW_EVENTS", "5")),
    maxAiCallsPerRun: Number(getEnvString(env, "CF_MAX_AI_CALLS", "3")),
    maxMarketEventsPerRun: Number(getEnvString(env, "CF_MAX_MARKET_EVENTS", "10")),
    maxSymbolsPerEvent: Number(getEnvString(env, "CF_MAX_SYMBOLS_PER_EVENT", "4"))
  };
}

export function assertTelegramConfigured(env) {
  for (const key of REQUIRED_FOR_TELEGRAM) {
    requireEnvString(env, key);
  }
}

export function hasDedicatedTelegramTestDestination(env) {
  const config = getConfig(env);
  return Boolean(config.telegramTestChannelId);
}
