const {
  calculatePriceChange
} = require("./change");

function createOutcome(
  event,
  initialSnapshot,
  laterSnapshot,
  horizon
) {
  if (!initialSnapshot) {
    throw new Error(
      "Initial market snapshot not found"
    );
  }

  if (!laterSnapshot) {
    throw new Error(
      "Later market snapshot not found"
    );
  }

  const initialTime =
    new Date(initialSnapshot.timestamp).getTime();

  const laterTime =
    new Date(laterSnapshot.timestamp).getTime();

  if (laterTime <= initialTime) {
    throw new Error(
      "Later snapshot must have a newer timestamp than initial snapshot"
    );
  }

  const priceChange =
    calculatePriceChange(
      initialSnapshot.price,
      laterSnapshot.price
    );

  return {
    eventId: event.eventId,
    symbol: initialSnapshot.symbol,
    horizon,

    initialPrice: initialSnapshot.price,
    laterPrice: laterSnapshot.price,

    percentageChange:
      priceChange.percentageChange,

    direction:
      priceChange.direction,

    initialTimestamp:
      initialSnapshot.timestamp,

    laterTimestamp:
      laterSnapshot.timestamp
  };
}

function addOutcome(event, outcome) {
  return {
    ...event,

    outcomes: [
      ...(event.outcomes || []),
      outcome
    ]
  };
}

module.exports = {
  createOutcome,
  addOutcome
};
