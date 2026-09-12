const {
  detectPostType
} = require("./postType");


const tests = [

  {
    name: "Critical event",

    event: {
      priorityLevel: "CRITICAL",
      eventType: "OTHER",
      marketTags: []
    }
  },


  {
    name: "Geopolitical event",

    event: {
      priorityLevel: "HIGH",
      eventType: "GEOPOLITICAL",
      marketTags: [
        "geopolitics"
      ]
    }
  },


  {
    name: "Crypto event",

    event: {
      priorityLevel: "HIGH",
      eventType: "CORPORATE_ACTION",
      marketTags: [
        "crypto"
      ]
    }
  },


  {
    name: "Macro event",

    event: {
      priorityLevel: "HIGH",
      eventType: "MACRO",
      marketTags: []
    }
  },


  {
    name: "ETF event",

    event: {
      priorityLevel: "HIGH",
      eventType: "ETF",
      marketTags: [
        "crypto"
      ]
    }
  }

];


for (
  const test of tests
) {

  console.log(
    `${test.name} →`,
    detectPostType(
      test.event
    )
  );

}
