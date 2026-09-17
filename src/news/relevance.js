const relevantKeywords = [
  // Crypto
  "bitcoin",
  "btc",
  "ethereum",
  "eth",
  "solana",
  "crypto",
  "cryptocurrency",
  "stablecoin",
  "defi",
  "blockchain",
  "binance",
  "coinbase",
  "bitcoin etf",
  "ethereum etf",
  "crypto hack",
  "exchange hack",

  // Oil & energy / commodities
  "oil",
  "crude",
  "brent",
  "wti",
  "opec",
  "natural gas",
  "lng",
  "energy",
  "petroleum",
  "refinery",
  "pipeline",
  "copper",
  "industrial metals",

  // Gold & metals
  "gold",
  "silver",
  "precious metals",

  // US / global stocks
  "s&p",
  "nasdaq",
  "dow",
  "nyse",
  "wall street",
  "earnings",
  "guidance",
  "ipo",
  "merger",
  "acquisition",
  "takeover",
  "buyback",
  "dividend",
  "stock split",
  "price target",
  "analyst upgrade",
  "analyst downgrade",
  "sec",

  // Macro calendar
  "fed",
  "federal reserve",
  "treasury",
  "interest rates",
  "inflation",
  "cpi",
  "jobs",
  "nonfarm",
  "payrolls",
  "nfp",
  "gdp",
  "pmi",

  // Europe stocks
  "ftse",
  "dax",
  "stoxx",
  "european stocks",

  // Indian markets
  "nifty",
  "sensex",
  "bank nifty",
  "rbi",
  "sebi",
  "rupee",
  "fii",
  "dii",

  // Global markets
  "stocks",
  "stock market",
  "shares",
  "equities",
  "bond market",
  "futures",

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
  const text = (article.title || "").toLowerCase();

  return relevantKeywords.some((keyword) => text.includes(keyword));
}

function filterRelevantArticles(articles) {
  return articles.filter(isRelevant);
}

module.exports = {
  isRelevant,
  filterRelevantArticles,
  relevantKeywords
};
