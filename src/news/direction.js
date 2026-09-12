const bullishKeywords = [
    "surge",
    "rises",
    "rise",
    "rally",
    "gain",
    "gains",
    "growth",
    "cuts",
    "cut",
    "approval",
    "approved",
    "inflows",
    "demand increases",
    "production cut"
  ];
  
  const bearishKeywords = [
    "falls",
    "fall",
    "drop",
    "drops",
    "decline",
    "declines",
    "crash",
    "selloff",
    "outflows",
    "ban",
    "banned",
    "sanctions",
    "war",
    "conflict",
    "rate hike",
    "raises rates",
    "production increase"
  ];
  
  function detectDirection(article) {
    const title = article.title.toLowerCase();
  
    let bullishScore = 0;
    let bearishScore = 0;
  
    for (const keyword of bullishKeywords) {
      if (title.includes(keyword)) {
        bullishScore++;
      }
    }
  
    for (const keyword of bearishKeywords) {
      if (title.includes(keyword)) {
        bearishScore++;
      }
    }
  
    if (bullishScore > bearishScore) {
      return "BULLISH";
    }
  
    if (bearishScore > bullishScore) {
      return "BEARISH";
    }
  
    return "NEUTRAL";
  }
  
  function addDirection(articles) {
    return articles.map(article => {
      const direction = detectDirection(article);
  
      return {
        ...article,
        direction
      };
    });
  }
  
  module.exports = {
    detectDirection,
    addDirection
  };