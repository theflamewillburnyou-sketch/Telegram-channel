const {
  shouldPublish
} = require("./publishDecision");


const tests = [

  {
    name: "Critical event",

    event: {
      priorityLevel: "CRITICAL",
      priorityScore: 10,
      confidence: "LOW",
      noveltyLevel: "LOW"
    }
  },


  {
    name: "High priority + medium confidence",

    event: {
      priorityLevel: "HIGH",
      priorityScore: 8,
      confidence: "MEDIUM",
      noveltyLevel: "MEDIUM"
    }
  },


  {
    name: "Low confidence",

    event: {
      priorityLevel: "MEDIUM",
      priorityScore: 6,
      confidence: "LOW",
      noveltyLevel: "HIGH"
    }
  },


  {
    name: "High novelty",

    event: {
      priorityLevel: "MEDIUM",
      priorityScore: 6,
      confidence: "MEDIUM",
      noveltyLevel: "HIGH"
    }
  }

];


for (
  const test of tests
) {

  console.log(
    test.name,
    "→",
    shouldPublish(
      test.event
    )
  );

}
