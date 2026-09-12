const { createOutcome } = require("./outcome");

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

console.log("\n========== OUTCOME ==========\n");

console.log(outcome);
