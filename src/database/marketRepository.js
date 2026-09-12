const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

function saveSnapshot(
  eventId,
  snapshot
) {
  const statement = db.prepare(`
    INSERT INTO snapshots (
      event_id,
      symbol,
      price,
      currency,
      timestamp
    )
    VALUES (
      @event_id,
      @symbol,
      @price,
      @currency,
      @timestamp
    )
  `);

  statement.run({
    event_id: eventId,

    symbol: snapshot.symbol,

    price: snapshot.price,

    currency:
      snapshot.currency || "USD",

    timestamp:
      snapshot.timestamp
  });
}

function saveOutcome(
  eventId,
  outcome
) {
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
    event_id: eventId,

    symbol: outcome.symbol,

    horizon: outcome.horizon,

    initial_price:
      outcome.initialPrice ??
      outcome.eventPrice,

    later_price:
      outcome.laterPrice ??
      outcome.outcomePrice,

    percentage_change:
      outcome.percentageChange,

    direction:
      outcome.expectedVsActual?.actual ||
      outcome.direction,

    initial_timestamp:
      outcome.initialTimestamp ??
      outcome.eventTimestamp,

    later_timestamp:
      outcome.laterTimestamp ??
      outcome.outcomeTimestamp
  });
}

function getLatestSnapshot(eventId, symbol) {
  const statement = db.prepare(`
    SELECT *
    FROM snapshots
    WHERE event_id = ?
      AND symbol = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `);

  return statement.get(eventId, symbol);
}

function getInitialSnapshot(eventId, symbol) {
  const statement = db.prepare(`
    SELECT *
    FROM snapshots
    WHERE event_id = ?
      AND symbol = ?
    ORDER BY timestamp ASC
    LIMIT 1
  `);

  return statement.get(eventId, symbol);
}

function getEventSnapshots(eventId) {
  const statement = db.prepare(`
    SELECT *
    FROM snapshots
    WHERE event_id = ?
    ORDER BY timestamp ASC
  `);

  return statement.all(eventId);
}

function getEventOutcomes(eventId) {
  const statement = db.prepare(`
    SELECT *
    FROM outcomes
    WHERE event_id = ?
    ORDER BY id ASC
  `);

  return statement.all(eventId);
}

function getOutcomesByHorizon(
  eventId,
  horizon
) {
  const statement = db.prepare(`
    SELECT *
    FROM outcomes
    WHERE event_id = ?
      AND horizon = ?
    ORDER BY id ASC
  `);

  return statement.all(
    eventId,
    horizon
  );
}

function outcomeExists(
  eventId,
  symbol,
  horizon
) {
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

module.exports = {
  saveSnapshot,
  getLatestSnapshot,
  getInitialSnapshot,
  saveOutcome,
  getEventSnapshots,
  getEventOutcomes,
  getOutcomesByHorizon,
  outcomeExists
};
