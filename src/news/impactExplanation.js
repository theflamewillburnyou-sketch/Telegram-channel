function generateImpactExplanation(article) {
    const { marketTags, affectedAssets, direction } = article;
  
    let explanation = "";
  
    if (marketTags.includes("crypto")) {
      explanation =
        "The event is relevant to the crypto market and may affect sentiment around crypto infrastructure and institutional activity.";
    }
  
    if (marketTags.includes("oil")) {
      explanation =
        "The event may affect oil supply, demand, pricing, or energy-market sentiment.";
    }
  
    if (marketTags.includes("gold")) {
      explanation =
        "The event may influence safe-haven demand, inflation expectations, or precious-metals sentiment.";
    }
  
    if (marketTags.includes("usStocks")) {
      explanation =
        "The event may affect U.S. equities through earnings, economic expectations, interest rates, or investor sentiment.";
    }
  
    if (marketTags.includes("indiaStocks")) {
      explanation =
        "The event may affect Indian equities through earnings, economic expectations, foreign flows, or domestic sentiment.";
    }
  
    if (marketTags.includes("geopolitics")) {
      explanation =
        "The event may affect markets through geopolitical risk, trade, supply chains, energy prices, and investor risk appetite.";
    }
  
    if (!explanation) {
      explanation =
        "The event has potential market relevance, but its direct impact is currently unclear.";
    }
  
    return explanation;
  }
  
  function addImpactExplanation(articles) {
    return articles.map(article => {
      const explanation = generateImpactExplanation(article);
  
      return {
        ...article,
        impactExplanation: explanation
      };
    });
  }
  
  module.exports = {
    generateImpactExplanation,
    addImpactExplanation
  };