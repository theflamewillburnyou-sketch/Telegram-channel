const {
  getOutcomesByHorizon
} = require("../database/marketRepository");

const {
  db
} = require("../database/database");

const {
  saveMarketReaction,
  reactionExists
} = require("../database/reactionRepository");

const {
  createMarketReactionReport
} = require("./marketReactionReport");

const {
  getPrediction
} = require("../database/predictionRepository");


function getExpectedVsActual(
  eventId,
  symbol,
  horizon
) {
  const statement = db.prepare(`
    SELECT *
    FROM expected_vs_actual
    WHERE event_id = ?
      AND symbol = ?
      AND horizon = ?
    LIMIT 1
  `);

  return statement.get(
    eventId,
    symbol,
    horizon
  );
}


function processMarketReaction(
  event,
  horizon
) {

  const eventId =
    event.eventId || event.event_id;


  const outcomes =
    getOutcomesByHorizon(
      eventId,
      horizon
    );


  if (outcomes.length === 0) {

    return {
      status: "NO_DATA",
      eventId,
      horizon
    };

  }


  if (
    reactionExists(
      eventId,
      horizon
    )
  ) {

    return {
      status: "ALREADY_PROCESSED",
      eventId,
      horizon
    };

  }


  const normalizedOutcomes =
    outcomes.map(outcome => {

      const expectedVsActual =
        getExpectedVsActual(
          eventId,
          outcome.symbol,
          horizon
        );


      return {
        symbol:
          outcome.symbol,

        percentageChange:
          outcome.percentage_change,

        direction:
          outcome.direction,

        expectedVsActual: {

          expected:
            expectedVsActual?.expected ||
            "UNKNOWN",

          actual:
            expectedVsActual?.actual ||
            outcome.direction,

          percentageChange:
            outcome.percentage_change,

          result:
            expectedVsActual?.result ||
            "UNKNOWN"

        }

      };

    });


  const prediction =
    getPrediction(eventId);

  const eventForReaction = {

    eventId,

    direction:
      prediction?.direction ||
      "NEUTRAL"

  };


  const report =
    createMarketReactionReport(
      eventForReaction,
      normalizedOutcomes
    );


  saveMarketReaction({

    ...report,

    horizon

  });


  return {

    status: "SUCCESS",

    eventId,

    horizon,

    report

  };

}


module.exports = {
  processMarketReaction
};
