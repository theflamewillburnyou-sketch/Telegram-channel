import { dbGet, dbRun } from "./client.js";
import { getOutcomesByHorizon } from "./marketRepository.js";

async function getExpectedVsActualRow(env, eventId, symbol, horizon) {
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

export async function saveMarketReaction(env, reaction) {
  await dbRun(
    env,
    `
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    reaction.eventId,
    reaction.horizon,
    reaction.expectedDirection,
    reaction.totalAssets,
    reaction.confirmed,
    reaction.divergences,
    reaction.neutral,
    reaction.overall,
    new Date().toISOString()
  );
}

export async function getMarketReaction(env, eventId, horizon) {
  const row = await dbGet(
    env,
    `
      SELECT *
      FROM market_reactions
      WHERE event_id = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    horizon
  );

  if (!row) {
    return null;
  }

  const outcomes = await getOutcomesByHorizon(env, eventId, horizon);

  const confirmingAssets = [];
  const divergingAssets = [];
  const neutralAssets = [];

  const reactions = [];

  for (const outcome of outcomes) {
    const expectedVsActual = await getExpectedVsActualRow(
      env,
      eventId,
      outcome.symbol,
      horizon
    );

    const result = expectedVsActual?.result || "UNKNOWN";

    if (result === "CONFIRMED") {
      confirmingAssets.push(outcome.symbol);
    } else if (result === "DIVERGENCE") {
      divergingAssets.push(outcome.symbol);
    } else if (result === "NEUTRAL") {
      neutralAssets.push(outcome.symbol);
    }

    reactions.push({
      symbol: outcome.symbol,
      percentageChange: outcome.percentage_change,
      direction: outcome.direction
    });
  }

  return {
    eventId: row.event_id,
    horizon: row.horizon,
    expectedDirection: row.expected_direction,
    totalAssets: row.total_assets,
    confirmed: row.confirmed,
    divergences: row.divergences,
    neutral: row.neutral,
    overall: row.overall,
    createdAt: row.created_at,
    confirmingAssets,
    divergingAssets,
    neutralAssets,
    reactions
  };
}

export async function reactionExists(env, eventId, horizon) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM market_reactions
      WHERE event_id = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    horizon
  );

  return Boolean(row);
}
