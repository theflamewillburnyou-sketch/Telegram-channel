const {
  buildTelegramPost
} = require("./postBuilder");


const event = {

  title:
    "Bitcoin ETF sees strong institutional inflows",

  whyItMatters:
    "Institutional flows can influence crypto market liquidity and sentiment.",

  direction:
    "BULLISH",

  magnitude:
    "HIGH",

  timeframe:
    "SHORT_TERM",

  confidence:
    "MEDIUM",

  source:
    "CoinDesk",

  link:
    "https://example.com",

  eventType:
    "ETF",

  marketTags:
    ["crypto"],

  priorityLevel:
    "HIGH"

};


const marketReactionReport = {

  overall:
    "MIXED",

  confirmingAssets: [
    "BTC"
  ],

  divergingAssets: [
    "ETH"
  ],

  neutralAssets: []

};


const post =
  buildTelegramPost(
    event,
    marketReactionReport
  );


console.log(post);
