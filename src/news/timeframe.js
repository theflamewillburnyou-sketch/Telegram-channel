function detectTimeframe(article) {
    const title = article.title.toLowerCase();
  
    // Events that can affect markets immediately
    const immediateKeywords = [
      "war",
      "attack",
      "missile",
      "rate decision",
      "fed",
      "interest rate",
      "cpi",
      "inflation",
      "opec",
      "oil",
      "tariff",
      "sanctions",
      "bank failure",
      "crash"
    ];
  
    for (const keyword of immediateKeywords) {
      if (title.includes(keyword)) {
        return "IMMEDIATE";
      }
    }
  
    // Events that can influence markets over several days
    const shortTermKeywords = [
      "earnings",
      "jobs",
      "unemployment",
      "etf",
      "inflows",
      "outflows",
      "approval",
      "regulation"
    ];
  
    for (const keyword of shortTermKeywords) {
      if (title.includes(keyword)) {
        return "SHORT_TERM";
      }
    }
  
    // Default for events whose effects usually develop gradually
    return "MEDIUM_TERM";
  }
  
  function addTimeframe(articles) {
    return articles.map(article => {
      const timeframe = detectTimeframe(article);
  
      return {
        ...article,
        timeframe
      };
    });
  }
  
  module.exports = {
    detectTimeframe,
    addTimeframe
  };