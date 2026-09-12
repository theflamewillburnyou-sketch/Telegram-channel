const {
  getInitialSnapshot
} = require("../database/marketRepository");

const {
  saveOutcome,
  outcomeExists,
  saveExpectedVsActual
} = require("../database/outcomeRepository");

const {
  getMarketPriceFromProviders
} = require("../market/prices");

const {
  createOutcome
} = require("../market/outcome");

const {
  createExpectedVsActual
} = require("../market/expectedVsActual");

const {
  OUTCOME_HORIZONS
} = require("../market/outcomeHorizon");

const {
  processMarketReaction
} = require("./reactionWorker");

const {
  getPrediction
} = require("../database/predictionRepository");


async function processEventOutcomes(event) {

  const prediction =
    getPrediction(event.eventId);

  if (!prediction) {
    console.log(
      `${event.eventId}: no frozen prediction found`
    );

    return;
  }

  const horizons = [
    OUTCOME_HORIZONS.ONE_HOUR,
    OUTCOME_HORIZONS.ONE_DAY,
    OUTCOME_HORIZONS.ONE_WEEK
  ];

  for (const horizon of horizons) {
    console.log(
      `\n========== ${horizon.name} CHECK ==========\n`
    );

    for (const symbol of event.affectedAssets) {
      try {

        /*
         * 1. Get original snapshot
         */

        const initialSnapshot =
          getInitialSnapshot(
            event.eventId,
            symbol
          );

        if (!initialSnapshot) {
          console.log(
            `${symbol}: no initial snapshot`
          );

          continue;
        }


        /*
         * 2. Check whether horizon has elapsed
         */

        const initialTime =
          new Date(
            initialSnapshot.timestamp
          ).getTime();

        const elapsed =
          Date.now() - initialTime;

        if (elapsed < horizon.milliseconds) {
          console.log(
            `${symbol}: ${horizon.name} not reached yet`
          );

          continue;
        }


        /*
         * 3. Check duplicate
         */

        const alreadyExists =
          outcomeExists(
            event.eventId,
            symbol,
            horizon.name
          );

        if (alreadyExists) {
          console.log(
            `${symbol}: ${horizon.name} outcome already exists`
          );

          continue;
        }


        /*
         * 4. Get fresh market data
         */

        console.log(
          `${symbol}: fetching price for ${horizon.name}...`
        );

        const laterSnapshot =
          await getMarketPriceFromProviders(
            symbol,
            initialSnapshot.timestamp
          );


        /*
         * 5. Create outcome
         */

        const outcome =
          createOutcome(
            event,
            initialSnapshot,
            laterSnapshot,
            horizon.name
          );


        /*
         * 6. Save outcome
         */

        saveOutcome(outcome);

        console.log(
          `${symbol}: ${horizon.name} outcome saved`
        );

        console.log(outcome);


        /*
         * 7. Expected vs Actual
         */

        const expectedVsActual =
          createExpectedVsActual(
            prediction.direction,
            outcome
          );


        saveExpectedVsActual(
          event.eventId,
          expectedVsActual,
          horizon.name
        );


        console.log(
          "\n========== EXPECTED VS ACTUAL ==========\n"
        );

        console.log(expectedVsActual);


        /*
         * 8. Market Reaction
         */

        const marketReaction =
          processMarketReaction(
            event,
            horizon.name
          );


        console.log(
          "\n========== MARKET REACTION ==========\n"
        );

        console.log(marketReaction);

      } catch (error) {

        console.error(
          `${symbol}: ${horizon.name} failed:`,
          error.message
        );

      }
    }
  }
}


module.exports = {
  processEventOutcomes
};
