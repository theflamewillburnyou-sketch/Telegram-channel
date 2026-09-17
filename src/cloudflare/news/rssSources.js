/**
 * RSS source list for Worker news ingestion.
 * Copied from src/news/fetchNews.js (name, url, category only).
 */
export const NEWS_SOURCES = [
  // Geopolitics
  {
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "geopolitics"
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    category: "geopolitics"
  },

  // World stocks / markets
  {
    name: "BBC Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "markets"
  },
  {
    name: "CNBC Top News",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    category: "markets"
  },
  {
    name: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    category: "markets"
  },
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    category: "markets"
  },

  // Bonds / central banks (official)
  {
    name: "Federal Reserve",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    category: "bonds"
  },
  {
    name: "ECB",
    url: "https://www.ecb.europa.eu/rss/press.html",
    category: "bonds"
  },

  // Crypto
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    category: "crypto"
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    category: "crypto"
  },
  {
    name: "The Block",
    url: "https://www.theblock.co/rss.xml",
    category: "crypto"
  },

  // Power & energy
  {
    name: "EIA Today in Energy",
    url: "https://www.eia.gov/rss/todayinenergy.xml",
    category: "energy"
  },
  {
    name: "OilPrice",
    url: "https://oilprice.com/rss/main",
    category: "energy"
  },

  // Precious metals
  {
    name: "Google News Metals",
    url: "https://news.google.com/rss/search?q=gold+OR+silver+OR+%22precious+metals%22&hl=en-US&gl=US&ceid=US:en",
    category: "metals"
  },
  {
    name: "Yahoo Gold Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC=F&region=US&lang=en-US",
    category: "metals"
  }
];
