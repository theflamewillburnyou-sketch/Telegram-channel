const {
  runOutcomeJob
} = require("./jobs/outcomeJob");

console.log(
  "\n================================"
);

console.log(
  "   MIDNIGHT SOCIETY ENGINE"
);

console.log(
  "================================\n"
);


// Run once when application starts
runOutcomeJob();

console.log(
  "Outcome scheduler started."
);
