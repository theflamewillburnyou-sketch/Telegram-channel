import { dbAll, dbGet, dbRun } from "./client.js";

export async function saveSnapshot(env, eventId, snapshot) {
  await dbRun(
    env,
    `
      INSERT INTO snapshots (
        event_id,
        symbol,
        price,
        currency,
        timestamp
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    eventId,
    snapshot.symbol,
    snapshot.price,
    snapshot.currency || "USD",
    snapshot.timestamp
  );
}

export async function saveOutcome(env, eventId, outcome) {
  await dbRun(
    env,
    `
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    eventId,
    outcome.symbol,
    outcome.horizon,
    outcome.initialPrice ?? outcome.eventPrice,
    outcome.laterPrice ?? outcome.outcomePrice,
    outcome.percentageChange,
    outcome.expectedVsActual?.actual || outcome.direction,
    outcome.initialTimestamp ?? outcome.eventTimestamp,
    outcome.laterTimestamp ?? outcome.outcomeTimestamp
  );
}

export async function getLatestSnapshot(env, eventId, symbol) {
  return dbGet(
    env,
    `
      SELECT *
      FROM snapshots
      WHERE event_id = ?
        AND symbol = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `,
    eventId,
    symbol
  );
}

export async function getInitialSnapshot(env, eventId, symbol) {
  return dbGet(
    env,
    `
      SELECT *
      FROM snapshots
      WHERE event_id = ?
        AND symbol = ?
      ORDER BY timestamp ASC
      LIMIT 1
    `,
    eventId,
    symbol
  );
}

export async function getEventSnapshots(env, eventId) {
  return dbAll(
    env,
    `
      SELECT *
      FROM snapshots
      WHERE event_id = ?
      ORDER BY timestamp ASC
    `,
    eventId
  );
}

export async function getEventOutcomes(env, eventId) {
  return dbAll(
    env,
    `
      SELECT *
      FROM outcomes
      WHERE event_id = ?
      ORDER BY id ASC
    `,
    eventId
  );
}

export async function getOutcomesByHorizon(env, eventId, horizon) {
  return dbAll(
    env,
    `
      SELECT *
      FROM outcomes
      WHERE event_id = ?
        AND horizon = ?
      ORDER BY id ASC
    `,
    eventId,
    horizon
  );
}

export async function outcomeExists(env, eventId, symbol, horizon) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM outcomes
      WHERE event_id = ?
        AND symbol = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    symbol,
    horizon
  );

  return Boolean(row);
}
