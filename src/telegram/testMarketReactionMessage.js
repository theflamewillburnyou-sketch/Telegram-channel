const {
  formatMarketReactionMessage
} = require("./marketReactionMessage");


const report = {

  overall: "MIXED",

  expectedDirection:
    "BULLISH",

  confirmingAssets: [
    "BTC"
  ],

  divergingAssets: [
    "ETH"
  ],

  neutralAssets: [],

  reactions: [

    {
      symbol: "BTC",
      percentageChange: 2.4
    },

    {
      symbol: "ETH",
      percentageChange: -1.2
    }

  ]

};


const message =
  formatMarketReactionMessage(
    report
  );


console.log(message);
