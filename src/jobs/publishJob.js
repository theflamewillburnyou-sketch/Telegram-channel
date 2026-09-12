const cron = require("node-cron");

const {
  getAllEvents
} = require("../database/eventRepository");

const {
  isPublished,
  savePublishedPost
} = require("../database/publishRepository");

const {
  shouldPublish
} = require("../telegram/publishDecision");

const {
  isFreshEvent
} = require("../telegram/publishEligibility");

const {
  buildTelegramPost
} = require("../telegram/postBuilder");

const {
  publishMessage
} = require("../telegram/telegramPublisher");

const {
  savePredictionIfNeeded
} = require("../prediction/savePredictionIfNeeded");

const {
  getPacingStatus,
  sortByPublishPriority,
  MAX_POSTS_PER_JOB
} = require("../telegram/publishPacing");


async function publishEvent(event) {

  console.log(
    `\nChecking event for publication: ${event.eventId}`
  );

  const eventId =
    event.eventId;


  // 1. Duplicate protection

  if (isPublished(eventId)) {

    console.log(
      "Already published — skipping"
    );

    return {
      published: false,
      reason: "ALREADY_PUBLISHED"
    };
  }


  // 2. Freshness

  if (!isFreshEvent(event)) {

    console.log(
      "Event is too old — skipping"
    );

    return {
      published: false,
      reason: "EVENT_TOO_OLD"
    };
  }


  // 3. Publication decision

  if (!shouldPublish(event)) {

    console.log(
      "Publish decision: NO"
    );

    return {
      published: false,
      reason: "NOT_ELIGIBLE"
    };
  }


  // 4. Human pacing — avoid dumping many posts at once

  const pacing =
    getPacingStatus();

  if (!pacing.allowed) {

    const waitMinutes =
      Math.ceil(
        pacing.waitMs / 60000
      );

    console.log(
      `Pacing — waiting ~${waitMinutes} min before next channel post`
    );

    return {
      published: false,
      reason: "PACING_COOLDOWN",
      waitMs: pacing.waitMs
    };
  }


  // 5. Freeze prediction

  const predictionResult =
    savePredictionIfNeeded(
      eventId,
      {
        final: {
          direction:
            event.direction || "NEUTRAL",

          magnitude:
            event.magnitude || "LOW",

          eventType:
            event.eventType || "OTHER",

          timeframe:
            event.timeframe || "MEDIUM_TERM",

          finalConfidence:
            event.confidence || "LOW"
        }
      }
    );


  console.log(
    "Prediction:",
    predictionResult
  );


  // 6. Build post

  const message =
    buildTelegramPost(
      event
    );


  if (!message) {

    return {
      published: false,
      reason: "EMPTY_MESSAGE"
    };
  }


  // 7. Final publication safety check

  if (!event.title) {
    return {
      published: false,
      reason: "MISSING_TITLE"
    };
  }

  if (!event.source) {
    return {
      published: false,
      reason: "MISSING_SOURCE"
    };
  }

  if (!event.link) {
    return {
      published: false,
      reason: "MISSING_SOURCE_LINK"
    };
  }


  console.log(
    "\n========== FINAL TELEGRAM MESSAGE ==========\n"
  );

  console.log(message);


  // 8. Publish

  const result =
    await publishMessage(
      message
    );


  // 9. Save publication record

  savePublishedPost(
    eventId,
    result.message_id
  );


  console.log(
    `Published successfully: ${result.message_id}`
  );


  return {
    published: true,
    telegramMessageId:
      result.message_id
  };
}


async function runPublishJob() {

  console.log(
    "\n========== PUBLISH JOB START ==========\n"
  );

  try {

    const events =
      sortByPublishPriority(
        getAllEvents()
      );

    console.log(
      `Events found: ${events.length}`
    );

    console.log(
      `Max posts this run: ${MAX_POSTS_PER_JOB}`
    );


    let publishedCount = 0;


    for (const event of events) {

      if (
        publishedCount >=
        MAX_POSTS_PER_JOB
      ) {
        console.log(
          "Publish limit reached for this run — holding remaining stories"
        );
        break;
      }

      const result =
        await publishEvent(event);

      if (result.published) {
        publishedCount += 1;
      }

      if (
        result.reason ===
        "PACING_COOLDOWN"
      ) {
        break;
      }
    }


    console.log(
      "\n========== PUBLISH JOB COMPLETE ==========\n"
    );

  } catch (error) {

    console.error(
      "\nPUBLISH JOB ERROR:",
      error.message
    );

  }
}


cron.schedule(
  "*/5 * * * *",
  runPublishJob
);


module.exports = {
  runPublishJob,
  publishEvent
};
