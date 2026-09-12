const marketKeywords = {
    crypto: [
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "crypto",
      "cryptocurrency",
      "stablecoin",
      "defi",
      "blockchain"
    ],
  
    oil: [
      "oil",
      "crude",
      "brent",
      "wti",
      "opec"
    ],
  
    energy: [
      "energy",
      "natural gas",
      "lng"
    ],
  
    gold: [
      "gold",
      "silver",
      "precious metals"
    ],
  
    usStocks: [
      "s&p",
      "nasdaq",
      "dow",
      "wall street",
      "us stocks"
    ],
  
    indiaStocks: [
      "nifty",
      "sensex",
      "bank nifty",
      "indian stocks",
      "rbi"
    ],
  
    forex: [
      "dollar",
      "usd",
      "rupee",
      "inr",
      "euro",
      "yen"
    ],
  
    bonds: [
      "treasury",
      "bond yields",
      "government bonds",
      "10-year yield"
    ],
  
    geopolitics: [
      "war",
      "conflict",
      "sanctions",
      "tariff",
      "trade war",
      "middle east",
      "iran",
      "israel",
      "russia",
      "ukraine",
      "china",
      "taiwan"
    ]
  };
  
  function detectMarketTags(article) {
    const title = article.title.toLowerCase();
  
    const tags = [];
  
    for (const [market, keywords] of Object.entries(marketKeywords)) {
      const matchedKeyword = keywords.find(keyword => {
        const pattern = new RegExp(
          `\\b${keyword}\\b`,
          "i"
        );
  
        return pattern.test(title);
      });
  
      if (matchedKeyword) {
        console.log(
          `Market match: ${market} ← "${matchedKeyword}"`
        );
  
        tags.push(market);
      }
    }
  
    // Use article category as a fallback
    if (tags.length === 0) {
      if (article.category === "crypto") {
        tags.push("crypto");
      }
  
      if (article.category === "markets") {
        tags.push("globalMarkets");
      }
  
      if (article.category === "geopolitics") {
        tags.push("geopolitics");
      }
    }
  
    return [...new Set(tags)];
  }
  
  function addMarketTags(articles) {
    return articles.map(article => {
      const marketTags = detectMarketTags(article);
  
      return {
        ...article,
        marketTags
      };
    });
  }
  
  module.exports = {
    detectMarketTags,
    addMarketTags
  };