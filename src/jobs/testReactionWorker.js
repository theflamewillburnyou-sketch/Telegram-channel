const {
  processMarketReaction
} = require("./reactionWorker");

const event = {
  eventId: "mty177mzvf4lpw",
  direction: "BULLISH"
};

const result =
  processMarketReaction(
    event,
    "1H"
  );

console.log(
  "\n========== MARKET REACTION RESULT ==========\n"
);

console.log(result);
