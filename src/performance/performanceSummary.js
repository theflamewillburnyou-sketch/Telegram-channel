function createPerformanceSummary(
  performance
) {

  return {

    evaluated:
      performance.evaluated,

    sampleSize:
      performance.sampleSize,

    confirmed:
      performance.confirmed,

    divergence:
      performance.divergence,

    neutral:
      performance.neutral,

    directionalCoverage:
      performance.directionalCoverage,

    confirmationRate:
      performance.confirmationRate,

    reliability:
      performance.reliability

  };
}


module.exports = {
  createPerformanceSummary
};
