function analyzeCrossMarketReaction(
  reactions
) {
  if (!reactions || reactions.length === 0) {
    return {
      status: "NO_DATA",
      totalAssets: 0,
      confirmingAssets: [],
      divergingAssets: [],
      neutralAssets: [],
      overall: "NO_DATA"
    };
  }


  const confirmingAssets =
    reactions
      .filter(
        reaction =>
          reaction.expectedVsActual?.result ===
          "CONFIRMED"
      )
      .map(
        reaction => reaction.symbol
      );


  const divergingAssets =
    reactions
      .filter(
        reaction =>
          reaction.expectedVsActual?.result ===
          "DIVERGENCE"
      )
      .map(
        reaction => reaction.symbol
      );


  const neutralAssets =
    reactions
      .filter(
        reaction =>
          reaction.expectedVsActual?.result ===
          "NEUTRAL"
      )
      .map(
        reaction => reaction.symbol
      );


  let overall = "MIXED";


  if (
    divergingAssets.length >
    confirmingAssets.length
  ) {
    overall = "DIVERGENCE";

  } else if (
    confirmingAssets.length >
    divergingAssets.length
  ) {
    overall = "CONFIRMED";

  } else if (
    neutralAssets.length ===
    reactions.length
  ) {
    overall = "NEUTRAL";
  }


  return {
    status: "SUCCESS",

    totalAssets:
      reactions.length,

    confirmingAssets,

    divergingAssets,

    neutralAssets,

    overall
  };
}


module.exports = {
  analyzeCrossMarketReaction
};
