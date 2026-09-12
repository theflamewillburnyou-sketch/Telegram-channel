const {
  analyzeMarketReaction
} = require("./marketReaction");


const event = {
  eventId: "test-event-001",
  direction: "BULLISH"
};


const outcomes = [

  {
    symbol: "BTC",
    percentageChange: 2.1,
    direction: "UP"
  },

  {
    symbol: "ETH",
    percentageChange: 1.4,
    direction: "UP"
  }

];


const result =
  analyzeMarketReaction(
    event,
    outcomes
  );


console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);
