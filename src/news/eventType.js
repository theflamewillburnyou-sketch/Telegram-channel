const eventKeywords = {
    GEOPOLITICAL: [
      "war",
      "conflict",
      "attack",
      "missile",
      "invasion",
      "iran",
      "israel",
      "russia",
      "ukraine",
      "taiwan"
    ],
  
    MACRO: [
      "fed",
      "federal reserve",
      "interest rate",
      "inflation",
      "cpi",
      "jobs",
      "unemployment",
      "gdp",
      "recession",
      "treasury"
    ],
  
    REGULATION: [
      "regulation",
      "regulator",
      "sec",
      "ban",
      "banned",
      "sanctions",
      "law",
      "legislation",
      "policy"
    ],
  
    ETF: [
      "etf",
      "bitcoin etf",
      "ethereum etf"
    ],
  
    EARNINGS: [
      "earnings",
      "revenue",
      "profit",
      "quarterly results",
      "guidance"
    ],
  
    SUPPLY_SHOCK: [
      "production cut",
      "production increase",
      "supply disruption",
      "supply shortage",
      "pipeline",
      "refinery",
      "oil facility",
      "opec"
    ],
  
    LEADERSHIP_CHANGE: [
      "ceo steps down",
      "ceo resigns",
      "chief executive",
      "appointed ceo",
      "new ceo",
      "steps down",
      "resigns"
    ]
  };
  
  function detectEventTypes(article) {
    const title = article.title.toLowerCase();
  
    const eventTypes = [];
  
    for (const [eventType, keywords] of Object.entries(eventKeywords)) {
      for (const keyword of keywords) {
        if (title.includes(keyword)) {
          eventTypes.push(eventType);
          break;
        }
      }
    }
  
    if (eventTypes.length === 0) {
      eventTypes.push("OTHER");
    }
  
    return eventTypes;
  }
  
  function addEventType(articles) {
    return articles.map(article => {
      const eventTypes = detectEventTypes(article);
  
      return {
        ...article,
        eventTypes
      };
    });
  }
  
  module.exports = {
    detectEventTypes,
    addEventType
  };