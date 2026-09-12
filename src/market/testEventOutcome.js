const {
  createMarketEvent,
  addSnapshot
} = require("./event");

const {
  processEventOutcome
} = require("./eventOutcome");

const article = {
  title:
    "Metaplanet cuts executive reward pool by 41%",

  source: "CoinDesk",

  publishedAt:
    new Date().toISOString(),

  marketTags: ["crypto"],

  affectedAssets: [
    "BTC",
    "ETH"
  ],

  finalAnalysis: {
    final: {
      direction: "BULLISH",
      magnitude: "LOW",
      eventType: "CORPORATE_ACTION",
      timeframe: "MEDIUM_TERM",
      finalConfidence: "LOW"
    }
  }
};

// Create event
let event =
  createMarketEvent(article);


// ------------------------------------
// EVENT-TIME SNAPSHOT
// ------------------------------------

const btcEventSnapshot = {
  symbol: "BTC",
  price: 77000,
  currency: "USD",
  timestamp:
    "2026-09-12T06:00:00.000Z"
};

event =
  addSnapshot(
    event,
    btcEventSnapshot
  );


// ------------------------------------
// 1 HOUR LATER
// ------------------------------------

const btcOneHourSnapshot = {
  symbol: "BTC",
  price: 78540,
  currency: "USD",
  timestamp:
    "2026-09-12T07:00:00.000Z"
};


// ------------------------------------
// PROCESS OUTCOME
// ------------------------------------

event =
  processEventOutcome(
    event,
    btcEventSnapshot,
    btcOneHourSnapshot,
    "1H",
    "BULLISH"
  );


// ------------------------------------
// OUTPUT
// ------------------------------------

console.log(
  "\n========== EVENT OUTCOME ==========\n"
);

console.dir(
  event,
  {
    depth: null
  }
);
