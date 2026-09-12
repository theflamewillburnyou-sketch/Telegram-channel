const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

function outcomeExists(eventId, symbol, horizon) {
  const statement = db.prepare(`
    SELECT 1
    FROM outcomes
    WHERE event_id = ?
      AND symbol = ?
      AND horizon = ?
    LIMIT 1
  `);

  return Boolean(
    statement.get(
      eventId,
      symbol,
      horizon
    )
  );
}

function saveOutcome(outcome) {
  const statement = db.prepare(`
    INSERT INTO outcomes (
      event_id,
      symbol,
      horizon,
      initial_price,
      later_price,
      percentage_change,
      direction,
      initial_timestamp,
      later_timestamp
    )
    VALUES (
      @event_id,
      @symbol,
      @horizon,
      @initial_price,
      @later_price,
      @percentage_change,
      @direction,
      @initial_timestamp,
      @later_timestamp
    )
  `);

  statement.run({
    event_id: outcome.eventId,
    symbol: outcome.symbol,
    horizon: outcome.horizon,
    initial_price: outcome.initialPrice,
    later_price: outcome.laterPrice,
    percentage_change: outcome.percentageChange,
    direction: outcome.direction,
    initial_timestamp: outcome.initialTimestamp,
    later_timestamp: outcome.laterTimestamp
  });
}

function saveExpectedVsActual(
  eventId,
  result,
  horizon
) {
  const statement = db.prepare(`
    INSERT INTO expected_vs_actual (
      event_id,
      symbol,
      horizon,
      expected,
      actual,
      percentage_change,
      threshold,
      result,
      created_at
    )
    VALUES (
      @event_id,
      @symbol,
      @horizon,
      @expected,
      @actual,
      @percentage_change,
      @threshold,
      @result,
      @created_at
    )
  `);

  statement.run({
    event_id: eventId,
    symbol: result.symbol,
    horizon,

    expected: result.expected,
    actual: result.actual,

    percentage_change:
      result.percentageChange,

    threshold:
      result.threshold,

    result: result.result,

    created_at:
      new Date().toISOString()
  });
}

module.exports = {
  saveOutcome,
  outcomeExists,
  saveExpectedVsActual
};
