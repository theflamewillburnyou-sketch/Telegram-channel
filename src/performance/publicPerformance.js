function formatPublicPerformance(
  performance
) {

  const result = {

    sampleSize:
      performance.sampleSize,

    directionalCoverage:
      performance.directionalCoverage,

    reliability:
      performance.reliability

  };


  if (
    performance.reliability !==
    "INSUFFICIENT_DATA"
  ) {

    result.confirmationRate =
      performance.confirmationRate;

  } else {

    result.confirmationRate =
      null;

  }


  return result;
}


module.exports = {
  formatPublicPerformance
};
