function escapeHtml(text) {
  if (text === undefined || text === null) {
    return "";
  }

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


function formatPercentage(value) {

  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return `${number.toFixed(2)}%`;
}


function buildMarketReactionMessage(
  event,
  reaction
) {

  let message = "";

  message +=
    `📊 <b>MARKET REACTION — ${escapeHtml(reaction.horizon)}</b>\n\n`;

  message +=
    `<b>${escapeHtml(event.title)}</b>\n\n`;

  message +=
    `<b>Expected:</b> ${escapeHtml(reaction.expectedDirection)}\n`;

  message +=
    `<b>Result:</b> ${escapeHtml(reaction.overall)}\n\n`;


  if (
    reaction.confirmingAssets?.length
  ) {

    message +=
      `<b>Confirmed:</b> ${escapeHtml(
        reaction.confirmingAssets.join(", ")
      )}\n`;

  }


  if (
    reaction.divergingAssets?.length
  ) {

    message +=
      `<b>Diverging:</b> ${escapeHtml(
        reaction.divergingAssets.join(", ")
      )}\n`;

  }


  if (
    reaction.neutralAssets?.length
  ) {

    message +=
      `<b>Neutral:</b> ${escapeHtml(
        reaction.neutralAssets.join(", ")
      )}\n`;

  }


  message += "\n";


  if (
    reaction.reactions?.length
  ) {

    message +=
      `<b>Asset Moves</b>\n`;

    for (
      const asset
      of reaction.reactions
    ) {

      message +=
        `${escapeHtml(asset.symbol)}: `;

      message +=
        `${escapeHtml(
          formatPercentage(
            asset.percentageChange
          )
        )}`;

      message += "\n";
    }
  }


  message +=
    `\n<b>Overall:</b> ${escapeHtml(reaction.overall)}`;


  return message;
}


module.exports = {
  buildMarketReactionMessage
};
