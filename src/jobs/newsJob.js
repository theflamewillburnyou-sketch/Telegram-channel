const cron = require("node-cron");

const {
  fetchNews
} = require("../news/fetchNews");

const {
  processNews
} = require("../news/processNews");

const {
  eventExistsByLink,
  saveEvent,
  getEvent
} = require("../database/eventRepository");

const {
  buildMarketEvent
} = require("../market/marketEventBuilder");

const {
  saveSnapshot
} = require("../database/marketRepository");

const {
  analyzeEvent
} = require("./eventAnalysisWorker");

const {
  publishEvent
} = require("./publishJob");


async function runNewsJob() {

  console.log(
    "\n========== NEWS JOB START ==========\n"
  );

  try {

    /*
     * 1. Fetch RSS articles
     */

    const rawArticles =
      await fetchNews();

    console.log(
      `Articles fetched: ${rawArticles.length}`
    );


    /*
     * 2. Process articles
     */

    const events =
      processNews(rawArticles);

    console.log(
      `Events created: ${events.length}`
    );


    /*
     * 3. Ignore events already in database
     */

    const newEvents =
      events.filter(event => {

        if (
          !event.link
        ) {
          return true;
        }

        return !eventExistsByLink(
          event.link
        );

      });


    console.log(
      `New events: ${newEvents.length}`
    );


    for (const event of newEvents) {

      console.log(
        `\nProcessing new event: ${event.title}`
      );

      try {

        /*
         * 1. Build market event
         */

        const marketEvent =
          await buildMarketEvent(event);


        /*
         * 2. Save event
         */

        saveEvent(
          marketEvent
        );


        /*
         * 3. Save initial market snapshots
         */

        for (
          const snapshot
          of marketEvent.snapshots
        ) {

          saveSnapshot(
            marketEvent.eventId,
            snapshot
          );

        }


        console.log(
          `Event saved: ${marketEvent.eventId}`
        );

        console.log(
          `Snapshots saved: ${marketEvent.snapshots.length}`
        );


        // 4. Analyze event

        const analysisResult =
          await analyzeEvent(
            marketEvent
          );

        console.log(
          "Analysis result:",
          analysisResult.success
        );


        // 5. Reload latest DB version

        const savedEvent =
          getEvent(
            marketEvent.eventId
          );


        // 6. Publish if eligible

        if (savedEvent) {

          const publishResult =
            await publishEvent(
              savedEvent
            );

          console.log(
            "Publish result:",
            publishResult
          );

        }

      } catch (error) {

        console.error(
          `Failed to process event: ${event.title}`,
          error.message
        );

      }
    }


    console.log(
      "\n========== NEWS JOB COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nNEWS JOB ERROR:",
      error.message
    );

  }
}


cron.schedule(
  "*/5 * * * *",
  runNewsJob
);


module.exports = {
  runNewsJob
};
