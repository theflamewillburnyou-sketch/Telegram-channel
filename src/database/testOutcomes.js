const {
  createOutcome
} = require("../market/outcome");

const {
  saveOutcome,
  outcomeExists
} = require("./outcomeRepository");

const {
  db
} = require("./database");

const event = {
  eventId: "mty177mzvf4lpw"
};

const initialSnapshot = {
  symbol: "BRENT",
  price: 104.32,
  timestamp: "2026-09-11T22:51:16.741Z"
};

const laterSnapshot = {
  symbol: "BRENT",
  price: 105.10,
  timestamp: "2026-09-12T00:00:00.000Z"
};

const outcome = createOutcome(
  event,
  initialSnapshot,
  laterSnapshot,
  "1H"
);

console.log("\n========== OUTCOME TO SAVE ==========\n");
console.log(outcome);

if (
  outcomeExists(
    outcome.eventId,
    outcome.symbol,
    outcome.horizon
  )
) {
  console.log(
    "\nOutcome already exists — skipping insert (UNIQUE protection).\n"
  );
} else {
  saveOutcome(outcome);
  console.log("\nOutcome saved.\n");
}

const rows = db.prepare(`
  SELECT *
  FROM outcomes
  WHERE event_id = ?
    AND symbol = ?
    AND horizon = ?
`).all(
  outcome.eventId,
  outcome.symbol,
  outcome.horizon
);

console.log("\n========== OUTCOMES IN SQLITE ==========\n");
console.dir(rows, { depth: null });
