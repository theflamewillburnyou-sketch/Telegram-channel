const {
  saveEvent,
  getEvent
} = require("./eventRepository");

const {
  savePrediction,
  getPrediction,
  predictionExists
} = require("./predictionRepository");


const eventId =
  "mty177mzvf4lpw";


const finalAnalysis = {

  final: {

    direction: "BULLISH",

    magnitude: "HIGH",

    eventType: "GEOPOLITICAL",

    timeframe: "IMMEDIATE",

    finalConfidence: "MEDIUM"

  }

};


/*
 * Parent event row required for FK integrity
 * after a development database rebuild.
 */
if (!getEvent(eventId)) {
  saveEvent({
    eventId,
    title:
      "Saudi Arabia shuts key oil pipeline after drone attack launched from Iraq",
    source: "BBC World",
    link:
      "https://www.bbc.co.uk/news/articles/c62m933465eo?at_medium=RSS&at_campaign=rss",
    publishedAt: "Sat, 12 Sep 2026 04:43:10 GMT",
    marketTags: ["oil"],
    affectedAssets: ["BRENT", "WTI"],
    direction: "BULLISH",
    magnitude: "HIGH",
    eventType: "GEOPOLITICAL",
    timeframe: "IMMEDIATE",
    confidence: "MEDIUM"
  });
}


console.log(
  "\n========== SAVING PREDICTION ==========\n"
);


if (!predictionExists(eventId)) {

  savePrediction(
    eventId,
    finalAnalysis
  );

  console.log(
    "Prediction saved."
  );

} else {

  console.log(
    "Prediction already exists."
  );
}


console.log(
  "\n========== STORED PREDICTION ==========\n"
);


console.log(
  getPrediction(eventId)
);
