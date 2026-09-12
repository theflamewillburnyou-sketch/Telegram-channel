const {
  db,
  initializeDatabase
} = require("../database/database");

initializeDatabase();

const {
  createOutcome
} = require("../market/outcome");

const {
  createExpectedVsActual
} = require("../market/expectedVsActual");

const {
  saveOutcome,
  saveExpectedVsActual
} = require("../database/outcomeRepository");

const {
  processMarketReaction
} = require("./reactionWorker");


const event = {
  eventId: "reaction-test-1789200761318",
  direction: "BULLISH"
};


const initialSnapshot = {
  symbol: "BRENT",
  price: 100,
  currency: "USD",
  timestamp: "2026-09-12T06:12:41.318Z"
};


const laterSnapshot = {
  symbol: "BRENT",
  price: 105,
  currency: "USD",
  timestamp: "2026-09-12T08:12:41.318Z"
};


async function runTest() {

  console.log(
    "\n========== INTEGRATION TEST ==========\n"
  );


  /*
   * 1. Create outcome
   */

  const outcome =
    createOutcome(
      event,
      initialSnapshot,
      laterSnapshot,
      "1H"
    );

  console.log(
    "Outcome created:"
  );

  console.log(outcome);


  /*
   * 2. Save outcome
   */

  saveOutcome(outcome);

  console.log(
    "\nOutcome saved."
  );


  /*
   * 3. Expected vs Actual
   */

  const expectedVsActual =
    createExpectedVsActual(
      event.direction,
      outcome
    );

  console.log(
    "\nExpected vs Actual:"
  );

  console.log(expectedVsActual);


  /*
   * 4. Save Expected vs Actual
   */

  saveExpectedVsActual(
    event.eventId,
    expectedVsActual,
    "1H"
  );

  console.log(
    "\nExpected vs Actual saved."
  );


  /*
   * 5. Market Reaction
   */

  const reaction =
    processMarketReaction(
      event,
      "1H"
    );

  console.log(
    "\n========== MARKET REACTION ==========\n"
  );

  console.log(reaction);


  /*
   * 6. Verify database
   */

  const reactionRow =
    db.prepare(`
      SELECT *
      FROM market_reactions
      WHERE event_id = ?
        AND horizon = ?
    `).get(
      event.eventId,
      "1H"
    );


  console.log(
    "\n========== DATABASE VERIFICATION ==========\n"
  );

  console.log(reactionRow);


  console.log(
    "\n========== TEST COMPLETE ==========\n"
  );
}


runTest().catch(error => {

  console.error(
    "\nTEST ERROR:",
    error.message
  );

});
