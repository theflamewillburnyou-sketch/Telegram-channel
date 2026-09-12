const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

const {
  createExpectedVsActual
} = require("../market/expectedVsActual");

const eventId = "mty177mzvf4lpw";

const outcome = db.prepare(`
  SELECT *
  FROM outcomes
  WHERE event_id = ?
    AND symbol = ?
    AND horizon = ?
`).get(
  eventId,
  "BRENT",
  "1H"
);

if (!outcome) {
  throw new Error(
    "BRENT 1H outcome not found"
  );
}

const result =
  createExpectedVsActual(
    "BULLISH",
    {
      symbol: outcome.symbol,
      percentageChange:
        outcome.percentage_change
    }
  );

console.log(
  "\n========== EXPECTED VS ACTUAL ==========\n"
);

console.log(result);

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
  horizon: "1H",
  expected: result.expected,
  actual: result.actual,
  percentage_change:
    result.percentageChange,
  threshold: result.threshold,
  result: result.result,
  created_at:
    new Date().toISOString()
});

console.log(
  "\nBRENT Expected-vs-Actual saved.\n"
);
