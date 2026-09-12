const {
  saveEvent,
  getEvent
} = require("./eventRepository");

const {
  saveSnapshot,
  saveOutcome,
  getEventSnapshots,
  getEventOutcomes
} = require("./marketRepository");

const event = {
  eventId:
    "market-test-" + Date.now(),

  title:
    "Bitcoin market test event",

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

  direction:
    "BULLISH",

  magnitude:
    "HIGH",

  eventType:
    "MACRO",

  timeframe:
    "SHORT_TERM",

  confidence:
    "MEDIUM"
};


// Save event
saveEvent(event);


// Event snapshot
const snapshot = {
  symbol: "BTC",

  price: 77000,

  currency: "USD",

  timestamp:
    new Date().toISOString()
};

saveSnapshot(
  event.eventId,
  snapshot
);


// Outcome
const outcome = {
  symbol: "BTC",

  horizon: "1H",

  eventPrice: 77000,

  outcomePrice: 78540,

  percentageChange: 2,

  direction: "UP",

  eventTimestamp:
    snapshot.timestamp,

  outcomeTimestamp:
    new Date().toISOString(),

  expectedVsActual: {
    expected: "BULLISH",

    actual: "UP",

    result: "CONFIRMED"
  }
};

saveOutcome(
  event.eventId,
  outcome
);


// Read everything back
console.log(
  "\n========== EVENT ==========\n"
);

console.dir(
  getEvent(event.eventId),
  { depth: null }
);

console.log(
  "\n========== SNAPSHOTS ==========\n"
);

console.dir(
  getEventSnapshots(event.eventId),
  { depth: null }
);

console.log(
  "\n========== OUTCOMES ==========\n"
);

console.dir(
  getEventOutcomes(event.eventId),
  { depth: null }
);
