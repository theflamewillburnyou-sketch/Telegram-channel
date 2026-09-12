const DEFAULT_THRESHOLD = 0.25;

function getActualDirection(
  percentageChange,
  threshold = DEFAULT_THRESHOLD
) {
  if (percentageChange >= threshold) {
    return "UP";
  }

  if (percentageChange <= -threshold) {
    return "DOWN";
  }

  return "FLAT";
}

function compareExpectedVsActual(
  expectedDirection,
  actualDirection
) {
  if (
    expectedDirection === "BULLISH" &&
    actualDirection === "UP"
  ) {
    return "CONFIRMED";
  }

  if (
    expectedDirection === "BEARISH" &&
    actualDirection === "DOWN"
  ) {
    return "CONFIRMED";
  }

  if (
    expectedDirection === "BULLISH" &&
    actualDirection === "DOWN"
  ) {
    return "DIVERGENCE";
  }

  if (
    expectedDirection === "BEARISH" &&
    actualDirection === "UP"
  ) {
    return "DIVERGENCE";
  }

  return "NEUTRAL";
}

function createExpectedVsActual(
  expectedDirection,
  outcome,
  threshold = DEFAULT_THRESHOLD
) {
  const actualDirection =
    getActualDirection(
      outcome.percentageChange,
      threshold
    );

  const result =
    compareExpectedVsActual(
      expectedDirection,
      actualDirection
    );

  return {
    symbol: outcome.symbol,

    expected:
      expectedDirection,

    actual:
      actualDirection,

    percentageChange:
      outcome.percentageChange,

    threshold,

    result
  };
}

module.exports = {
  DEFAULT_THRESHOLD,
  getActualDirection,
  compareExpectedVsActual,
  createExpectedVsActual
};
