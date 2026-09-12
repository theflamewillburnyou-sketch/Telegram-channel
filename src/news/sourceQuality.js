const SOURCE_QUALITY = {
  "Reuters": 5,
  "Bloomberg": 5,
  "BBC World": 5,
  "BBC Business": 5,
  "Federal Reserve": 5,
  "ECB": 5,
  "EIA Today in Energy": 5,
  "Al Jazeera": 4,

  "CNBC": 4,
  "CNBC Top News": 4,
  "Financial Times": 5,
  "Wall Street Journal": 5,
  "MarketWatch": 4,
  "Yahoo Finance": 3,

  "CoinDesk": 4,
  "Cointelegraph": 3,
  "The Block": 4,

  "OilPrice": 3,
  "Google News Metals": 3,
  "Yahoo Gold Futures": 3,

  "Unknown": 1
};


function getSourceQuality(source) {
  return SOURCE_QUALITY[source] || 1;
}


function getSourceQualityLevel(score) {
  if (score >= 5) {
    return "HIGH";
  }

  if (score >= 3) {
    return "MEDIUM";
  }

  return "LOW";
}


function addSourceQuality(articles) {
  return articles.map(article => {
    const score =
      getSourceQuality(
        article.source
      );

    return {
      ...article,

      sourceQualityScore: score,

      sourceQualityLevel:
        getSourceQualityLevel(score)
    };
  });
}


module.exports = {
  SOURCE_QUALITY,
  getSourceQuality,
  getSourceQualityLevel,
  addSourceQuality
};
