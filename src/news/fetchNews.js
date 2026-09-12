require("dotenv").config();

const { cleanArticle } = require("./cleanNews");

const { deduplicateArticles } = require("./deduplicate");

const { filterRelevantArticles } = require("./relevance");

const { addImpactScore } = require("./impactScore");

const { addMarketTags } = require("./marketTags");

const { addAssetMapping } = require("./assetMapping");

const { addDirection } = require("./direction");

const { addConfidence } = require("./confidence");

const { addImpactExplanation } = require("./impactExplanation");

const { addTimeframe } = require("./timeframe");

const { addEventType } = require("./eventType");

const {
  addPriority
} = require("./priority");

const {
  clusterArticles
} = require("./eventCluster");

const {
  addNovelty
} = require("./novelty");

const {
  createCanonicalEvent
} = require("./canonicalEvent");

const {
  addSourceQuality
} = require("./sourceQuality");

const { addAIInput } = require("../ai/aiInput");

const { addEvidenceConfidence } = require("../ai/evidenceConfidence");

const { shouldUseAI } = require("../ai/aiFilter");

const { routeAI } = require("../ai/aiRouter");

const { checkEvidence } = require("../ai/evidenceCheck");

const { buildFinalAnalysis } = require("../ai/finalAnalysis");

const {
  buildMarketEvent
} = require("../market/marketEventBuilder");

const {
  saveCompleteEvent
} = require("../database/saveCompleteEvent");

const {
  safeFetchRSS
} = require("./safeFetchRSS");

const sources = [
  // Geopolitics
  {
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "geopolitics"
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    category: "geopolitics"
  },

  // World stocks / markets
  {
    name: "BBC Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    category: "markets"
  },
  {
    name: "CNBC Top News",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    category: "markets"
  },
  {
    name: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    category: "markets"
  },
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    category: "markets"
  },

  // Bonds / central banks (official)
  {
    name: "Federal Reserve",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    category: "bonds"
  },
  {
    name: "ECB",
    url: "https://www.ecb.europa.eu/rss/press.html",
    category: "bonds"
  },

  // Crypto
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    category: "crypto"
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    category: "crypto"
  },
  {
    name: "The Block",
    url: "https://www.theblock.co/rss.xml",
    category: "crypto"
  },

  // Power & energy
  {
    name: "EIA Today in Energy",
    url: "https://www.eia.gov/rss/todayinenergy.xml",
    category: "energy"
  },
  {
    name: "OilPrice",
    url: "https://oilprice.com/rss/main",
    category: "energy"
  },

  // Precious metals
  {
    name: "Google News Metals",
    url: "https://news.google.com/rss/search?q=gold+OR+silver+OR+%22precious+metals%22&hl=en-US&gl=US&ceid=US:en",
    category: "metals"
  },
  {
    name: "Yahoo Gold Futures",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC=F&region=US&lang=en-US",
    category: "metals"
  }
];

async function fetchNews() {
  const allArticles = [];

  let successfulSources = 0;
  let failedSources = 0;

  for (const source of sources) {
    try {
      console.log(`Fetching: ${source.name}`);

      const feed =
        await safeFetchRSS(
          source.url
        );

      for (const article of feed.items.slice(0, 5)) {
        console.log("\n========== RAW RSS ITEM ==========\n");

        console.log(
          JSON.stringify(article, null, 2)
        );
        console.log("\n========== RAW RSS ITEM ==========\n");
        const cleanArticleData = cleanArticle(
          article,
          source
        );

        allArticles.push(cleanArticleData);
      }

      successfulSources++;

      console.log(
        `${source.name}: ${Math.min(feed.items.length, 5)} articles`
      );

    } catch (error) {
      failedSources++;

      console.error(
        `${source.name} failed:`,
        error.message
      );

      continue;
    }
  }

  console.log(
    `News sources successful: ${successfulSources}`
  );

  console.log(
    `News sources failed: ${failedSources}`
  );

  console.log(
    `Total articles collected: ${allArticles.length}`
  );

  return allArticles;
}

async function main() {
    const articles = await fetchNews();

    console.log("\n========== RAW ARTICLE ==========\n");
    console.log(JSON.stringify(articles[0], null, 2));
  
    console.log("\n========== CLEAN NEWS ==========\n");
  
    console.log(articles);
  
    console.log(
      `\nTotal clean articles: ${articles.length}`
    );
  
    const uniqueArticles = deduplicateArticles(articles);
    console.log(
      "After deduplication:",
      uniqueArticles.length
    );
  
    console.log("\n========== UNIQUE NEWS ==========\n");
  
    console.log(uniqueArticles);
  
    console.log(
      `\nTotal unique articles: ${uniqueArticles.length}`
    );

    const relevantArticles = filterRelevantArticles(uniqueArticles);

    console.log("\n========== RELEVANT NEWS ==========\n");

    console.log(relevantArticles);
    console.log(
      "After relevance:",
      relevantArticles.length
    );

    console.log(
    `\nTotal relevant articles: ${relevantArticles.length}`
    );

    const clusters =
      clusterArticles(
        relevantArticles
      );

    const clustersWithNovelty =
      addNovelty(
        clusters
      );

    const canonicalEvents =
      clustersWithNovelty
        .map(cluster =>
          createCanonicalEvent(
            cluster
          )
        )
        .filter(Boolean);

    console.log(
      "\n========== EVENT CLUSTERS ==========\n"
    );

    for (
      const event
      of canonicalEvents
    ) {
      console.log({
        title: event.title,
        clusterId: event.clusterId,
        clusterSize: event.clusterSize,
        noveltyScore: event.noveltyScore,
        noveltyLevel: event.noveltyLevel
      });
    }

    const eventsWithSourceQuality =
      addSourceQuality(
        canonicalEvents
      );

    const scoredArticles = addImpactScore(eventsWithSourceQuality);

    console.log("\n========== SCORED NEWS ==========\n");

    console.log(scoredArticles);

    console.log(
      "After impact score:",
      scoredArticles.length
    );

    const taggedArticles = addMarketTags(scoredArticles);

    console.log("\n========== MARKET TAGGED NEWS ==========\n");

    console.log(taggedArticles);

    console.log(
      "After market tags:",
      taggedArticles.length
    );

    const mappedArticles = addAssetMapping(taggedArticles);

    console.log("\n========== ASSET MAPPED NEWS ==========\n");

    console.log(mappedArticles);

    console.log(
      "After asset mapping:",
      mappedArticles.length
    );

    const directedArticles = addDirection(mappedArticles);

    console.log("\n========== DIRECTION ==========\n");

    console.log(directedArticles);

    console.log(
      "After direction:",
      directedArticles.length
    );

    const confidenceArticles = addConfidence(directedArticles);

    console.log("\n========== CONFIDENCE ==========\n");

    console.log(confidenceArticles);

    console.log(
      "After confidence:",
      confidenceArticles.length
    );

    const explainedArticles = addImpactExplanation(confidenceArticles);

    console.log("\n========== IMPACT EXPLANATION ==========\n");

    console.log(explainedArticles);

    console.log(
      "After explanation:",
      explainedArticles.length
    );

    const timeframeArticles = addTimeframe(explainedArticles);

    console.log("\n========== TIMEFRAME ==========\n");

    console.log(timeframeArticles);

    console.log(
      "After timeframe:",
      timeframeArticles.length
    );

    const eventTypeArticles = addEventType(timeframeArticles);

    console.log("\n========== EVENT TYPE ==========\n");

    console.log(eventTypeArticles);

    console.log(
      "After event type:",
      eventTypeArticles.length
    );

    const priorityArticles =
      addPriority(
        eventTypeArticles
      );

    console.log("\n========== PRIORITY ==========\n");

    console.log(priorityArticles);

    console.log(
      "After priority:",
      priorityArticles.length
    );

    const aiReadyArticles = addAIInput(priorityArticles)
      .map(addEvidenceConfidence);

    console.log("\n========== AI INPUT ==========\n");

    console.log(aiReadyArticles);

    console.log(
      "After AI input:",
      aiReadyArticles.length
    );

    console.log(
      "\n========== BEFORE AI FILTER ==========\n"
    );
    
    console.log(
      "AI-ready articles:",
      aiReadyArticles.length
    );
    
    console.log(aiReadyArticles);

    const aiQueue = aiReadyArticles.filter(article =>
      shouldUseAI(article)
    );
    
    const nonAIQueue = aiReadyArticles.filter(article =>
      !shouldUseAI(article)
    );
    
    console.log("\n========== AI QUEUE ==========\n");
    
    console.log(
      `Articles selected for AI: ${aiQueue.length}`
    );
    
    console.log(
      `Articles not selected for AI: ${nonAIQueue.length}`
    );
    
    console.log("\nAI QUEUE:");
    console.log(aiQueue);

    console.log("\n========== RUNNING AI ROUTER ==========\n");

    const aiResults = [];

    for (const article of aiQueue) {
      const result = await routeAI(article);
    
      const evidenceCheck = checkEvidence(
        article,
        result.analysis,
        result.provider
      );
    
      const finalAnalysis = buildFinalAnalysis(
        article,
        result.analysis,
        evidenceCheck
      );

      const articleWithAnalysis = {
        ...article,
        finalAnalysis
      };

      const event =
        await buildMarketEvent(
          articleWithAnalysis
        );

      const eventId =
        saveCompleteEvent(event);

      console.log(
        "Saved market event:",
        eventId
      );
    
      aiResults.push({
        provider: result.provider,
        status: result.status,
        finalAnalysis,
        evidenceCheck,
        eventId
      });
    }

    console.log("\n========== AI RESULTS ==========\n");

    console.dir(aiResults, {
      depth: null
    });

}

module.exports = {
  fetchNews
};

if (require.main === module) {
  main();
}