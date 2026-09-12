function createEventId() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 8)
    );
  }
  
  
  function createMarketEvent(article) {
    return {
      eventId: createEventId(),
  
      title: article.title,

      source: article.source,

      link: article.link || "",

      publishedAt: article.publishedAt,
  
      marketTags: article.marketTags || [],
  
      affectedAssets:
        article.affectedAssets || [],

      priorityScore:
        article.priorityScore || 0,

      priorityLevel:
        article.priorityLevel || "LOW",

      clusterId:
        article.clusterId || null,

      clusterSize:
        article.clusterSize || 1,

      noveltyScore:
        article.noveltyScore || 0,

      noveltyLevel:
        article.noveltyLevel || "HIGH",

      relatedArticles:
        article.relatedArticles || [],

      direction:
        article.finalAnalysis?.final?.direction ||
        article.direction ||
        "NEUTRAL",
  
      magnitude:
        article.finalAnalysis?.final?.magnitude ||
        article.impactLevel ||
        "LOW",
  
      eventType:
        article.finalAnalysis?.final?.eventType ||
        "OTHER",
  
      timeframe:
        article.finalAnalysis?.final?.timeframe ||
        "MEDIUM_TERM",
  
      confidence:
        article.finalAnalysis?.final?.finalConfidence ||
        "LOW",
  
      snapshots: [],
  
      outcomes: []
    };
  }


  function addSnapshot(event, snapshot) {
    return {
      ...event,

      snapshots: [
        ...event.snapshots,
        snapshot
      ]
    };
  }


  module.exports = {
    createEventId,
    createMarketEvent,
    addSnapshot
  };