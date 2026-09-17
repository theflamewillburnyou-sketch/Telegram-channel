/**
 * Unit checks for welcome + preference matching (no live Telegram).
 * Run: node src/cloudflare/test/welcomePreferenceUnit.js
 */
import {
  buildWelcomeMessage,
  getEventMarketBuckets,
  preferenceMatchesEvent
} from "../telegram/welcome.js";
import { PREFERENCES } from "../d1/subscriberRepository.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const welcome = buildWelcomeMessage("Shawn");
assert(welcome.includes("Shawn"), "welcome includes name");
assert(welcome.includes("Midnight Society"), "welcome includes brand");

assert(
  preferenceMatchesEvent(PREFERENCES.STOCKS, {
    marketTags: ["usStocks", "stockMarket"],
    title: "Apple earnings beat"
  }),
  "stocks match"
);

assert(
  !preferenceMatchesEvent(PREFERENCES.STOCKS, {
    marketTags: ["crypto", "cryptoMarket"],
    title: "Bitcoin ETF inflows"
  }),
  "stocks exclude crypto"
);

assert(
  preferenceMatchesEvent(PREFERENCES.ALL, {
    marketTags: ["oil"],
    title: "Brent jumps"
  }),
  "all matches commodities"
);

assert(
  getEventMarketBuckets({
    marketTags: ["gold", "commoditiesMarket"]
  }).includes(PREFERENCES.COMMODITIES),
  "commodities bucket"
);

console.log(
  JSON.stringify({
    status: "SUCCESS",
    checks: ["welcome", "stocks_filter", "crypto_exclude", "all", "commodities"]
  })
);
