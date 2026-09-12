const {
  getLatestSnapshot
} = require("../database/marketRepository");

const {
  getMarketPrice
} = require("./prices");

const {
  createOutcome
} = require("./outcome");


async function test() {
  const event = {
    eventId: "mty177mzvf4lpw"
  };

  const symbol = "BRENT";

  console.log("\n========== INITIAL SNAPSHOT ==========\n");

  const initialSnapshot =
    getLatestSnapshot(
      event.eventId,
      symbol
    );

  console.log(initialSnapshot);


  console.log("\n========== CURRENT MARKET PRICE ==========\n");

  const laterSnapshot =
    await getMarketPrice(symbol);

  console.log(laterSnapshot);


  console.log("\n========== OUTCOME ==========\n");

  const outcome =
    createOutcome(
      event,
      initialSnapshot,
      laterSnapshot,
      "1H"
    );

  console.log(outcome);
}


test().catch(error => {
  console.error(
    "\nERROR:",
    error.message
  );
});
