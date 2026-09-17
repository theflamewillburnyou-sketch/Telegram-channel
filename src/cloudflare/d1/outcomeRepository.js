import { dbGet, dbRun } from "./client.js";

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

export async function saveOutcome(env, outcome) {
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
    outcome.eventId,
    outcome.symbol,
    outcome.horizon,
    outcome.initialPrice,
    outcome.laterPrice,
    outcome.percentageChange,
    outcome.direction,
    outcome.initialTimestamp,
    outcome.laterTimestamp
  );
}

export async function saveExpectedVsActual(env, eventId, result, horizon) {
  await dbRun(
    env,
    `
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    eventId,
    result.symbol,
    horizon,
    result.expected,
    result.actual,
    result.percentageChange,
    result.threshold,
    result.result,
    new Date().toISOString()
  );
}

export async function getExpectedVsActual(env, eventId, symbol, horizon) {
  return dbGet(
    env,
    `
      SELECT *
      FROM expected_vs_actual
      WHERE event_id = ?
        AND symbol = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    symbol,
    horizon
  );
}
