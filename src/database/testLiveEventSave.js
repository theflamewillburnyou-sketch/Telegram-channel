const {
  buildMarketEvent
} = require("../market/marketEventBuilder");

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

async function main() {
  // Build event using LIVE prices
  const event =
    await buildMarketEvent(article);

  // Save event + snapshots
  const eventId =
    saveCompleteEvent(event);

  console.log(
    "\n========== LIVE EVENT SAVED ==========\n"
  );

  console.log(
    "Event ID:",
    eventId
  );

  console.log(
    "Snapshots saved:",
    event.snapshots.length
  );

  console.dir(
    event.snapshots,
    {
      depth: null
    }
  );
}

main().catch(error => {
  console.error(
    "Failed:",
    error.message
  );
});
