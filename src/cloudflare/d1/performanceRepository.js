import { dbAll } from "./client.js";

/**
 * Same SQL as local src/performance/performanceRepository.js.
 * Returns rows that join frozen predictions with expected_vs_actual.
 */
export async function getPerformanceRows(env, options = {}) {
  const limit = Number(options.limit || 500);

  return dbAll(
    env,
    `
      SELECT
        eva.event_id,
        eva.symbol,
        eva.horizon,
        eva.expected,
        eva.actual,
        eva.percentage_change,
        eva.threshold,
        eva.result,
        ep.event_type,
        ep.confidence,
        ep.predicted_at
      FROM expected_vs_actual eva
      JOIN event_predictions ep
        ON eva.event_id = ep.event_id
      ORDER BY ep.predicted_at ASC
      LIMIT ?
    `,
    limit
  );
}
