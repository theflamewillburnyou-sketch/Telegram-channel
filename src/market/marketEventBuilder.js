const {
  createMarketEvent,
  addSnapshot
} = require("./event");

const {
  getMarketPriceFromProviders
} = require("./prices");


async function buildMarketEvent(article) {
  let event =
    createMarketEvent(article);

  for (
    const symbol
    of event.affectedAssets
  ) {
    try {
      const marketData =
        await getMarketPriceFromProviders(symbol);

      event =
        addSnapshot(
          event,
          marketData
        );

    } catch (error) {
      console.log(
        `Skipping market data for ${symbol}:`,
        error.message
      );
    }
  }

  console.log(
    `Market snapshots collected: ${event.snapshots.length}`
  );

  return event;
}

module.exports = {
  buildMarketEvent
};
