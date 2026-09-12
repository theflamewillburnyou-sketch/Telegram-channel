const {
  getPerformanceRows
} = require("../performance/performanceRepository");

const {
  calculatePerformance,
  calculatePerformanceByGroup,
  calculatePerformanceByAssetAndHorizon,
  calculateRollingPerformance
} = require("../performance/performanceCalculator");


function runPerformanceJob() {

  console.log(
    "\n========== PERFORMANCE JOB START ==========\n"
  );


  try {

    const rows =
      getPerformanceRows();


    console.log(
      `Performance rows: ${rows.length}`
    );


    const overall =
      calculatePerformance(
        rows
      );


    const byAsset =
      calculatePerformanceByGroup(
        rows,
        "symbol"
      );


    const byEventType =
      calculatePerformanceByGroup(
        rows,
        "event_type"
      );


    const byConfidence =
      calculatePerformanceByGroup(
        rows,
        "confidence"
      );


    const byAssetAndHorizon =
      calculatePerformanceByAssetAndHorizon(
        rows
      );


    const rolling =
      calculateRollingPerformance(
        rows
      );


    const report = {

      overall,

      byAsset,

      byEventType,

      byConfidence,

      byAssetAndHorizon,

      rolling

    };


    console.log(
      "\n========== PERFORMANCE REPORT ==========\n"
    );


    console.dir(
      report,
      { depth: null }
    );


    console.log(
      "\n========== PERFORMANCE JOB COMPLETE ==========\n"
    );


    return report;

  } catch (error) {

    console.error(
      "\nPERFORMANCE JOB ERROR:",
      error.message
    );

    return null;
  }
}


module.exports = {
  runPerformanceJob
};
