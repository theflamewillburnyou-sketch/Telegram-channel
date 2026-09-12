const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();


function savePrediction(
  eventId,
  finalAnalysis
) {

  const statement = db.prepare(`
    INSERT INTO event_predictions (
      event_id,
      direction,
      magnitude,
      event_type,
      timeframe,
      confidence,
      predicted_at
    )
    VALUES (
      @event_id,
      @direction,
      @magnitude,
      @event_type,
      @timeframe,
      @confidence,
      @predicted_at
    )
  `);


  statement.run({

    event_id:
      eventId,

    direction:
      finalAnalysis.final?.direction ||
      "NEUTRAL",

    magnitude:
      finalAnalysis.final?.magnitude ||
      "LOW",

    event_type:
      finalAnalysis.final?.eventType ||
      "OTHER",

    timeframe:
      finalAnalysis.final?.timeframe ||
      "MEDIUM_TERM",

    confidence:
      finalAnalysis.final?.finalConfidence ||
      "LOW",

    predicted_at:
      new Date().toISOString()

  });
}


function getPrediction(eventId) {

  const statement = db.prepare(`
    SELECT *
    FROM event_predictions
    WHERE event_id = ?
    LIMIT 1
  `);

  return statement.get(eventId);
}


function predictionExists(eventId) {

  const statement = db.prepare(`
    SELECT 1
    FROM event_predictions
    WHERE event_id = ?
    LIMIT 1
  `);

  return Boolean(
    statement.get(eventId)
  );
}


module.exports = {
  savePrediction,
  getPrediction,
  predictionExists
};
