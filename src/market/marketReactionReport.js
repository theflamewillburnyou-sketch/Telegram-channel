const {
  analyzeMarketReaction
} = require("./marketReaction");

const {
  analyzeCrossMarketReaction
} = require("./crossMarket");


function createMarketReactionReport(
  event,
  outcomes
) {

  const marketReaction =
    analyzeMarketReaction(
      event,
      outcomes
    );


  const crossMarketReaction =
    analyzeCrossMarketReaction(
      marketReaction.reactions
    );


  return {

    eventId:
      event.eventId,

    expectedDirection:
      event.direction,

    totalAssets:
      marketReaction.totalAssets,

    overall:
      crossMarketReaction.overall,

    confirmed:
      marketReaction.confirmed,

    divergences:
      marketReaction.divergences,

    neutral:
      marketReaction.neutral,

    confirmingAssets:
      crossMarketReaction.confirmingAssets,

    divergingAssets:
      crossMarketReaction.divergingAssets,

    neutralAssets:
      crossMarketReaction.neutralAssets,

    reactions:
      marketReaction.reactions

  };
}


module.exports = {
  createMarketReactionReport
};
