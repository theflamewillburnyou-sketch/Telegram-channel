const {
  saveEvent,
  eventExistsByLink
} = require("./eventRepository");

const {
  saveSnapshot,
  saveOutcome
} = require("./marketRepository");

function saveCompleteEvent(event) {
  // Check for duplicate article
  if (
    event.link &&
    eventExistsByLink(event.link)
  ) {
    console.log(
      "Duplicate event skipped:",
      event.link
    );

    return null;
  }

  // Save main event
  saveEvent(event);

  // Save snapshots
  for (const snapshot of event.snapshots || []) {
    saveSnapshot(
      event.eventId,
      snapshot
    );
  }

  // Save outcomes
  for (const outcome of event.outcomes || []) {
    saveOutcome(
      event.eventId,
      outcome
    );
  }

  return event.eventId;
}

module.exports = {
  saveCompleteEvent
};
