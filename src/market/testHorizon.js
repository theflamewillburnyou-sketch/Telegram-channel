const {
  OUTCOME_HORIZONS,
  getTargetTime
} = require("./outcomeHorizon");

const eventTime =
  "2026-09-12T06:37:03.184Z";

console.log(
  "Event:",
  eventTime
);

console.log(
  "1H:",
  getTargetTime(
    eventTime,
    OUTCOME_HORIZONS.ONE_HOUR
  )
);

console.log(
  "1D:",
  getTargetTime(
    eventTime,
    OUTCOME_HORIZONS.ONE_DAY
  )
);

console.log(
  "1W:",
  getTargetTime(
    eventTime,
    OUTCOME_HORIZONS.ONE_WEEK
  )
);
