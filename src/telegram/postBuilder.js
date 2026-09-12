const {
  detectPostType
} = require("./postType");


function buildTelegramPost(
  event,
  marketReactionReport
) {

  const postType =
    event.postType ||
    detectPostType(event);


  const direction =
    event.direction || "NEUTRAL";

  const magnitude =
    event.magnitude || "LOW";

  const timeframe =
    event.timeframe || "MEDIUM_TERM";

  const confidence =
    event.confidence || "LOW";


  let message = "";


  /*
   * 1. Hook — stop the scroll
   */
  message +=
    `${getPostTypeHeader(postType)}\n\n`;


  /*
   * 2. Headline — the story
   */
  message +=
    `<b>${escapeHtml(event.title)}</b>\n\n`;


  /*
   * 3. Why care — relevance before jargon
   */
  const whyItMatters =
    event.whyItMatters ||
    buildFallbackWhyItMatters(event);

  if (whyItMatters) {
    message +=
      `💡 <b>Why this matters</b>\n`;

    message +=
      `${escapeHtml(whyItMatters)}\n\n`;
  }


  /*
   * 4. Instant take — plain language bias
   */
  message +=
    `🎯 <b>Midnight Society take</b>\n`;

  message +=
    `${escapeHtml(
      describeMarketTake(
        direction,
        magnitude,
        timeframe
      )
    )}\n\n`;


  /*
   * 5. Quick scan cards — scannable on mobile
   */
  message +=
    `📌 <b>At a glance</b>\n`;

  message +=
    `• Bias: <b>${escapeHtml(
      humanDirection(direction)
    )}</b>\n`;

  message +=
    `• Strength: <b>${escapeHtml(
      humanMagnitude(magnitude)
    )}</b>\n`;

  message +=
    `• Window: <b>${escapeHtml(
      humanTimeframe(timeframe)
    )}</b>\n`;

  message +=
    `• Confidence: <b>${escapeHtml(
      humanConfidence(confidence)
    )}</b>\n`;


  const assets =
    event.affectedAssets || [];

  if (assets.length) {
    message +=
      `• Watch: <b>${escapeHtml(
        assets.join(", ")
      )}</b>\n`;
  }

  message += "\n";


  /*
   * 6. Optional live reaction
   */
  if (marketReactionReport) {
    message +=
      buildReactionSection(
        marketReactionReport
      );
  }


  message +=
    `— <i>Midnight Society</i>`;


  return message;
}


function describeMarketTake(
  direction,
  magnitude,
  timeframe
) {

  const bias =
    humanDirection(direction);

  const strength =
    humanMagnitude(magnitude);

  const window =
    humanTimeframe(timeframe);


  if (direction === "BULLISH") {
    return (
      `Markets may lean ${bias.toLowerCase()} ` +
      `with ${strength.toLowerCase()} force over the ${window.toLowerCase()}.`
    );
  }

  if (direction === "BEARISH") {
    return (
      `Pressure looks ${bias.toLowerCase()} ` +
      `with ${strength.toLowerCase()} intensity over the ${window.toLowerCase()}.`
    );
  }

  return (
    `Signal is mixed for now — watch for confirmation over the ${window.toLowerCase()}.`
  );
}


function buildFallbackWhyItMatters(event) {

  const assets =
    event.affectedAssets || [];

  const tags =
    event.marketTags || [];


  if (assets.length && tags.length) {
    return (
      `This could move ${assets.join(", ")} ` +
      `across ${tags.join(", ")} markets.`
    );
  }

  if (assets.length) {
    return (
      `Traders will watch ${assets.join(", ")} for the next reaction.`
    );
  }

  if (tags.length) {
    return (
      `This sits in ${tags.join(", ")} — a space where headlines can reprice risk quickly.`
    );
  }

  return (
    "Major market headlines can shift risk appetite before full details are clear."
  );
}


function buildReactionSection(report) {

  if (!report) {
    return "";
  }

  let message = "";

  message +=
    `📊 <b>Market check</b>\n`;

  message +=
    `Result: <b>${escapeHtml(
      report.overall
    )}</b>\n`;

  message +=
    `Expected: <b>${escapeHtml(
      report.expectedDirection
    )}</b>\n`;

  if (report.confirmingAssets?.length) {
    message +=
      `✅ Confirmed: ${escapeHtml(
        report.confirmingAssets.join(", ")
      )}\n`;
  }

  if (report.divergingAssets?.length) {
    message +=
      `⚠️ Diverging: ${escapeHtml(
        report.divergingAssets.join(", ")
      )}\n`;
  }

  if (report.neutralAssets?.length) {
    message +=
      `➖ Quiet: ${escapeHtml(
        report.neutralAssets.join(", ")
      )}\n`;
  }

  message += "\n";

  return message;
}


function getPostTypeHeader(postType) {

  const headers = {
    BREAKING:
      "🚨 <b>BREAKING</b>\nThis one just crossed our desk",

    GEOPOLITICAL:
      "🌍 <b>GEOPOLITICAL RISK</b>\nWhen the world moves markets",

    CRYPTO:
      "₿ <b>CRYPTO PULSE</b>\nA signal worth a closer look",

    MACRO:
      "🏦 <b>MACRO MOVE</b>\nPolicy and the bigger picture",

    SUPPLY_SHOCK:
      "⚡ <b>SUPPLY SHOCK</b>\nWhen the flow gets hit",

    ETF:
      "📊 <b>ETF FLOW</b>\nCapital is shifting",

    EARNINGS:
      "💼 <b>EARNINGS SIGNAL</b>\nResults that can reprice the tape",

    MARKET_UPDATE:
      "📈 <b>MARKET ALERT</b>\nSomething worth your attention"
  };

  return (
    headers[postType] ||
    headers.MARKET_UPDATE
  );
}


function humanDirection(direction) {

  const map = {
    BULLISH: "Bullish",
    BEARISH: "Bearish",
    NEUTRAL: "Neutral / Mixed"
  };

  return map[direction] || direction;
}


function humanMagnitude(magnitude) {

  const map = {
    HIGH: "High",
    MEDIUM: "Moderate",
    LOW: "Limited"
  };

  return map[magnitude] || magnitude;
}


function humanTimeframe(timeframe) {

  const map = {
    IMMEDIATE: "Next hours",
    SHORT_TERM: "Next few days",
    MEDIUM_TERM: "Coming weeks"
  };

  return map[timeframe] || timeframe;
}


function humanConfidence(confidence) {

  const map = {
    HIGH: "Strong",
    MEDIUM: "Moderate",
    LOW: "Early / developing"
  };

  return map[confidence] || confidence;
}


function escapeHtml(text) {

  if (text === undefined || text === null) {
    return "";
  }

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


module.exports = {
  buildTelegramPost,
  buildReactionSection
};
