const {
  getMarketPrice
} = require("./prices");

const {
  getEventSnapshots,
  saveOutcome,
  outcomeExists
} = require("../database/marketRepository");

const {
  createOutcome
} = require("./outcome");

const {
  createExpectedVsActual
} = require("./expectedVsActual");

const {
  OUTCOME_HORIZONS,
  getTargetTime
} = require("./outcomeHorizon");

const {
  processMarketReaction
} = require("./reactionWorker");

async function processEventHorizon(
  event,
  eventSnapshot,
  horizon
) {
  const targetTime =
    getTargetTime(
      eventSnapshot.timestamp,
      horizon
    );

  const now =
    new Date();

  // The horizon hasn't arrived yet
  if (
    now < new Date(targetTime)
  ) {
    return null;
  }

  try {
    const marketData =
      await getMarketPrice(
        eventSnapshot.symbol
      );

    const outcome =
      createOutcome(
        event,
        eventSnapshot,
        marketData,
        horizon.name
      );

    const expectedVsActual =
      createExpectedVsActual(
        event.direction,
        outcome
      );

    return {
      ...outcome,
      expectedVsActual
    };

  } catch (error) {
    console.error(
      `Outcome failed for ${eventSnapshot.symbol}:`,
      error.message
    );

    return null;
  }
}

async function processEvent(event) {
  const eventId =
    event.eventId || event.event_id;

  const reactionEvent = {
    ...event,
    event_id: eventId
  };

  const snapshots =
    getEventSnapshots(
      eventId
    );

  for (
    const eventSnapshot
    of snapshots
  ) {
    for (
      const horizon
      of Object.values(
        OUTCOME_HORIZONS
      )
    ) {

      const alreadyProcessed =
        outcomeExists(
          eventId,
          eventSnapshot.symbol,
          horizon.name
        );


      if (!alreadyProcessed) {

        const outcome =
          await processEventHorizon(
            event,
            eventSnapshot,
            horizon
          );


        if (outcome) {

          saveOutcome(
            eventId,
            outcome
          );

          console.log(
            `Outcome saved: ${eventSnapshot.symbol} ${horizon.name}`
          );

          console.log(
            outcome.expectedVsActual
          );

        }

      }


      const reaction =
        processMarketReaction(
          reactionEvent,
          horizon.name
        );


      console.log(
        `Market reaction ${horizon.name}:`,
        reaction.status
      );

    }
  }
}

module.exports = {
  processEvent,
  processEventHorizon
};
