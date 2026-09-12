const {
  createMarketReactionReport
} = require("./marketReactionReport");


const event = {

  eventId:
    "event-001",

  direction:
    "BULLISH"

};


const outcomes = [

  {
    symbol: "BTC",

    percentageChange:
      2.4,

    direction:
      "UP"
  },

  {
    symbol: "ETH",

    percentageChange:
      -1.2,

    direction:
      "DOWN"
  }

];


const report =
  createMarketReactionReport(
    event,
    outcomes
  );


console.log(
  JSON.stringify(
    report,
    null,
    2
  )
);
