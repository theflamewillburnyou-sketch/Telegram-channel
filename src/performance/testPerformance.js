const {
  getPerformanceRows
} = require("./performanceRepository");

const {
  calculatePerformance,
  calculatePerformanceByGroup,
  calculatePerformanceByAssetAndHorizon,
  calculateRollingPerformance
} = require("./performanceCalculator");


const rows =
  getPerformanceRows();


console.log(
  `Rows found: ${rows.length}`
);


// Overall performance

const overall =
  calculatePerformance(rows);


console.log(
  "\n========== OVERALL PERFORMANCE ==========\n"
);

console.log(overall);


// Performance by asset

const byAsset =
  calculatePerformanceByGroup(
    rows,
    "symbol"
  );


console.log(
  "\n========== PERFORMANCE BY ASSET ==========\n"
);

console.dir(
  byAsset,
  { depth: null }
);


// Performance by horizon

const byHorizon =
  calculatePerformanceByGroup(
    rows,
    "horizon"
  );


console.log(
  "\n========== PERFORMANCE BY HORIZON ==========\n"
);

console.dir(
  byHorizon,
  { depth: null }
);


// Performance by asset + horizon

const byAssetAndHorizon =
  calculatePerformanceByAssetAndHorizon(
    rows
  );


console.log(
  "\n========== PERFORMANCE BY ASSET + HORIZON ==========\n"
);

console.dir(
  byAssetAndHorizon,
  { depth: null }
);


// Performance by event type

const byEventType =
  calculatePerformanceByGroup(
    rows,
    "event_type"
  );


console.log(
  "\n========== PERFORMANCE BY EVENT TYPE ==========\n"
);

console.dir(
  byEventType,
  { depth: null }
);


// Performance by confidence

const byConfidence =
  calculatePerformanceByGroup(
    rows,
    "confidence"
  );


console.log(
  "\n========== PERFORMANCE BY CONFIDENCE ==========\n"
);

console.dir(
  byConfidence,
  { depth: null }
);


const rolling =
  calculateRollingPerformance(
    rows
  );


console.log(
  "\n========== ROLLING PERFORMANCE ==========\n"
);

console.dir(
  rolling,
  { depth: null }
);
