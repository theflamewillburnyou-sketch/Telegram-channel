const {
  buildMarketEvent
} = require("./marketEventBuilder");

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
  const event =
    await buildMarketEvent(article);

  console.log(
    "\n========== LIVE MARKET EVENT ==========\n"
  );

  console.dir(
    event,
    {
      depth: null
    }
  );
}

main().catch(error => {
  console.error(
    "Market event failed:",
    error.message
  );
});
