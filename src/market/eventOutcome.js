const {
  createOutcome,
  addOutcome
} = require("./outcome");

const {
  createExpectedVsActual
} = require("./expectedVsActual");

function processEventOutcome(
  event,
  eventSnapshot,
  laterSnapshot,
  horizon,
  expectedDirection
) {
  // Calculate price movement
  const outcome =
    createOutcome(
      event,
      eventSnapshot,
      laterSnapshot,
      horizon
    );

  // Compare expectation with actual movement
  const expectedVsActual =
    createExpectedVsActual(
      expectedDirection,
      outcome
    );

  // Add everything to the event
  const updatedEvent =
    addOutcome(
      event,
      {
        ...outcome,
        expectedVsActual
      }
    );

  return updatedEvent;
}

module.exports = {
  processEventOutcome
};
