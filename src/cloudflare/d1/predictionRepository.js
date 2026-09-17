import { dbGet, dbRun } from "./client.js";

export async function savePrediction(env, eventId, finalAnalysis) {
  await dbRun(
    env,
    `
      INSERT INTO event_predictions (
        event_id,
        direction,
        magnitude,
        event_type,
        timeframe,
        confidence,
        predicted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    eventId,
    finalAnalysis.final?.direction || "NEUTRAL",
    finalAnalysis.final?.magnitude || "LOW",
    finalAnalysis.final?.eventType || "OTHER",
    finalAnalysis.final?.timeframe || "MEDIUM_TERM",
    finalAnalysis.final?.finalConfidence || "LOW",
    new Date().toISOString()
  );
}

export async function getPrediction(env, eventId) {
  return dbGet(
    env,
    `
      SELECT *
      FROM event_predictions
      WHERE event_id = ?
      LIMIT 1
    `,
    eventId
  );
}

export async function predictionExists(env, eventId) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM event_predictions
      WHERE event_id = ?
      LIMIT 1
    `,
    eventId
  );

  return Boolean(row);
}
