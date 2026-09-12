function detectPostType(event) {

  const eventTypes =
    event.eventTypes ||
    [];


  const priorityLevel =
    event.priorityLevel ||
    "LOW";


  const marketTags =
    event.marketTags ||
    [];


  // Prefer specific market mechanisms over generic BREAKING

  if (
    event.eventType === "SUPPLY_SHOCK" ||
    eventTypes.includes(
      "SUPPLY_SHOCK"
    )
  ) {
    return "SUPPLY_SHOCK";
  }


  // Critical events

  if (
    priorityLevel === "CRITICAL"
  ) {
    return "BREAKING";
  }


  // Geopolitical events

  if (
    event.eventType === "GEOPOLITICAL" ||
    eventTypes.includes(
      "GEOPOLITICAL"
    ) ||
    marketTags.includes(
      "geopolitics"
    )
  ) {
    return "GEOPOLITICAL";
  }


  // Macro

  if (
    eventTypes.includes(
      "MACRO"
    )
  ) {
    return "MACRO";
  }


  // ETF

  if (
    eventTypes.includes(
      "ETF"
    )
  ) {
    return "ETF";
  }


  // Earnings

  if (
    eventTypes.includes(
      "EARNINGS"
    )
  ) {
    return "EARNINGS";
  }


  // Crypto

  if (
    marketTags.includes(
      "crypto"
    )
  ) {
    return "CRYPTO";
  }


  return "MARKET_UPDATE";
}


module.exports = {
  detectPostType
};
