const cron = require("node-cron");

const {
  getEventsWithSnapshots
} = require("../database/eventRepository");

const {
  processEventOutcomes
} = require("./outcomeWorker");

const {
  processMarketReaction
} = require("./reactionWorker");

const {
  getOutcomesByHorizon
} = require("../database/marketRepository");

const {
  reactionExists
} = require("../database/reactionRepository");

const {
  publishMarketReactions
} = require("./reactionPublishWorker");


const HORIZONS = [
  "1H",
  "1D",
  "1W"
];


async function runMarketJob() {

  console.log(
    "\n========== MARKET JOB START ==========\n"
  );


  try {

    const events =
      getEventsWithSnapshots();


    console.log(
      `Events with market snapshots: ${events.length}`
    );


    /*
     * STEP 1
     * Process outcomes
     */

    for (const event of events) {

      console.log(
        `\nProcessing outcomes: ${event.eventId}`
      );

      await processEventOutcomes(event);

    }


    /*
     * STEP 2
     * Process missing reactions
     */

    for (const event of events) {

      console.log(
        `\nProcessing reactions: ${event.eventId}`
      );


      for (const horizon of HORIZONS) {

        const outcomes =
          getOutcomesByHorizon(
            event.eventId,
            horizon
          );


        if (outcomes.length === 0) {

          console.log(
            `${horizon}: no outcome`
          );

          continue;
        }


        if (
          reactionExists(
            event.eventId,
            horizon
          )
        ) {

          console.log(
            `${horizon}: reaction already exists`
          );

          continue;
        }


        console.log(
          `${horizon}: creating market reaction`
        );


        const result =
          processMarketReaction(
            event,
            horizon
          );


        console.log(result);

      }

    }


    /*
     * STEP 3
     * Publish reaction updates (dry-run)
     */

    await publishMarketReactions();


    console.log(
      "\n========== MARKET JOB COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nMARKET JOB ERROR:",
      error.message
    );

  }

}


cron.schedule(
  "*/5 * * * *",
  runMarketJob
);


module.exports = {
  runMarketJob
};
