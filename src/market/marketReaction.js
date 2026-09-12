const {
  createExpectedVsActual
} = require("./expectedVsActual");


function analyzeMarketReaction(
  event,
  outcomes
) {
  const reactions = outcomes.map(
    outcome => {

      const expectedVsActual =
        outcome.expectedVsActual ||
        createExpectedVsActual(
          event.direction,
          outcome
        );

      return {
        symbol: outcome.symbol,

        percentageChange:
          outcome.percentageChange,

        direction:
          outcome.direction,

        expectedVsActual
      };
    }
  );


  const confirmed =
    reactions.filter(
      reaction =>
        reaction.expectedVsActual.result ===
        "CONFIRMED"
    ).length;


  const divergences =
    reactions.filter(
      reaction =>
        reaction.expectedVsActual.result ===
        "DIVERGENCE"
    ).length;


  const neutral =
    reactions.filter(
      reaction =>
        reaction.expectedVsActual.result ===
        "NEUTRAL"
    ).length;


  let overall = "MIXED";


  if (reactions.length === 0) {

    overall = "NO_DATA";

  } else if (
    divergences > confirmed &&
    divergences > neutral
  ) {

    overall = "DIVERGENCE";

  } else if (
    confirmed > divergences &&
    confirmed >= neutral
  ) {

    overall = "CONFIRMED";

  } else if (
    neutral === reactions.length
  ) {

    overall = "NEUTRAL";
  }


  return {
    eventId:
      event.eventId,

    expectedDirection:
      event.direction,

    totalAssets:
      reactions.length,

    confirmed,

    divergences,

    neutral,

    overall,

    reactions
  };
}


module.exports = {
  analyzeMarketReaction
};
