function createPriceSnapshot(marketData) {
  return {
    symbol: marketData.symbol,
    price: marketData.price,
    currency: marketData.currency,
    timestamp:
      marketData.timestamp ||
      new Date().toISOString()
  };
}


module.exports = {
  createPriceSnapshot
};
