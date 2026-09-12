function calculatePriority(article) {
  let score = 0;

  // Base impact
  score += article.impactScore || 0;

  // Multiple markets affected
  if (
    article.marketTags &&
    article.marketTags.length >= 2
  ) {
    score += 2;
  }

  // Multiple assets affected
  if (
    article.affectedAssets &&
    article.affectedAssets.length >= 2
  ) {
    score += 2;
  }

  // Major event types
  const majorEvents = [
    "GEOPOLITICAL",
    "MACRO",
    "SUPPLY_SHOCK",
    "ETF"
  ];

  if (
    article.eventTypes &&
    article.eventTypes.some(
      type => majorEvents.includes(type)
    )
  ) {
    score += 3;
  }


  // Extra weight for channel-level major headlines
  const title =
    String(article.title || "")
      .toLowerCase();

  const channelMajorKeywords = [
    "fomc",
    "federal reserve",
    "rate cut",
    "rate hike",
    "war",
    "invasion",
    "missile",
    "drone attack",
    "pipeline"
  ];

  if (
    channelMajorKeywords.some(
      keyword => title.includes(keyword)
    )
  ) {
    score += 2;
  }


  // Cap at 10
  return Math.min(score, 10);
}


function getPriorityLevel(score) {
  if (score >= 9) {
    return "CRITICAL";
  }

  if (score >= 7) {
    return "HIGH";
  }

  if (score >= 4) {
    return "MEDIUM";
  }

  return "LOW";
}


function addPriority(articles) {
  return articles.map(article => {
    const priorityScore =
      calculatePriority(article);

    return {
      ...article,

      priorityScore,

      priorityLevel:
        getPriorityLevel(
          priorityScore
        )
    };
  });
}


module.exports = {
  calculatePriority,
  getPriorityLevel,
  addPriority
};
