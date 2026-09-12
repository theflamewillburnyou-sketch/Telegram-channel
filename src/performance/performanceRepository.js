const {
  db
} = require("../database/database");


function getPerformanceRows() {

  const statement =
    db.prepare(`
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
    `);

  return statement.all();
}


module.exports = {
  getPerformanceRows
};
