const {
  checkEvidence
} = require("../ai/evidenceCheck");

const {
  buildFinalAnalysis
} = require("../ai/finalAnalysis");

const {
  updateEventFinalAnalysis
} = require("../database/eventRepository");

const {
  savePredictionIfNeeded
} = require("../prediction/savePredictionIfNeeded");

const {
  createRuleFallback
} = require("../ai/ruleFallback");

const {
  shouldUseAI
} = require("../ai/aiFilter");

const {
  routeAI
} = require("../ai/aiRouter");


async function analyzeEvent(event) {

  console.log(
    `\nAnalyzing event: ${event.title}`
  );


  let aiAnalysis;
  let provider;


  /*
   * LOW PRIORITY → RULES
   */

  if (!shouldUseAI(event)) {

    console.log(
      "AI not required — using rule-based fallback"
    );

    aiAnalysis =
      createRuleFallback(event);

    provider =
      "RULE_FALLBACK";

  }


  /*
   * HIGH PRIORITY → AI ROUTER
   */

  else {

    console.log(
      "High priority event — routing to AI provider"
    );

    const aiResult =
      await routeAI(event);

    aiAnalysis =
      aiResult.analysis;

    provider =
      aiResult.provider;
  }


  /*
   * Evidence check
   */

  const evidenceCheck =
    checkEvidence(
      event,
      aiAnalysis,
      provider
    );


  /*
   * Final analysis
   */

  const finalAnalysis =
    buildFinalAnalysis(
      event,
      aiAnalysis,
      evidenceCheck
    );


  /*
   * Update event
   */

  updateEventFinalAnalysis(
    event.eventId,
    finalAnalysis
  );


  /*
   * Freeze prediction
   */

  const predictionResult =
    savePredictionIfNeeded(
      event.eventId,
      finalAnalysis
    );


  console.log(
    "Provider:",
    provider
  );

  console.log(
    "Prediction:",
    predictionResult
  );


  return {
    success: true,
    provider,
    finalAnalysis
  };
}


module.exports = {
  analyzeEvent
};
