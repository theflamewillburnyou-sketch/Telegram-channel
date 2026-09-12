function calculatePercentageChange(
  oldPrice,
  newPrice
) {
  if (
    typeof oldPrice !== "number" ||
    typeof newPrice !== "number"
  ) {
    throw new Error(
      "Prices must be numbers"
    );
  }

  if (oldPrice === 0) {
    throw new Error(
      "Old price cannot be zero"
    );
  }

  const change =
    ((newPrice - oldPrice) / oldPrice) * 100;

  return Number(change.toFixed(2));
}


function getDirection(change) {
  if (change > 0) {
    return "UP";
  }

  if (change < 0) {
    return "DOWN";
  }

  return "FLAT";
}


function calculatePriceChange(
  oldPrice,
  newPrice
) {
  const percentageChange =
    calculatePercentageChange(
      oldPrice,
      newPrice
    );

  return {
    oldPrice,
    newPrice,
    percentageChange,
    direction: getDirection(
      percentageChange
    )
  };
}


module.exports = {
  calculatePercentageChange,
  getDirection,
  calculatePriceChange
};
