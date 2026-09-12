const {
  getEventsWithSnapshots
} = require("../database/eventRepository");

const {
  processEventOutcomes
} = require("./outcomeWorker");

async function runOutcomeJob() {
  console.log(
    "\n========== OUTCOME JOB START ==========\n"
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

      await processEventOutcomes(event);
    }

    console.log(
      "\n========== OUTCOME JOB COMPLETE ==========\n"
    );

  } catch (error) {
    console.error(
      "\nOUTCOME JOB ERROR:",
      error.message
    );
  }
}

module.exports = {
  runOutcomeJob
};
