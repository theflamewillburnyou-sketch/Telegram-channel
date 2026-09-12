function getFinalConfidence(
  aiConfidence,
  evidenceConfidence
) {
  if (
    aiConfidence === "HIGH" &&
    evidenceConfidence === "LOW"
  ) {
    return "LOW";
  }

  if (
    aiConfidence === "HIGH" &&
    evidenceConfidence === "MEDIUM"
  ) {
    return "MEDIUM";
  }

  if (
    aiConfidence === "MEDIUM" &&
    evidenceConfidence === "LOW"
  ) {
    return "LOW";
  }

  return aiConfidence;
}


function checkEvidence(article, aiAnalysis, provider) {
  const issues = [];

  const evidenceConfidence =
    article.evidenceConfidence || "LOW";

  const finalConfidence =
    getFinalConfidence(
      aiAnalysis.confidence || "LOW",
      evidenceConfidence
    );


  /*
   * Only compare AI classification against
   * the original rule engine when Gemini
   * or another real AI provider produced
   * the analysis.
   *
   * Rule fallback is specifically allowed
   * to correct rule-engine mistakes.
   */
  if (provider !== "RULE_FALLBACK") {

    if (
      aiAnalysis.classification &&
      aiAnalysis.classification.direction !==
        article.direction
    ) {
      issues.push(
        "AI direction differs from rule-based direction."
      );
    }


    if (
      aiAnalysis.classification &&
      aiAnalysis.classification.magnitude !==
        article.impactLevel
    ) {
      issues.push(
        "AI magnitude differs from rule-based impact level."
      );
    }


    if (
      aiAnalysis.classification &&
      aiAnalysis.classification.eventType &&
      !article.eventTypes.includes(
        aiAnalysis.classification.eventType
      )
    ) {
      issues.push(
        "AI event type differs from rule-based event type."
      );
    }
  }


  /*
   * Fallback should always remain low confidence
   * because it is not AI-reviewed.
   */
  const adjustedConfidence =
    provider === "RULE_FALLBACK"
      ? "LOW"
      : finalConfidence;


  return {
    passed: issues.length === 0,
    issues,
    finalConfidence: adjustedConfidence
  };
}


module.exports = {
  getFinalConfidence,
  checkEvidence
};

