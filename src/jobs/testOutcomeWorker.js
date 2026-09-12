const {
  processEventOutcomes
} = require("./outcomeWorker");

const event = {
  eventId: "mty177mzvf4lpw",

  affectedAssets: [
    "BRENT",
    "WTI"
  ],

  direction: "BULLISH"
};

processEventOutcomes(event)
  .then(() => {
    console.log(
      "\n========== WORKER TEST COMPLETE ==========\n"
    );
  })
  .catch(error => {
    console.error(
      "\nWORKER ERROR:",
      error
    );
  });
