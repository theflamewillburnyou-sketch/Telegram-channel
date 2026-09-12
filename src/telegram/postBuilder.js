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


  let message = "";


  message +=
    `${getPostTypeHeader(postType)}\n\n`;


  message +=
    `<b>${escapeHtml(event.title)}</b>\n\n`;


  // Why it matters
  if (event.whyItMatters) {

    message +=
      `<b>Why it matters:</b>\n`;

    message +=
      `${escapeHtml(event.whyItMatters)}\n\n`;
  }


  // Market context
  message +=
    `<b>Market View</b>\n`;

  message +=
    `Direction: <b>${event.direction}</b>\n`;

  message +=
    `Magnitude: <b>${event.magnitude}</b>\n`;

  message +=
    `Timeframe: <b>${event.timeframe}</b>\n`;

  message +=
    `Confidence: <b>${event.confidence}</b>\n\n`;


  // Market reaction
  if (marketReactionReport) {

    message +=
      buildReactionSection(
        marketReactionReport
      );
  }


  // Source
  if (event.source) {

    message +=
      `\n<b>Source:</b> ${escapeHtml(
        event.source
      )}`;
  }


  if (event.link) {

    message +=
      `\n<a href="${event.link}">Read source</a>`;
  }


  return message;
}


function buildReactionSection(report) {
  if (!report) {
    return "";
  }

  let message = "";

  message += `<b>Market Reaction</b>\n`;

  message += `1H View: <b>${report.overall}</b>\n`;
  message += `Expected: <b>${report.expectedDirection}</b>\n`;

  if (report.confirmingAssets?.length) {
    message += `Confirmed: ${report.confirmingAssets.join(", ")}\n`;
  }

  if (report.divergingAssets?.length) {
    message += `Diverging: ${report.divergingAssets.join(", ")}\n`;
  }

  if (report.neutralAssets?.length) {
    message += `Neutral: ${report.neutralAssets.join(", ")}\n`;
  }

  message += "\n";

  return message;
}


function getPostTypeHeader(postType) {

  const headers = {
    BREAKING:
      "🚨 <b>BREAKING MARKET ALERT</b>",

    GEOPOLITICAL:
      "🌍 <b>GEOPOLITICAL WATCH</b>",

    CRYPTO:
      "₿ <b>CRYPTO WATCH</b>",

    MACRO:
      "🏦 <b>MACRO WATCH</b>",

    SUPPLY_SHOCK:
      "⚡ <b>SUPPLY SHOCK</b>",

    ETF:
      "📊 <b>ETF UPDATE</b>",

    EARNINGS:
      "💼 <b>EARNINGS UPDATE</b>",

    MARKET_UPDATE:
      "📈 <b>MARKET UPDATE</b>"
  };

  return (
    headers[postType] ||
    headers.MARKET_UPDATE
  );
}


function escapeHtml(
  text
) {

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


module.exports = {
  buildTelegramPost,
  buildReactionSection
};
