const {
  saveEvent,
  getEvent,
  getAllEvents
} = require("./eventRepository");

const event = {
  eventId:
    "test-" + Date.now(),

  title:
    "Test Midnight Society Event",

  source:
    "CoinDesk",

  publishedAt:
    new Date().toISOString(),

  marketTags: [
    "crypto"
  ],

  affectedAssets: [
    "BTC",
    "ETH"
  ],

  direction:
    "BULLISH",

  magnitude:
    "LOW",

  eventType:
    "CORPORATE_ACTION",

  timeframe:
    "MEDIUM_TERM",

  confidence:
    "LOW"
};


// Save
saveEvent(event);

console.log(
  "\nEvent saved successfully."
);


// Get the same event
const savedEvent =
  getEvent(event.eventId);

console.log(
  "\n========== SAVED EVENT ==========\n"
);

console.dir(
  savedEvent,
  {
    depth: null
  }
);


// Get all events
const allEvents =
  getAllEvents();

console.log(
  "\nTotal events:",
  allEvents.length
);
