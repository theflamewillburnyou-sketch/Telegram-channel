const {
  getEventsWithSnapshots
} = require("../database/eventRepository");

const {
  getOutcomesByHorizon
} = require("../database/marketRepository");

const {
  reactionExists
} = require("../database/reactionRepository");

const {
  processMarketReaction
} = require("./reactionWorker");


const HORIZONS = [
  "1H",
  "1D",
  "1W"
];


async function runReactionJob() {

  console.log(
    "\n========== REACTION JOB START ==========\n"
  );


  try {

    const events =
      getEventsWithSnapshots();


    console.log(
      `Events with market snapshots: ${events.length}`
    );


    for (const event of events) {

      console.log(
        `\nProcessing event: ${event.eventId}`
      );


      for (const horizon of HORIZONS) {

        const outcomes =
          getOutcomesByHorizon(
            event.eventId,
            horizon
          );


        if (outcomes.length === 0) {

          console.log(
            `${horizon}: no outcomes yet`
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
            `${horizon}: market reaction already exists`
          );

          continue;
        }


        console.log(
          `${horizon}: outcome exists but reaction is missing`
        );


        const result =
          processMarketReaction(
            event,
            horizon
          );


        console.log(
          `${horizon}: reaction result`
        );

        console.log(result);

      }

    }


    console.log(
      "\n========== REACTION JOB COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nREACTION JOB ERROR:",
      error.message
    );

  }

}


module.exports = {
  runReactionJob
};
