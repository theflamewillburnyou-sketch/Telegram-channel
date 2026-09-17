/**
 * Lightweight Cloudflare unit checks (no live Telegram send, no production D1 writes).
 * Run: node src/cloudflare/test/smokeUnit.js
 */
import { getConfig, hasDedicatedTelegramTestDestination } from "../config.js";
import { shouldUseAI } from "../ai/aiFilter.js";
import { createRuleFallback } from "../ai/ruleFallback.js";
import { validateAnalysis } from "../ai/validateAnalysis.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const env = {
  TELEGRAM_BOT_TOKEN: "x",
  TELEGRAM_CHANNEL_ID: "-1001",
  CF_MAX_NEW_EVENTS: "5"
};

const config = getConfig(env);
assert(config.maxNewEventsPerRun === 5, "config bounds");
assert(hasDedicatedTelegramTestDestination(env) === false, "no test chat");

assert(shouldUseAI({ priorityScore: 9 }) === true, "AI for high priority");
assert(shouldUseAI({ priorityScore: 3 }) === false, "rules for low priority");

const fallback = createRuleFallback({
  title: "Test",
  direction: "BULLISH",
  impactLevel: "HIGH",
  timeframe: "SHORT_TERM",
  affectedAssets: ["BTC"]
});

const validation = validateAnalysis(fallback);
assert(validation.valid === true, "rule fallback validates");

console.log(
  JSON.stringify({
    status: "SUCCESS",
    checks: [
      "config",
      "test_destination_gate",
      "ai_filter",
      "rule_fallback_validation"
    ]
  })
);
