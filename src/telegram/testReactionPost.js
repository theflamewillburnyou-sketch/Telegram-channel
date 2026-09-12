const {
  buildTelegramPost
} = require("./postBuilder");

const event = {
  title: "Saudi Arabia shuts key oil pipeline after drone attack launched from Iraq",

  whyItMatters:
    "The pipeline closure directly disrupts crude supply infrastructure and increases geopolitical risk around oil markets.",

  direction: "BULLISH",
  magnitude: "HIGH",
  timeframe: "IMMEDIATE",
  confidence: "MEDIUM",

  source: "BBC",

  link: "https://example.com",

  postType: "BREAKING"
};


const marketReactionReport = {
  overall: "CONFIRMED",

  expectedDirection: "BULLISH",

  confirmed: 1,

  divergences: 0,

  neutral: 0,

  confirmingAssets: [
    "BRENT"
  ],

  divergingAssets: [],

  neutralAssets: []
};


const message =
  buildTelegramPost(
    event,
    marketReactionReport
  );


console.log(
  "\n========== TELEGRAM POST PREVIEW ==========\n"
);

console.log(message);
