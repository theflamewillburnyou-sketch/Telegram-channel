const {
  processEvent
} = require("./outcomeWorker");

const event = {
  eventId:
    "your-event-id-here",

  direction:
    "BULLISH"
};

async function main() {
  await processEvent(
    event
  );
}

main().catch(error => {
  console.error(
    "Worker failed:",
    error.message
  );
});
