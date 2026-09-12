require("dotenv").config();

const {
  routeAI
} = require("./aiRouter");


const article = {

  title:
    "Saudi Arabia shuts key oil pipeline after drone attack launched from Iraq",

  content:
    "Saudi Arabia shuts key oil pipeline after drone attack launched from Iraq.",

  source:
    "BBC",

  marketTags:
    ["oil"],

  affectedAssets:
    ["BRENT", "WTI"],

  direction:
    "NEUTRAL",

  impactLevel:
    "CRITICAL",

  impactScore:
    10,

  eventTypes:
    [
      "GEOPOLITICAL",
      "SUPPLY_SHOCK"
    ],

  timeframe:
    "IMMEDIATE",

  priorityScore:
    10,

  priorityLevel:
    "CRITICAL",

  evidenceConfidence:
    "MEDIUM"
};


routeAI(article)
  .then(result => {

    console.log(
      "\n========== AI ROUTER RESULT ==========\n"
    );

    console.dir(
      result,
      { depth: null }
    );

  })
  .catch(error => {

    console.error(
      "Router test failed:",
      error
    );

  });
