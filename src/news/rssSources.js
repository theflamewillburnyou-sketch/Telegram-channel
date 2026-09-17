/**
 * Shared free RSS sources for Midnight Society.
 * Covers stocks, crypto, and commodities gap fills.
 * Keep URLs free/public only — no paid APIs.
 */

const NEWS_SOURCES = [
  // Geopolitics (can spill into all markets)
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

  // ----- STOCK MARKET (core) -----
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

  // Stock market — macro calendar / filings / corporate actions / Europe / futures
  {
    name: "Google News Macro Calendar",
    url: "https://news.google.com/rss/search?q=CPI+OR+inflation+OR+%22nonfarm+payrolls%22+OR+NFP+OR+GDP+OR+PMI+OR+%22interest+rate%22&hl=en-US&gl=US&ceid=US:en",
    category: "macro"
  },
  {
    name: "Google News Earnings Guidance",
    url: "https://news.google.com/rss/search?q=earnings+OR+guidance+OR+%22quarterly+results%22+OR+%22EPS%22&hl=en-US&gl=US&ceid=US:en",
    category: "markets"
  },
  {
    name: "Google News M&A IPO",
    url: "https://news.google.com/rss/search?q=IPO+OR+%22mergers+and+acquisitions%22+OR+takeover+OR+%22deal+to+buy%22&hl=en-US&gl=US&ceid=US:en",
    category: "markets"
  },
  {
    name: "Google News Corporate Actions",
    url: "https://news.google.com/rss/search?q=%22share+buyback%22+OR+dividend+OR+%22stock+split%22+OR+dilution+OR+%22share+repurchase%22&hl=en-US&gl=US&ceid=US:en",
    category: "markets"
  },
  {
    name: "Google News Europe Stocks",
    url: "https://news.google.com/rss/search?q=FTSE+OR+DAX+OR+STOXX+OR+%22European+stocks%22+OR+%22Euro+Stoxx%22&hl=en-GB&gl=GB&ceid=GB:en",
    category: "markets"
  },
  {
    name: "Google News India Markets",
    url: "https://news.google.com/rss/search?q=Nifty+OR+Sensex+OR+SEBI+OR+%22Indian+stocks%22+OR+RBI&hl=en-IN&gl=IN&ceid=IN:en",
    category: "markets"
  },
  {
    name: "Google News Analyst Ratings",
    url: "https://news.google.com/rss/search?q=%22analyst+upgrade%22+OR+%22analyst+downgrade%22+OR+%22price+target%22+OR+%22cuts+rating%22&hl=en-US&gl=US&ceid=US:en",
    category: "markets"
  },
  {
    name: "SEC Press Releases",
    url: "https://www.sec.gov/news/pressreleases.rss",
    category: "regulation"
  },
  {
    name: "Yahoo ES Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=ES=F&region=US&lang=en-US",
    category: "markets"
  },
  {
    name: "Yahoo NQ Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=NQ=F&region=US&lang=en-US",
    category: "markets"
  },

  // Bonds / central banks
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

  // ----- CRYPTO -----
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
  {
    name: "Google News Crypto Regulation",
    url: "https://news.google.com/rss/search?q=crypto+regulation+OR+%22SEC+crypto%22+OR+%22Bitcoin+ETF%22+OR+%22Ethereum+ETF%22+OR+stablecoin&hl=en-US&gl=US&ceid=US:en",
    category: "crypto"
  },
  {
    name: "Google News Crypto Exchange",
    url: "https://news.google.com/rss/search?q=Binance+OR+Coinbase+OR+%22crypto+exchange%22+OR+%22crypto+hack%22+OR+%22exchange+hack%22&hl=en-US&gl=US&ceid=US:en",
    category: "crypto"
  },
  {
    name: "Google News Crypto Macro",
    url: "https://news.google.com/rss/search?q=Bitcoin+OR+Ethereum+OR+Solana+OR+%22crypto+market%22&hl=en-US&gl=US&ceid=US:en",
    category: "crypto"
  },

  // ----- COMMODITIES (oil, gas, metals) -----
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
  {
    name: "Google News OPEC Oil",
    url: "https://news.google.com/rss/search?q=OPEC+OR+Brent+OR+WTI+OR+%22crude+oil%22+OR+%22oil+prices%22&hl=en-US&gl=US&ceid=US:en",
    category: "energy"
  },
  {
    name: "Google News Natural Gas LNG",
    url: "https://news.google.com/rss/search?q=%22natural+gas%22+OR+LNG+OR+%22gas+prices%22+OR+Henry+Hub&hl=en-US&gl=US&ceid=US:en",
    category: "energy"
  },
  {
    name: "Google News Metals",
    url: "https://news.google.com/rss/search?q=gold+OR+silver+OR+%22precious+metals%22+OR+copper+OR+%22industrial+metals%22&hl=en-US&gl=US&ceid=US:en",
    category: "metals"
  },
  {
    name: "Yahoo Gold Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC=F&region=US&lang=en-US",
    category: "metals"
  },
  {
    name: "Yahoo Silver Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SI=F&region=US&lang=en-US",
    category: "metals"
  },
  {
    name: "Yahoo Natural Gas Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=NG=F&region=US&lang=en-US",
    category: "energy"
  },
  {
    name: "Yahoo Copper Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=HG=F&region=US&lang=en-US",
    category: "metals"
  },
  {
    name: "Google News Commodities Supply",
    url: "https://news.google.com/rss/search?q=%22supply+disruption%22+OR+refinery+OR+pipeline+OR+%22strategic+petroleum%22+OR+%22oil+inventory%22&hl=en-US&gl=US&ceid=US:en",
    category: "energy"
  }
];

module.exports = {
  NEWS_SOURCES
};
