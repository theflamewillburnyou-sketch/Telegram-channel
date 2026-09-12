require("dotenv").config();

const marketProviders = {
  BTC: {
    type: "coinbase",
    url: "https://api.coinbase.com/v2/prices/BTC-USD/spot"
  },

  ETH: {
    type: "coinbase",
    url: "https://api.coinbase.com/v2/prices/ETH-USD/spot"
  },

  BRENT: {
    type: "oilpriceapi",
    code: "BRENT_CRUDE_USD"
  },

  WTI: {
    type: "oilpriceapi",
    code: "WTI_USD"
  }
};

async function getMarketPrice(symbol) {
  const provider = marketProviders[symbol];

  if (!provider) {
    throw new Error(
      `No market provider configured for ${symbol}`
    );
  }

  if (provider.type === "coinbase") {
    return getCoinbasePrice(symbol, provider);
  }

  if (provider.type === "oilpriceapi") {
    return getOilPrice(symbol, provider);
  }

  throw new Error(
    `Unsupported market provider for ${symbol}`
  );
}


async function getCoinbasePrice(symbol, provider) {
  const response = await fetch(provider.url);

  if (!response.ok) {
    throw new Error(
      `Coinbase API failed: ${response.status}`
    );
  }

  const data = await response.json();

  return {
    symbol,
    price: Number(data.data.amount),
    currency: data.data.currency,
    timestamp: new Date().toISOString()
  };
}


async function getOilPrice(symbol, provider) {
  const apiKey = process.env.OILPRICEAPI_KEY;

  if (!apiKey) {
    throw new Error(
      "OILPRICEAPI_KEY is not configured"
    );
  }

  const url =
    `https://api.oilpriceapi.com/v1/prices/latest` +
    `?by_code=${provider.code}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(
      `OilPriceAPI failed: ${response.status}`
    );
  }

  const data = await response.json();

  console.log(
    "\n========== RAW OILPRICEAPI RESPONSE ==========\n"
  );

  console.log(
    JSON.stringify(data, null, 2)
  );

  if (
    !data.data ||
    typeof data.data.price !== "number"
  ) {
    throw new Error(
      `Invalid OilPriceAPI response for ${symbol}`
    );
  }

  return {
    symbol,
    price: data.data.price,
    currency: data.data.currency || "USD",
    timestamp:
      data.data.created_at ||
      data.data.timestamp ||
      new Date().toISOString()
  };
}


async function getMarketPriceFromProviders(
  symbol,
  minimumTimestamp = null
) {
  const providers = [
    {
      name: "OilPriceAPI",
      fetch: () =>
        getMarketPrice(symbol)
    },
    {
      name: "AmericasOilWatch",
      fetch: () =>
        getAmericasOilWatchPrice(symbol)
    }
  ];

  for (const provider of providers) {
    try {
      console.log(
        `${symbol}: trying ${provider.name}...`
      );

      const marketData =
        await provider.fetch();

      if (minimumTimestamp) {
        const minimumTime =
          new Date(minimumTimestamp).getTime();

        const providerTime =
          new Date(
            marketData.timestamp
          ).getTime();

        if (
          !Number.isFinite(providerTime)
        ) {
          throw new Error(
            "Invalid provider timestamp"
          );
        }

        if (providerTime <= minimumTime) {
          throw new Error(
            "Provider returned stale market data"
          );
        }
      }

      console.log(
        `${symbol}: ${provider.name} accepted`
      );

      return marketData;

    } catch (error) {
      console.log(
        `${symbol}: ${provider.name} rejected — ${error.message}`
      );
    }
  }

  throw new Error(
    `No fresh market data available for ${symbol}`
  );
}


async function getAmericasOilWatchPrice(symbol) {
  const endpoints = {
    BRENT: "https://americasoilwatch.com/api/v1/brent",
    WTI: "https://americasoilwatch.com/api/v1/wti"
  };

  const url = endpoints[symbol];

  if (!url) {
    throw new Error(
      `AmericasOilWatch does not support ${symbol}`
    );
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `AmericasOilWatch failed: ${response.status}`
    );
  }

  const data = await response.json();

  const price =
    typeof data.price === "number"
      ? data.price
      : data.priceUsd;

  const timestamp =
    data.timestamp ||
    data.lastUpdated ||
    data.fetchedAt ||
    data.observedAt;

  if (
    typeof price !== "number" ||
    !timestamp
  ) {
    throw new Error(
      `Invalid AmericasOilWatch response for ${symbol}`
    );
  }

  return {
    symbol,
    price,
    currency: data.currency || "USD",
    timestamp
  };
}


module.exports = {
  getMarketPrice,
  getMarketPriceFromProviders,
  getAmericasOilWatchPrice
};
