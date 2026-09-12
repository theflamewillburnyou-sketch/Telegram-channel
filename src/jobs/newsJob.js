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

const {
  sortByPublishPriority,
  MAX_POSTS_PER_JOB
} = require("../telegram/publishPacing");


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


    const publishCandidates = [];


    for (const event of newEvents) {

      console.log(
        `\nProcessing new event: ${event.title}`
      );

      try {

        /*
         * 1. Build initial market snapshots
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
         * 3. Save snapshots
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


        /*
         * 4. Analyze event
         */

        const analysisResult =
          await analyzeEvent(
            marketEvent
          );

        console.log(
          "Analysis result:",
          analysisResult.success
        );


        /*
         * 5. Reload latest DB version
         *    (do not publish yet — human pacing)
         */

        const savedEvent =
          getEvent(
            marketEvent.eventId
          );


        if (savedEvent) {
          publishCandidates.push(
            savedEvent
          );
        }

      } catch (error) {

        console.error(
          `Failed to process event: ${event.title}`,
          error.message
        );

      }
    }


    /*
     * 6. Human publishing:
     *    pick the strongest story only
     */

    const rankedCandidates =
      sortByPublishPriority(
        publishCandidates
      );

    console.log(
      `\nPublish candidates: ${rankedCandidates.length}`
    );

    console.log(
      `Max posts this run: ${MAX_POSTS_PER_JOB}`
    );


    let publishedCount = 0;


    for (const candidate of rankedCandidates) {

      if (
        publishedCount >=
        MAX_POSTS_PER_JOB
      ) {
        console.log(
          "Holding remaining stories for later — keeps the channel human"
        );
        break;
      }

      console.log(
        `\nConsidering for Telegram: ${candidate.title} (score ${candidate.priorityScore})`
      );

      const publishResult =
        await publishEvent(
          candidate
        );

      console.log(
        "Publish result:",
        publishResult
      );

      if (publishResult.published) {
        publishedCount += 1;
      }

      if (
        publishResult.reason ===
        "PACING_COOLDOWN"
      ) {
        console.log(
          "Channel cooldown active — remaining stories wait"
        );
        break;
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
