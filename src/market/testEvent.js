const {
  createMarketEvent,
  addSnapshot
} = require("./event");

const { getMarketPrice } = require("./prices");

async function main() {
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

  // Create the event
  let event = createMarketEvent(article);

  // Get live BTC price
  const btc = await getMarketPrice("BTC");

  // Add BTC snapshot
  event = addSnapshot(
    event,
    btc
  );

  // Get live ETH price
  const eth = await getMarketPrice("ETH");

  // Add ETH snapshot
  event = addSnapshot(
    event,
    eth
  );

  console.log(
    "\n========== MARKET EVENT ==========\n"
  );

  console.dir(event, {
    depth: null
  });
}

main().catch(error => {
  console.error(
    "Event creation failed:",
    error.message
  );
});
