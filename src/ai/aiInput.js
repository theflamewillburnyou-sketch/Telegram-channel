function createAIInput(article) {
    return {
      title: article.title,
      content: article.content,
      source: article.source,
      publishedAt: article.publishedAt,
  
      marketTags: article.marketTags,
      affectedAssets: article.affectedAssets,
  
      direction: article.direction,
      confidence: article.confidence,
      timeframe: article.timeframe,
  
      eventTypes: article.eventTypes,

      impactScore: article.impactScore,
      impactLevel: article.impactLevel,

      priorityScore:
        article.priorityScore,

      priorityLevel:
        article.priorityLevel,

      clusterId:
        article.clusterId,

      clusterSize:
        article.clusterSize,

      noveltyScore:
        article.noveltyScore,

      noveltyLevel:
        article.noveltyLevel,

      relatedArticles:
        article.relatedArticles || [],

      sourceQualityScore:
        article.sourceQualityScore,

      sourceQualityLevel:
        article.sourceQualityLevel,

      impactExplanation: article.impactExplanation
    };
  }
  
  function addAIInput(articles) {
    return articles.map(article => {
      const aiInput = createAIInput(article);
  
      return {
        ...article,
        aiInput
      };
    });
  }
  
  module.exports = {
    createAIInput,
    addAIInput
  };