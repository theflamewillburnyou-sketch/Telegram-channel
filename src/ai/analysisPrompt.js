function buildAnalysisPrompt(article) {

  return `
    You are the market intelligence engine for Midnight Society.
    
    Analyze the following news event.
    
    NEWS TITLE:
    ${article.title}

    ARTICLE CONTENT:
    ${article.content || "No article content available."}
    
    SOURCE:
    ${article.source}
    
    MARKETS:
    ${(article.marketTags || []).join(", ")}
    
    AFFECTED ASSETS:
    ${(article.affectedAssets || []).join(", ")}
    
    RULE-BASED EVENT TYPES:
    ${(article.eventTypes || []).join(", ")}

    RULE-BASED TIMEFRAME:
    ${article.timeframe}

    RULE-BASED IMPACT:
    ${article.impactLevel}

    RULE-BASED DIRECTION:
    ${article.direction}
    
    Return ONLY valid JSON.
    
    Use exactly this structure:
    
    {
    "summary": "",
    "whyItMatters": "",

    "classification": {
        "direction": "BULLISH | BEARISH | NEUTRAL",
        "magnitude": "HIGH | MEDIUM | LOW",
        "eventType": "GEOPOLITICAL | MACRO | REGULATION | ETF | EARNINGS | SUPPLY_SHOCK | LEADERSHIP_CHANGE | CORPORATE_ACTION | OTHER",
        "timeframe": "IMMEDIATE | SHORT_TERM | MEDIUM_TERM"
    },

    "bullishFactors": [],
    "bearishFactors": [],
    "risks": [],
    "whatToWatch": [],

    "analysisType": "FACT | INTERPRETATION",
    "confidence": "HIGH | MEDIUM | LOW"
    }
    
    Rules:
    
    - Do not invent facts.
    - Do not invent statistics, prices, companies, people, events, or relationships.
    - Only treat information explicitly provided in the input as fact.
    - If something is an inference, label it as interpretation.
    - Do not give personalized financial advice.
    - Do not claim certainty about future market movements.
    - Keep the analysis concise.
    - Treat the rule-based classification only as an initial guess.
    - You may disagree with the rule-based direction, event type, timeframe, or impact level.
    - Classify the event based on the actual meaning of the news, not isolated keywords.
    - Identify what the event is actually about.
    - Do not classify an event as GEOPOLITICAL unless the article is genuinely about geopolitical developments.
    - Do not classify an event as IMMEDIATE merely because the headline contains words such as "cuts", "rises", or "falls".
    - CORPORATE_ACTION should be used for events such as share issuance, share cancellation, buybacks, compensation changes, dilution changes, capital structure changes, or similar company actions.
    - Magnitude describes the likely market importance of this specific event, not how important the company is.
    - Confidence describes how confident you are in your classification based on the available evidence.
    `;
}


function parseJsonResponse(text) {

  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response");
  }

  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleanedText);
}


module.exports = {
  buildAnalysisPrompt,
  parseJsonResponse
};
