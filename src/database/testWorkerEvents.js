const {
  getEventsWithSnapshots
} = require("./eventRepository");

const events =
  getEventsWithSnapshots();

console.log(
  "\n========== EVENTS FOR OUTCOME WORKER ==========\n"
);

console.log(events);
