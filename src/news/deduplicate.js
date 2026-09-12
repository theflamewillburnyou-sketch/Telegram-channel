function normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 3);
  }
  
  function calculateSimilarity(title1, title2) {
    const words1 = new Set(normalizeTitle(title1));
    const words2 = new Set(normalizeTitle(title2));
  
    let commonWords = 0;
  
    for (const word of words1) {
      if (words2.has(word)) {
        commonWords++;
      }
    }
  
    const totalUniqueWords = new Set([
      ...words1,
      ...words2
    ]).size;
  
    if (totalUniqueWords === 0) {
      return 0;
    }
  
    return commonWords / totalUniqueWords;
  }
  
  function deduplicateArticles(articles) {
    const uniqueArticles = [];
  
    for (const article of articles) {
      let isDuplicate = false;
  
      for (const existingArticle of uniqueArticles) {
        const similarity = calculateSimilarity(
          article.title,
          existingArticle.title
        );
  
        if (similarity >= 0.5) {
          isDuplicate = true;
          break;
        }
      }
  
      if (!isDuplicate) {
        uniqueArticles.push(article);
      }
    }
  
    return uniqueArticles;
  }
  
  module.exports = {
    deduplicateArticles
  };