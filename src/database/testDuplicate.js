const {
  saveCompleteEvent
} = require("./saveCompleteEvent");

const baseEvent = {
  eventId:
    "duplicate-test-" + Date.now(),

  title:
    "Bitcoin market test",

  source:
    "CoinDesk",

  link:
    "https://example.com/bitcoin-test",

  publishedAt:
    new Date().toISOString(),

  marketTags: [
    "crypto"
  ],

  affectedAssets: [
    "BTC"
  ],

  direction:
    "BULLISH",

  magnitude:
    "HIGH",

  eventType:
    "MACRO",

  timeframe:
    "SHORT_TERM",

  confidence:
    "MEDIUM",

  snapshots: [],

  outcomes: []
};


// First attempt
const first =
  saveCompleteEvent(
    baseEvent
  );

console.log(
  "\nFirst save:",
  first
);


// Second attempt
const second =
  saveCompleteEvent(
    {
      ...baseEvent,

      eventId:
        "another-event-id-" +
        Date.now()
    }
  );

console.log(
  "Second save:",
  second
);
