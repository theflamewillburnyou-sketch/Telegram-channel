const {
  getMarketReaction
} = require("../database/reactionRepository");

const {
  buildTelegramPost
} = require("./postBuilder");


const eventId =
  "mty177mzvf4lpw";


const reaction =
  getMarketReaction(
    eventId,
    "1H"
  );


console.log(
  "\n========== STORED MARKET REACTION ==========\n"
);

console.log(reaction);


if (!reaction) {
  throw new Error(
    "Market reaction not found"
  );
}


const event = {
  title:
    "Saudi Arabia shuts key oil pipeline after drone attack launched from Iraq",

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


const report = {
  overall:
    reaction.overall,

  expectedDirection:
    reaction.expected_direction,

  confirmed:
    reaction.confirmed,

  divergences:
    reaction.divergences,

  neutral:
    reaction.neutral,

  confirmingAssets:
    reaction.confirming_assets
      ? JSON.parse(reaction.confirming_assets)
      : [],

  divergingAssets:
    reaction.diverging_assets
      ? JSON.parse(reaction.diverging_assets)
      : [],

  neutralAssets:
    reaction.neutral_assets
      ? JSON.parse(reaction.neutral_assets)
      : []
};


const message =
  buildTelegramPost(
    event,
    report
  );


console.log(
  "\n========== TELEGRAM POST FROM SQLITE ==========\n"
);

console.log(message);
