const marketAssets = {
    crypto: [
      "BTC",
      "ETH"
    ],
  
    oil: [
      "BRENT",
      "WTI"
    ],
  
    energy: [
      "NATURAL_GAS",
      "ENERGY_STOCKS"
    ],
  
    gold: [
      "GOLD",
      "SILVER"
    ],
  
    usStocks: [
      "S&P_500",
      "NASDAQ",
      "DOW"
    ],
  
    indiaStocks: [
      "NIFTY_50",
      "BANK_NIFTY",
      "SENSEX"
    ],
  
    forex: [
      "USD",
      "EUR",
      "JPY",
      "INR"
    ],
  
    bonds: [
      "US_10Y",
      "US_2Y"
    ],
  
    geopolitics: [
      "GLOBAL_MARKETS"
    ]
  };
  
  function mapAssets(marketTags) {
    const assets = [];
  
    for (const tag of marketTags) {
      const mappedAssets = marketAssets[tag];
  
      if (mappedAssets) {
        assets.push(...mappedAssets);
      }
    }
  
    return [...new Set(assets)];
  }
  
  function addAssetMapping(articles) {
    return articles.map(article => {
      const affectedAssets = mapAssets(article.marketTags);
  
      return {
        ...article,
        affectedAssets
      };
    });
  }
  
  module.exports = {
    mapAssets,
    addAssetMapping
  };