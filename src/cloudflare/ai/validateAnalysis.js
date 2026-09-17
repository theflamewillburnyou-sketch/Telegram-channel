export const DIRECTIONS = [
  "BULLISH",
  "BEARISH",
  "NEUTRAL"
];

export const MAGNITUDES = [
  "HIGH",
  "MEDIUM",
  "LOW"
];

export const EVENT_TYPES = [
  "GEOPOLITICAL",
  "MACRO",
  "REGULATION",
  "ETF",
  "EARNINGS",
  "SUPPLY_SHOCK",
  "LEADERSHIP_CHANGE",
  "CORPORATE_ACTION",
  "OTHER"
];

export const TIMEFRAMES = [
  "IMMEDIATE",
  "SHORT_TERM",
  "MEDIUM_TERM"
];

export const CONFIDENCES = [
  "HIGH",
  "MEDIUM",
  "LOW"
];

export const ANALYSIS_TYPES = [
  "FACT",
  "INTERPRETATION"
];

export function validateAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") {
    return {
      valid: false,
      reason: "Analysis is missing or not an object"
    };
  }

  if (
    typeof analysis.summary !== "string" ||
    !analysis.summary.trim()
  ) {
    return {
      valid: false,
      reason: "Missing summary"
    };
  }

  if (
    typeof analysis.whyItMatters !== "string" ||
    !analysis.whyItMatters.trim()
  ) {
    return {
      valid: false,
      reason: "Missing whyItMatters"
    };
  }

  const classification = analysis.classification;

  if (
    !classification ||
    typeof classification !== "object"
  ) {
    return {
      valid: false,
      reason: "Missing classification"
    };
  }

  if (!DIRECTIONS.includes(classification.direction)) {
    return {
      valid: false,
      reason: "Invalid direction"
    };
  }

  if (!MAGNITUDES.includes(classification.magnitude)) {
    return {
      valid: false,
      reason: "Invalid magnitude"
    };
  }

  if (!EVENT_TYPES.includes(classification.eventType)) {
    return {
      valid: false,
      reason: "Invalid eventType"
    };
  }

  if (!TIMEFRAMES.includes(classification.timeframe)) {
    return {
      valid: false,
      reason: "Invalid timeframe"
    };
  }

  if (!CONFIDENCES.includes(analysis.confidence)) {
    return {
      valid: false,
      reason: "Invalid confidence"
    };
  }

  if (!ANALYSIS_TYPES.includes(analysis.analysisType)) {
    return {
      valid: false,
      reason: "Invalid analysisType"
    };
  }

  const arrayFields = [
    "bullishFactors",
    "bearishFactors",
    "risks",
    "whatToWatch"
  ];

  for (const field of arrayFields) {
    if (!Array.isArray(analysis[field])) {
      return {
        valid: false,
        reason: `${field} must be an array`
      };
    }
  }

  return {
    valid: true
  };
}
