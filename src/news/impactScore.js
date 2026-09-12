function calculateImpactScore(article) {

  const title =
    article.title.toLowerCase();

  let score = 1;


  // Major geopolitical events

  const geopoliticalKeywords = [
    "war",
    "conflict",
    "attack",
    "missile",
    "drone attack",
    "invasion"
  ];

  if (
    geopoliticalKeywords.some(
      keyword =>
        title.includes(keyword)
    )
  ) {
    score += 3;
  }


  // Energy / supply disruption

  const supplyKeywords = [
    "pipeline",
    "pipeline shutdown",
    "pipeline shut",
    "supply disruption",
    "supply shortage",
    "production cut",
    "refinery",
    "oil facility",
    "oil terminal"
  ];

  if (
    supplyKeywords.some(
      keyword =>
        title.includes(keyword)
    )
  ) {
    score += 3;
  }


  // Major macro events

  const macroKeywords = [
    "federal reserve",
    "fed",
    "fomc",
    "interest rate",
    "rate decision",
    "rate cut",
    "rate hike",
    "rate cuts",
    "rate hikes",
    "monetary policy",
    "inflation",
    "cpi",
    "recession",
    "bank failure",
    "banking crisis"
  ];

  if (
    macroKeywords.some(
      keyword =>
        title.includes(keyword)
    )
  ) {
    score += 3;
  }


  // Explicit ultra-major triggers (Fed / war class)

  const criticalKeywords = [
    "fomc",
    "rate cut",
    "rate hike",
    "declares war",
    "invasion of",
    "state of war",
    "nuclear",
    "opec emergency"
  ];

  if (
    criticalKeywords.some(
      keyword =>
        title.includes(keyword)
    )
  ) {
    score += 2;
  }


  // Major market assets

  const marketKeywords = [
    "bitcoin etf",
    "ethereum etf",
    "nifty",
    "sensex",
    "oil",
    "gold"
  ];

  if (
    marketKeywords.some(
      keyword =>
        title.includes(keyword)
    )
  ) {
    score += 2;
  }


  // Cap at 10

  if (score > 10) {
    score = 10;
  }


  return score;
}

function getImpactLevel(score) {
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

function addImpactScore(articles) {
  return articles.map(article => {
    const score =
      calculateImpactScore(article);

    return {
      ...article,
      impactScore: score,
      impactLevel:
        getImpactLevel(score)
    };
  });
}

module.exports = {
  calculateImpactScore,
  getImpactLevel,
  addImpactScore
};
