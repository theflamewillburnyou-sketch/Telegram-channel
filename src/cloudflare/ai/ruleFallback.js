export function mapMagnitude(impactLevel) {
  if (
    impactLevel === "CRITICAL" ||
    impactLevel === "HIGH"
  ) {
    return "HIGH";
  }

  if (impactLevel === "MEDIUM") {
    return "MEDIUM";
  }

  return "LOW";
}

export function createRuleFallback(article) {
  return {
    summary: article.title || "",

    whyItMatters:
      article.impactExplanation ||
      "This event may affect the related market or asset.",

    classification: {
      direction: article.direction || "NEUTRAL",

      magnitude: mapMagnitude(
        article.impactLevel ||
        article.magnitude
      ),

      eventType:
        article.eventTypes?.[0] ||
        article.eventType ||
        "OTHER",

      timeframe:
        article.timeframe ||
        "MEDIUM_TERM"
    },

    bullishFactors:
      article.direction === "BULLISH"
        ? [
            "Rule-based analysis indicates a positive market bias."
          ]
        : [],

    bearishFactors:
      article.direction === "BEARISH"
        ? [
            "Rule-based analysis indicates a negative market bias."
          ]
        : [],

    risks: [
      "Rule-based fallback has limited context and may miss important factors."
    ],

    whatToWatch: article.affectedAssets || [],

    analysisType: "INTERPRETATION",

    confidence: "LOW"
  };
}
