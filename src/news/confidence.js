function calculateConfidence(article) {
    let score = 0;
  
    // Stronger confidence when the article has
    // multiple useful signals.
  
    if (article.impactScore >= 7) {
      score += 2;
    } else if (article.impactScore >= 4) {
      score += 1;
    }
  
    if (article.marketTags.length > 0) {
      score += 1;
    }
  
    if (article.affectedAssets.length > 0) {
      score += 1;
    }
  
    if (article.direction !== "NEUTRAL") {
      score += 1;
    }
  
    if (score >= 4) {
      return "HIGH";
    }
  
    if (score >= 2) {
      return "MEDIUM";
    }
  
    return "LOW";
  }
  
  function addConfidence(articles) {
    return articles.map(article => {
      const confidence = calculateConfidence(article);
  
      return {
        ...article,
        confidence
      };
    });
  }
  
  module.exports = {
    calculateConfidence,
    addConfidence
  };