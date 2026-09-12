const relevantKeywords = [
    // Crypto
    "bitcoin",
    "btc",
    "ethereum",
    "crypto",
    "cryptocurrency",
    "stablecoin",
    "defi",
    "blockchain",
  
    // Oil & energy
    "oil",
    "crude",
    "brent",
    "wti",
    "opec",
    "natural gas",
    "energy",
  
    // Gold & metals
    "gold",
    "silver",
    "precious metals",
  
    // US markets
    "s&p",
    "nasdaq",
    "dow",
    "fed",
    "federal reserve",
    "treasury",
    "interest rates",
    "inflation",
    "cpi",
    "jobs",
  
    // Indian markets
    "nifty",
    "sensex",
    "bank nifty",
    "rbi",
    "rupee",
    "fii",
    "dii",
  
    // Global markets
    "stocks",
    "stock market",
    "shares",
    "equities",
    "bond market",
  
    // Geopolitics
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
  ];
  
  function isRelevant(article) {
    const text = article.title.toLowerCase();
  
    return relevantKeywords.some(keyword =>
      text.includes(keyword)
    );
  }
  
  function filterRelevantArticles(articles) {
    return articles.filter(isRelevant);
  }
  
  module.exports = {
    isRelevant,
    filterRelevantArticles
  };