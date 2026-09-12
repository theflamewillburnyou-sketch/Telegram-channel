const {
  createMarketEvent,
  addSnapshot
} = require("../market/event");

const {
  processEventOutcome
} = require("../market/eventOutcome");

const {
  saveCompleteEvent
} = require("./saveCompleteEvent");

const article = {
  title:
    "Metaplanet cuts executive reward pool by 41%",

  source:
    "CoinDesk",

  publishedAt:
    new Date().toISOString(),

  marketTags: [
    "crypto"
  ],

  affectedAssets: [
    "BTC"
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


// ----------------------------------
// CREATE EVENT
// ----------------------------------

let event =
  createMarketEvent(article);


// ----------------------------------
// REAL EVENT-TIME BTC PRICE
// ----------------------------------

const btcEventSnapshot = {
  symbol: "BTC",

  price: 77000,

  currency: "USD",

  timestamp:
    new Date().toISOString()
};

event =
  addSnapshot(
    event,
    btcEventSnapshot
  );


// ----------------------------------
// SIMULATED 1H PRICE
// ----------------------------------

const btcOneHourSnapshot = {
  symbol: "BTC",

  price: 78540,

  currency: "USD",

  timestamp:
    new Date(
      Date.now() + 60 * 60 * 1000
    ).toISOString()
};


// ----------------------------------
// CREATE OUTCOME
// ----------------------------------

event =
  processEventOutcome(
    event,

    btcEventSnapshot,

    btcOneHourSnapshot,

    "1H",

    "BULLISH"
  );


// ----------------------------------
// SAVE EVERYTHING
// ----------------------------------

const eventId =
  saveCompleteEvent(event);


console.log(
  "\n========== EVENT SAVED ==========\n"
);

console.log(
  "Event ID:",
  eventId
);

console.log(
  "Snapshots:",
  event.snapshots.length
);

console.log(
  "Outcomes:",
  event.outcomes.length
);
