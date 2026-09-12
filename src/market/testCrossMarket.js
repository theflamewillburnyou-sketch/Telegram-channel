const {
  analyzeCrossMarketReaction
} = require("./crossMarket");


const reactions = [

  {
    symbol: "BTC",

    expectedVsActual: {
      result: "CONFIRMED"
    }
  },

  {
    symbol: "ETH",

    expectedVsActual: {
      result: "DIVERGENCE"
    }
  },

  {
    symbol: "GOLD",

    expectedVsActual: {
      result: "CONFIRMED"
    }
  }

];


const result =
  analyzeCrossMarketReaction(
    reactions
  );


console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);
