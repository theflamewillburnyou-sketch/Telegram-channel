const marketAssets = {
  crypto: ["BTC", "ETH", "SOL"],

  oil: ["BRENT", "WTI"],

  energy: ["NATURAL_GAS", "ENERGY_STOCKS"],

  gold: ["GOLD", "SILVER"],

  copper: ["COPPER"],

  usStocks: ["S&P_500", "NASDAQ", "DOW", "ES_FUTURES"],

  europeStocks: ["FTSE_100", "DAX", "EURO_STOXX_50"],

  indiaStocks: ["NIFTY_50", "BANK_NIFTY", "SENSEX"],

  macro: ["S&P_500", "NASDAQ", "US_10Y"],

  forex: ["USD", "EUR", "JPY", "INR"],

  bonds: ["US_10Y", "US_2Y"],

  geopolitics: ["GLOBAL_MARKETS"],

  stockMarket: ["S&P_500", "NASDAQ", "DOW"],

  cryptoMarket: ["BTC", "ETH"],

  commoditiesMarket: ["BRENT", "WTI", "GOLD", "SILVER", "NATURAL_GAS", "COPPER"]
};

function mapAssets(marketTags) {
  const assets = [];

  for (const tag of marketTags || []) {
    const mappedAssets = marketAssets[tag];

    if (mappedAssets) {
      assets.push(...mappedAssets);
    }
  }

  return [...new Set(assets)];
}

function addAssetMapping(articles) {
  return articles.map((article) => {
    const affectedAssets = mapAssets(article.marketTags);

    return {
      ...article,
      affectedAssets
    };
  });
}

module.exports = {
  mapAssets,
  addAssetMapping,
  marketAssets
};
