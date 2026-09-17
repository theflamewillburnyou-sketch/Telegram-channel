import {
  eventExistsByLink,
  saveEvent
} from "./eventRepository.js";

import {
  saveOutcome,
  saveSnapshot
} from "./marketRepository.js";

export async function saveCompleteEvent(env, event) {
  if (event.link && (await eventExistsByLink(env, event.link))) {
    console.log("Duplicate event skipped:", event.link);
    return null;
  }

  await saveEvent(env, event);

  for (const snapshot of event.snapshots || []) {
    await saveSnapshot(env, event.eventId, snapshot);
  }

  for (const outcome of event.outcomes || []) {
    await saveOutcome(env, event.eventId, outcome);
  }

  return event.eventId;
}
