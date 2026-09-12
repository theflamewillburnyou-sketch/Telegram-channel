const {
  updateEventFinalAnalysis,
  getEvent
} = require("./eventRepository");

const eventId = "mty177mzvf4lpw";

const finalAnalysis = {
  final: {
    direction: "BULLISH",
    magnitude: "HIGH",
    eventType: "SUPPLY_SHOCK",
    timeframe: "IMMEDIATE",
    finalConfidence: "MEDIUM"
  }
};

console.log("\n========== BEFORE UPDATE ==========\n");

console.log(
  getEvent(eventId)
);

updateEventFinalAnalysis(
  eventId,
  finalAnalysis
);

console.log("\n========== AFTER UPDATE ==========\n");

console.log(
  getEvent(eventId)
);
