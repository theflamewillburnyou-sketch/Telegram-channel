const {
  deduplicateArticles
} = require("./deduplicate");

const {
  filterRelevantArticles
} = require("./relevance");

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

const {
  addImpactScore
} = require("./impactScore");

const {
  addMarketTags
} = require("./marketTags");

const {
  addAssetMapping
} = require("./assetMapping");

const {
  addDirection
} = require("./direction");

const {
  addConfidence
} = require("./confidence");

const {
  addImpactExplanation
} = require("./impactExplanation");

const {
  addTimeframe
} = require("./timeframe");

const {
  addEventType
} = require("./eventType");

const {
  addEvidenceConfidence
} = require("../ai/evidenceConfidence");

const {
  addPriority
} = require("./priority");


function processNews(articles) {

  // 1. Remove duplicates

  const uniqueArticles =
    deduplicateArticles(
      articles
    );


  // 2. Keep relevant market news

  const relevantArticles =
    filterRelevantArticles(
      uniqueArticles
    );


  // 3. Cluster related stories

  const clusters =
    clusterArticles(
      relevantArticles
    );


  // 4. Calculate novelty

  const clustersWithNovelty =
    addNovelty(
      clusters
    );


  // 5. Select one canonical article
  // from each cluster

  let events =
    clustersWithNovelty
      .map(cluster =>
        createCanonicalEvent(
          cluster
        )
      )
      .filter(Boolean);


  // 6. Source quality

  events =
    addSourceQuality(
      events
    );


  // 7. Impact

  events =
    addImpactScore(
      events
    );


  // 8. Market tags

  events =
    addMarketTags(
      events
    );


  // 9. Asset mapping

  events =
    addAssetMapping(
      events
    );


  // 10. Direction

  events =
    addDirection(
      events
    );


  // 11. Confidence

  events =
    addConfidence(
      events
    );


  // 12. Impact explanation

  events =
    addImpactExplanation(
      events
    );


  // 13. Timeframe

  events =
    addTimeframe(
      events
    );


  // 14. Event type

  events =
    addEventType(
      events
    );


  // 15. Evidence confidence

  events =
    addEvidenceConfidence(
      events
    );


  // 16. Priority

  events =
    addPriority(
      events
    );


  return events;
}


module.exports = {
  processNews
};
