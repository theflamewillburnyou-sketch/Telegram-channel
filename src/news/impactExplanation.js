function generateImpactExplanation(article) {
    const { marketTags, affectedAssets, direction } = article;
  
    let explanation = "";
  
    if (marketTags.includes("crypto") || marketTags.includes("cryptoMarket")) {
      explanation =
        "The event is relevant to the crypto market and may affect sentiment around crypto infrastructure and institutional activity.";
    }
  
    if (marketTags.includes("oil") || marketTags.includes("energy")) {
      explanation =
        "The event may affect oil or energy supply, demand, pricing, or energy-market sentiment.";
    }
  
    if (marketTags.includes("gold") || marketTags.includes("copper")) {
      explanation =
        "The event may influence metals demand, inflation expectations, or industrial/precious-metals sentiment.";
    }
  
    if (marketTags.includes("usStocks") || marketTags.includes("stockMarket")) {
      explanation =
        "The event may affect equities through earnings, corporate actions, economic expectations, interest rates, or investor sentiment.";
    }

    if (marketTags.includes("europeStocks")) {
      explanation =
        "The event may affect European equities through earnings, policy, growth expectations, or regional risk sentiment.";
    }
  
    if (marketTags.includes("indiaStocks")) {
      explanation =
        "The event may affect Indian equities through earnings, economic expectations, foreign flows, or domestic sentiment.";
    }

    if (marketTags.includes("macro")) {
      explanation =
        "The event is a macro data or policy signal that can reprice equities, bonds, and risk appetite.";
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