function buildFinalAnalysis(
    article,
    aiAnalysis,
    evidenceCheck
  ) {
    return {
      title: article.title,
      content: article.content,
      source: article.source,
  
      marketTags: article.marketTags,
      affectedAssets: article.affectedAssets,
  
      // What the rule engine originally thought
      ruleBased: {
        direction: article.direction,
        impactLevel: article.impactLevel,
        eventTypes: article.eventTypes,
        timeframe: article.timeframe
      },
  
      // Final AI-reviewed result
      final: {
        direction:
          aiAnalysis.classification?.direction ||
          article.direction,
  
        magnitude:
          aiAnalysis.classification?.magnitude ||
          article.impactLevel,
  
        eventType:
          aiAnalysis.classification?.eventType ||
          "OTHER",
  
          timeframe:
          aiAnalysis.classification?.timeframe ||
          article.timeframe ||
          "MEDIUM_TERM",
  
        aiConfidence:
          aiAnalysis.confidence || "LOW",
  
        evidenceConfidence:
          article.evidenceConfidence || "LOW",
  
        finalConfidence:
          evidenceCheck?.finalConfidence || "LOW"
      },
  
      summary: aiAnalysis.summary,
  
      whyItMatters:
        aiAnalysis.whyItMatters,
  
      bullishFactors:
        aiAnalysis.bullishFactors || [],
  
      bearishFactors:
        aiAnalysis.bearishFactors || [],
  
      risks:
        aiAnalysis.risks || [],
  
      whatToWatch:
        aiAnalysis.whatToWatch || [],
  
      analysisType:
        aiAnalysis.analysisType ||
        "INTERPRETATION"
    };
  }
  
  module.exports = {
    buildFinalAnalysis
  };