const {
  fetchNews
} = require("../news/fetchNews");

const {
  processNews
} = require("../news/processNews");

const {
  shouldPublish
} = require("./publishDecision");

const {
  detectPostType
} = require("./postType");

const {
  buildTelegramPost
} = require("./postBuilder");

const {
  publishMessage
} = require("./telegramPublisher");

const {
  isPublished,
  savePublishedPost
} = require("../database/publishRepository");

const {
  shouldUseAI
} = require("../ai/aiFilter");

const {
  routeAI
} = require("../ai/aiRouter");

const {
  addEvidenceConfidence
} = require("../ai/evidenceConfidence");

const {
  checkEvidence
} = require("../ai/evidenceCheck");

const {
  buildFinalAnalysis
} = require("../ai/finalAnalysis");

const {
  buildMarketEvent
} = require("../market/marketEventBuilder");

const {
  saveSnapshot
} = require("../database/marketRepository");

const {
  saveEvent,
  getEvent,
  getEventByLink,
  updateEventFinalAnalysis
} = require("../database/eventRepository");

const {
  savePredictionIfNeeded
} = require("../prediction/savePredictionIfNeeded");


async function run() {

  console.log(
    "\n========== REAL EVENT TEST ==========\n"
  );


  // 1. Fetch and process real news
  const rawArticles =
    await fetchNews();


  const articles =
    processNews(
      rawArticles
    );


  console.log(
    "Raw articles fetched:",
    rawArticles.length
  );

  console.log(
    "Processed events:",
    articles.length
  );


  // Safety: only inspect the first article
  const article =
    articles[0];


  if (!article) {

    console.log(
      "No articles available."
    );

    return;
  }


  console.log(
    "\nSelected article:"
  );

  console.log(
    article.title
  );

  console.log(
    "\n========== ARTICLE CLASSIFICATION ==========\n"
  );

  console.log({
    impactScore: article.impactScore,
    impactLevel: article.impactLevel,

    marketTags: article.marketTags,

    affectedAssets: article.affectedAssets,

    direction: article.direction,

    confidence: article.confidence,

    eventTypes: article.eventTypes,

    priorityScore: article.priorityScore,

    priorityLevel: article.priorityLevel,

    timeframe: article.timeframe
  });


  // 2. Check duplicate publishing
  const eventId =
    article.link;


  if (
    isPublished(eventId)
  ) {

    console.log(
      "\nThis article was already published."
    );

    return;
  }


  // 3. AI routing
  const useAI =
    shouldUseAI(article);


  console.log(
    "\nUse AI:",
    useAI
  );


  let aiResult = null;

  if (useAI) {

    console.log(
      "\n========== AI ANALYSIS ==========\n"
    );

    aiResult =
      await routeAI(article);

  } else {

    console.log(
      "\nAI not required for this event."
    );

  }


  // 4. Handle AI result
  let finalAnalysis;


  if (aiResult) {

    console.log(
      "AI Provider:",
      aiResult.provider
    );

    console.log(
      "AI Status:",
      aiResult.status
    );


    // Evidence confidence

    const articleWithEvidence =
      addEvidenceConfidence(
        article
      );


    const evidenceCheck =
      checkEvidence(
        articleWithEvidence,
        aiResult.analysis,
        aiResult.provider
      );


    finalAnalysis =
      buildFinalAnalysis(
        articleWithEvidence,
        aiResult.analysis,
        evidenceCheck
      );

    const existingEvent =
      article.eventId
        ? getEvent(article.eventId)
        : getEventByLink(article.link);

    const eventIdForUpdate =
      article.eventId ||
      existingEvent?.eventId ||
      existingEvent?.event_id;

    if (eventIdForUpdate) {
      updateEventFinalAnalysis(
        eventIdForUpdate,
        finalAnalysis
      );

      console.log(
        "\nFinal analysis updated in SQLite for:",
        eventIdForUpdate
      );
    }


  } else {

    console.log(
      "No AI analysis available."
    );

  }


  console.log(
    "\n========== FINAL ANALYSIS ==========\n"
  );

  console.log(
    JSON.stringify(
      finalAnalysis,
      null,
      2
    )
  );


  if (!finalAnalysis) {

    console.log(
      "No final analysis available. Stopping before publish."
    );

    return;
  }


  // 5. Final publishable event from AI-reviewed analysis
  const publishableEvent = {
    ...article,

    eventId: article.link,

    finalAnalysis,

    direction:
      finalAnalysis.final.direction,

    magnitude:
      finalAnalysis.final.magnitude,

    eventType:
      finalAnalysis.final.eventType,

    eventTypes: [
      finalAnalysis.final.eventType
    ],

    timeframe:
      finalAnalysis.final.timeframe,

    confidence:
      finalAnalysis.final.finalConfidence,

    whyItMatters:
      finalAnalysis.whyItMatters,

    summary:
      finalAnalysis.summary,

    bullishFactors:
      finalAnalysis.bullishFactors,

    bearishFactors:
      finalAnalysis.bearishFactors,

    risks:
      finalAnalysis.risks,

    whatToWatch:
      finalAnalysis.whatToWatch
  };


  const postType =
    detectPostType(
      publishableEvent
    );

  publishableEvent.postType =
    postType;


  console.log(
    "\n========== BUILDING MARKET EVENT ==========\n"
  );

  const marketEvent =
    await buildMarketEvent(
      publishableEvent
    );


  console.log(
    "\n========== MARKET SNAPSHOTS ==========\n"
  );

  console.log(
    marketEvent.snapshots
  );


  // Persist event + baseline snapshots for later outcome comparison
  let persistedEvent =
    getEvent(publishableEvent.eventId) ||
    getEventByLink(publishableEvent.link);

  if (!persistedEvent) {
    saveEvent(publishableEvent);
    persistedEvent = {
      eventId: publishableEvent.eventId
    };
  }

  const dbEventId =
    persistedEvent.eventId ||
    persistedEvent.event_id ||
    publishableEvent.eventId;

  updateEventFinalAnalysis(
    dbEventId,
    finalAnalysis
  );

  console.log(
    "\nFinal analysis written to SQLite for:",
    dbEventId
  );

  const predictionResult =
    savePredictionIfNeeded(
      dbEventId,
      finalAnalysis
    );

  console.log(
    "Prediction:",
    predictionResult
  );

  for (const snapshot of marketEvent.snapshots) {
    saveSnapshot(
      dbEventId,
      snapshot
    );
  }

  console.log(
    "\nSnapshots saved to SQLite:",
    marketEvent.snapshots.length
  );


  // 6. Final publish decision
  const publish =
    shouldPublish(
      publishableEvent
    );


  console.log(
    "\n========== FINAL PUBLISH DECISION ==========\n"
  );

  console.log({
    shouldPublish: publish,
    postType: postType,
    direction: publishableEvent.direction,
    magnitude: publishableEvent.magnitude,
    timeframe: publishableEvent.timeframe,
    confidence: publishableEvent.confidence
  });


  if (!publish) {

    console.log(
      "Event rejected by final publish decision."
    );

    return;
  }


  // 7. Build Telegram post (do not publish yet)
  const message =
    buildTelegramPost(
      publishableEvent,
      null
    );


  console.log(
    "\n========== FINAL TELEGRAM POST ==========\n"
  );

  console.log(message);


  console.log(
    "\nPUBLISHING DISABLED FOR FIRST REAL-EVENT TEST"
  );

  return;


  const result =
    await publishMessage(
      message
    );


  savePublishedPost(
    eventId,
    result.message_id
  );


  console.log(
    "\nReal event published successfully."
  );

  console.log(
    "Telegram message ID:",
    result.message_id
  );
}


run()
  .catch(error => {

    console.error(
      "\nReal event test failed:",
      error.message
    );

  });
