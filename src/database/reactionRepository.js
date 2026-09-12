const {
  db,
  initializeDatabase
} = require("./database");

const {
  getOutcomesByHorizon
} = require("./marketRepository");

initializeDatabase();


function saveMarketReaction(
  reaction
) {

  const statement = db.prepare(`
    INSERT INTO market_reactions (
      event_id,
      horizon,
      expected_direction,
      total_assets,
      confirmed,
      divergences,
      neutral,
      overall,
      created_at
    )
    VALUES (
      @event_id,
      @horizon,
      @expected_direction,
      @total_assets,
      @confirmed,
      @divergences,
      @neutral,
      @overall,
      @created_at
    )
  `);


  statement.run({

    event_id:
      reaction.eventId,

    horizon:
      reaction.horizon,

    expected_direction:
      reaction.expectedDirection,

    total_assets:
      reaction.totalAssets,

    confirmed:
      reaction.confirmed,

    divergences:
      reaction.divergences,

    neutral:
      reaction.neutral,

    overall:
      reaction.overall,

    created_at:
      new Date().toISOString()

  });
}


function getExpectedVsActualRow(
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


function getMarketReaction(
  eventId,
  horizon
) {

  const statement = db.prepare(`
    SELECT *
    FROM market_reactions
    WHERE event_id = ?
      AND horizon = ?
    LIMIT 1
  `);


  const row = statement.get(
    eventId,
    horizon
  );


  if (!row) {
    return null;
  }


  const outcomes =
    getOutcomesByHorizon(
      eventId,
      horizon
    );


  const confirmingAssets = [];
  const divergingAssets = [];
  const neutralAssets = [];

  const reactions =
    outcomes.map(outcome => {

      const expectedVsActual =
        getExpectedVsActualRow(
          eventId,
          outcome.symbol,
          horizon
        );

      const result =
        expectedVsActual?.result ||
        "UNKNOWN";

      if (result === "CONFIRMED") {
        confirmingAssets.push(
          outcome.symbol
        );
      } else if (
        result === "DIVERGENCE"
      ) {
        divergingAssets.push(
          outcome.symbol
        );
      } else if (
        result === "NEUTRAL"
      ) {
        neutralAssets.push(
          outcome.symbol
        );
      }

      return {
        symbol:
          outcome.symbol,

        percentageChange:
          outcome.percentage_change,

        direction:
          outcome.direction
      };
    });


  return {
    eventId:
      row.event_id,

    horizon:
      row.horizon,

    expectedDirection:
      row.expected_direction,

    totalAssets:
      row.total_assets,

    confirmed:
      row.confirmed,

    divergences:
      row.divergences,

    neutral:
      row.neutral,

    overall:
      row.overall,

    createdAt:
      row.created_at,

    confirmingAssets,
    divergingAssets,
    neutralAssets,
    reactions
  };
}


function reactionExists(
  eventId,
  horizon
) {
  const statement = db.prepare(`
    SELECT 1
    FROM market_reactions
    WHERE event_id = ?
      AND horizon = ?
    LIMIT 1
  `);

  return Boolean(
    statement.get(
      eventId,
      horizon
    )
  );
}


module.exports = {
  saveMarketReaction,
  getMarketReaction,
  reactionExists
};
