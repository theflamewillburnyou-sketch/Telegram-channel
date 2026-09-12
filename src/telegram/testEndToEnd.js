const {
  shouldPublish
} = require("./publishDecision");

const {
  buildTelegramPost
} = require("./postBuilder");

const {
  publishMessage
} = require("./telegramPublisher");

const {
  isPublished,
  savePublishedPost
} = require("../database/publishRepository");

const {
  saveEvent,
  getEvent
} = require("../database/eventRepository");


// 1. Create a test event

const event = {

  eventId:
    "test_bitcoin_etf_001",

  title:
    "Bitcoin ETF sees strong institutional inflows",

  whyItMatters:
    "Institutional inflows may affect crypto liquidity and market sentiment.",

  direction:
    "BULLISH",

  magnitude:
    "HIGH",

  timeframe:
    "SHORT_TERM",

  confidence:
    "MEDIUM",

  eventType:
    "ETF",

  marketTags:
    ["crypto"],

  affectedAssets:
    ["BTC", "ETH"],

  priorityScore:
    8,

  priorityLevel:
    "HIGH",

  noveltyScore:
    100,

  noveltyLevel:
    "HIGH",

  source:
    "CoinDesk",

  link:
    "https://example.com/bitcoin-etf-test"
};


// Ensure event exists in DB (for published_posts foreign key)
if (!getEvent(event.eventId)) {
  saveEvent(event);
}


// 2. Already published?

const alreadyPublished =
  isPublished(
    event.eventId
  );


if (alreadyPublished) {

  console.log(
    "Event has already been published."
  );

  process.exit(0);
}


// 3. Decide whether to publish

const publish =
  shouldPublish(event);


console.log(
  "Should publish:",
  publish
);


if (!publish) {

  console.log(
    "Event rejected by publish decision."
  );

  process.exit(0);
}


// 4. Build Telegram message

const message =
  buildTelegramPost(
    event,
    null
  );


console.log(
  "\n========== TELEGRAM MESSAGE ==========\n"
);

console.log(message);


// 5. Publish

async function run() {

  try {

    const result =
      await publishMessage(
        message
      );


    savePublishedPost(
      event.eventId,
      result.message_id
    );


    console.log(
      "\nTelegram message sent successfully."
    );

    console.log(
      "Message ID:",
      result.message_id
    );

  } catch (error) {

    console.error(
      "\nTelegram publishing failed:",
      error.message
    );

  }

}


run();
