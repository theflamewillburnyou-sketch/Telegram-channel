const MAX_EVENT_AGE_MS =
  30 * 60 * 1000;


function isFreshEvent(event) {

  if (!event.createdAt) {
    return false;
  }

  const createdTime =
    new Date(
      event.createdAt
    ).getTime();

  if (!Number.isFinite(createdTime)) {
    return false;
  }

  const age =
    Date.now() - createdTime;

  return (
    age >= 0 &&
    age <= MAX_EVENT_AGE_MS
  );
}


module.exports = {
  isFreshEvent
};
