/**
 * ESM orchestration port of src/news/processNews.js.
 *
 * News transform modules under src/news/*.js remain CommonJS.
 * Wrangler can bundle them; Node ESM uses default/named interop.
 */

import * as dedupeMod from "../../news/deduplicate.js";
import * as relevanceMod from "../../news/relevance.js";
import * as clusterMod from "../../news/eventCluster.js";
import * as noveltyMod from "../../news/novelty.js";
import * as canonicalMod from "../../news/canonicalEvent.js";
import * as sourceQualityMod from "../../news/sourceQuality.js";
import * as impactScoreMod from "../../news/impactScore.js";
import * as marketTagsMod from "../../news/marketTags.js";
import * as assetMappingMod from "../../news/assetMapping.js";
import * as directionMod from "../../news/direction.js";
import * as confidenceMod from "../../news/confidence.js";
import * as impactExplanationMod from "../../news/impactExplanation.js";
import * as timeframeMod from "../../news/timeframe.js";
import * as eventTypeMod from "../../news/eventType.js";
import * as evidenceConfidenceMod from "../../ai/evidenceConfidence.js";
import * as priorityMod from "../../news/priority.js";

function pickExport(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }

  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }

  if (typeof mod?.default === "function" && name === "default") {
    return mod.default;
  }

  throw new Error(
    `Unable to resolve export "${name}" from news transform module`
  );
}

const deduplicateArticles = pickExport(dedupeMod, "deduplicateArticles");
const filterRelevantArticles = pickExport(
  relevanceMod,
  "filterRelevantArticles"
);
const clusterArticles = pickExport(clusterMod, "clusterArticles");
const addNovelty = pickExport(noveltyMod, "addNovelty");
const createCanonicalEvent = pickExport(
  canonicalMod,
  "createCanonicalEvent"
);
const addSourceQuality = pickExport(sourceQualityMod, "addSourceQuality");
const addImpactScore = pickExport(impactScoreMod, "addImpactScore");
const addMarketTags = pickExport(marketTagsMod, "addMarketTags");
const addAssetMapping = pickExport(assetMappingMod, "addAssetMapping");
const addDirection = pickExport(directionMod, "addDirection");
const addConfidence = pickExport(confidenceMod, "addConfidence");
const addImpactExplanation = pickExport(
  impactExplanationMod,
  "addImpactExplanation"
);
const addTimeframe = pickExport(timeframeMod, "addTimeframe");
const addEventType = pickExport(eventTypeMod, "addEventType");
const addEvidenceConfidence = pickExport(
  evidenceConfidenceMod,
  "addEvidenceConfidence"
);
const addPriority = pickExport(priorityMod, "addPriority");

/**
 * Same pipeline as local processNews(articles).
 */
export function processNews(articles) {
  // 1. Remove duplicates
  const uniqueArticles = deduplicateArticles(articles);

  // 2. Keep relevant market news
  const relevantArticles = filterRelevantArticles(uniqueArticles);

  // 3. Cluster related stories
  const clusters = clusterArticles(relevantArticles);

  // 4. Calculate novelty
  const clustersWithNovelty = addNovelty(clusters);

  // 5. Select one canonical article from each cluster
  let events = clustersWithNovelty
    .map((cluster) => createCanonicalEvent(cluster))
    .filter(Boolean);

  // 6. Source quality
  events = addSourceQuality(events);

  // 7. Impact
  events = addImpactScore(events);

  // 8. Market tags
  events = addMarketTags(events);

  // 9. Asset mapping
  events = addAssetMapping(events);

  // 10. Direction
  events = addDirection(events);

  // 11. Confidence
  events = addConfidence(events);

  // 12. Impact explanation
  events = addImpactExplanation(events);

  // 13. Timeframe
  events = addTimeframe(events);

  // 14. Event type
  events = addEventType(events);

  // 15. Evidence confidence
  events = addEvidenceConfidence(events);

  // 16. Priority
  events = addPriority(events);

  return events;
}
