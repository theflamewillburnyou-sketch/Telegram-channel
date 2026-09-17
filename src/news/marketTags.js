const marketKeywords = {
  crypto: [
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
    "ethereum etf"
  ],

  oil: [
    "oil",
    "crude",
    "brent",
    "wti",
    "opec",
    "petroleum"
  ],

  energy: [
    "energy",
    "natural gas",
    "lng",
    "henry hub",
    "gas prices"
  ],

  gold: [
    "gold",
    "silver",
    "precious metals"
  ],

  copper: [
    "copper",
    "industrial metals",
    "base metals"
  ],

  usStocks: [
    "s&p",
    "nasdaq",
    "dow",
    "wall street",
    "us stocks",
    "nyse",
    "earnings",
    "ipo",
    "buyback",
    "stock split",
    "price target",
    "analyst upgrade",
    "analyst downgrade"
  ],

  europeStocks: [
    "ftse",
    "dax",
    "stoxx",
    "euro stoxx",
    "european stocks",
    "cac 40"
  ],

  indiaStocks: [
    "nifty",
    "sensex",
    "bank nifty",
    "indian stocks",
    "rbi",
    "sebi"
  ],

  macro: [
    "cpi",
    "inflation",
    "nonfarm",
    "payrolls",
    "nfp",
    "gdp",
    "pmi",
    "interest rate",
    "federal reserve",
    "fed"
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
  const title = (article.title || "").toLowerCase();
  const tags = [];

  for (const [market, keywords] of Object.entries(marketKeywords)) {
    const matchedKeyword = keywords.find((keyword) => {
      const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return pattern.test(title);
    });

    if (matchedKeyword) {
      console.log(`Market match: ${market} ← "${matchedKeyword}"`);
      tags.push(market);
    }
  }

  // Category fallback when title keywords miss
  if (tags.length === 0) {
    if (article.category === "crypto") {
      tags.push("crypto");
    }

    if (article.category === "markets" || article.category === "macro") {
      tags.push("usStocks");
      tags.push("globalMarkets");
    }

    if (article.category === "geopolitics") {
      tags.push("geopolitics");
    }

    if (article.category === "energy") {
      tags.push("oil");
      tags.push("energy");
    }

    if (article.category === "metals") {
      tags.push("gold");
    }

    if (article.category === "bonds" || article.category === "regulation") {
      tags.push("bonds");
      tags.push("usStocks");
    }
  }

  // Preference buckets used by future user filters
  if (
    tags.some((tag) =>
      ["usStocks", "indiaStocks", "europeStocks", "macro", "bonds"].includes(tag)
    )
  ) {
    tags.push("stockMarket");
  }

  if (tags.includes("crypto")) {
    tags.push("cryptoMarket");
  }

  if (
    tags.some((tag) => ["oil", "energy", "gold", "copper"].includes(tag))
  ) {
    tags.push("commoditiesMarket");
  }

  return [...new Set(tags)];
}

function addMarketTags(articles) {
  return articles.map((article) => {
    const marketTags = detectMarketTags(article);

    return {
      ...article,
      marketTags
    };
  });
}

module.exports = {
  detectMarketTags,
  addMarketTags,
  marketKeywords
};
