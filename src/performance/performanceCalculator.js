function getReliability(evaluated) {

  if (evaluated < 10) {
    return "INSUFFICIENT_DATA";
  }

  if (evaluated < 30) {
    return "EARLY_DATA";
  }

  if (evaluated < 100) {
    return "DEVELOPING";
  }

  return "ESTABLISHED";
}


function filterRowsByDays(rows, days) {

  const cutoff =
    Date.now() -
    days * 24 * 60 * 60 * 1000;

  return rows.filter(row => {

    const predictedTime =
      new Date(row.predicted_at).getTime();

    return (
      Number.isFinite(predictedTime) &&
      predictedTime >= cutoff
    );
  });
}


function calculateRollingPerformance(rows) {

  const last7Days =
    filterRowsByDays(rows, 7);

  const last30Days =
    filterRowsByDays(rows, 30);

  const last90Days =
    filterRowsByDays(rows, 90);


  return {

    "7D":
      calculatePerformance(
        last7Days
      ),

    "30D":
      calculatePerformance(
        last30Days
      ),

    "90D":
      calculatePerformance(
        last90Days
      ),

    "ALL":
      calculatePerformance(
        rows
      )

  };
}


function calculatePerformance(rows) {

  let confirmed = 0;
  let divergence = 0;
  let neutral = 0;


  for (const row of rows) {

    if (row.result === "CONFIRMED") {
      confirmed++;
    }

    else if (row.result === "DIVERGENCE") {
      divergence++;
    }

    else if (row.result === "NEUTRAL") {
      neutral++;
    }
  }


  const evaluated =
    confirmed + divergence;


  const directionalCoverage =
    rows.length === 0
      ? 0
      : Number(
          (
            evaluated /
            rows.length *
            100
          ).toFixed(2)
        );


  const confirmationRate =
    evaluated === 0
      ? null
      : Number(
          (
            confirmed /
            evaluated *
            100
          ).toFixed(2)
        );


  return {

    total:
      rows.length,

    confirmed,

    divergence,

    neutral,

    evaluated,

    sampleSize: evaluated,

    directionalCoverage,

    confirmationRate,

    reliability:
      getReliability(evaluated)

  };
}


function calculatePerformanceByGroup(rows, groupBy) {

  const groups = {};

  for (const row of rows) {

    const key = row[groupBy];

    if (!key) {
      continue;
    }

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(row);
  }


  const result = {};


  for (const key of Object.keys(groups)) {

    result[key] =
      calculatePerformance(
        groups[key]
      );
  }


  return result;
}


function calculatePerformanceByAssetAndHorizon(rows) {

  const groups = {};


  for (const row of rows) {

    if (!row.symbol || !row.horizon) {
      continue;
    }


    const asset =
      row.symbol;

    const horizon =
      row.horizon;


    if (!groups[asset]) {
      groups[asset] = {};
    }


    if (!groups[asset][horizon]) {
      groups[asset][horizon] = [];
    }


    groups[asset][horizon].push(row);
  }


  const result = {};


  for (const asset of Object.keys(groups)) {

    result[asset] = {};


    for (
      const horizon
      of Object.keys(groups[asset])
    ) {

      result[asset][horizon] =
        calculatePerformance(
          groups[asset][horizon]
        );
    }
  }


  return result;
}


function getDisplayConfirmationRate(performance) {

  if (
    performance.reliability ===
    "INSUFFICIENT_DATA"
  ) {
    return null;
  }

  return performance.confirmationRate;
}


module.exports = {
  calculatePerformance,
  calculatePerformanceByGroup,
  calculatePerformanceByAssetAndHorizon,
  calculateRollingPerformance,
  getReliability,
  getDisplayConfirmationRate
};
