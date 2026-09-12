const {
  savePrediction,
  predictionExists
} = require("../database/predictionRepository");


function savePredictionIfNeeded(
  eventId,
  finalAnalysis
) {

  if (
    predictionExists(eventId)
  ) {

    return {
      saved: false,
      reason: "ALREADY_EXISTS"
    };

  }


  savePrediction(
    eventId,
    finalAnalysis
  );


  return {
    saved: true,
    reason: "CREATED"
  };
}


module.exports = {
  savePredictionIfNeeded
};
