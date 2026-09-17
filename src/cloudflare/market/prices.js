import { getConfig } from "../config.js";
import { logInfo, logWarn, logError } from "../logger.js";

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

/**
 * Primary market price for a symbol (Coinbase or OilPriceAPI).
 */
export async function getMarketPrice(env, symbol) {
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
    return getOilPrice(env, symbol, provider);
  }

  throw new Error(
    `Unsupported market provider for ${symbol}`
  );
}

async function getCoinbasePrice(symbol, provider) {
  logInfo("market_price_request", {
    symbol,
    provider: "coinbase"
  });

  const response = await fetch(provider.url);

  if (!response.ok) {
    logWarn("market_price_http_error", {
      symbol,
      provider: "coinbase",
      status: response.status
    });
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

async function getOilPrice(env, symbol, provider) {
  const config = getConfig(env);
  const apiKey = config.oilPriceApiKey;

  if (!apiKey) {
    throw new Error(
      "OILPRICEAPI_KEY is not configured"
    );
  }

  const url =
    `https://api.oilpriceapi.com/v1/prices/latest` +
    `?by_code=${provider.code}`;

  logInfo("market_price_request", {
    symbol,
    provider: "oilpriceapi"
  });

  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    logWarn("market_price_http_error", {
      symbol,
      provider: "oilpriceapi",
      status: response.status
    });
    throw new Error(
      `OilPriceAPI failed: ${response.status}`
    );
  }

  const data = await response.json();

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

/**
 * Prefer OilPriceAPI, then AmericasOilWatch, with optional freshness gate.
 * Logs symbol/provider/status only — never full API payloads.
 */
export async function getMarketPriceFromProviders(
  env,
  symbol,
  minimumTimestamp = null
) {
  const providers = [
    {
      name: "OilPriceAPI",
      fetch: () => getMarketPrice(env, symbol)
    },
    {
      name: "AmericasOilWatch",
      fetch: () => getAmericasOilWatchPrice(symbol)
    }
  ];

  for (const provider of providers) {
    try {
      logInfo("market_price_try", {
        symbol,
        provider: provider.name
      });

      const marketData = await provider.fetch();

      if (minimumTimestamp) {
        const minimumTime =
          new Date(minimumTimestamp).getTime();

        const providerTime = new Date(
          marketData.timestamp
        ).getTime();

        if (!Number.isFinite(providerTime)) {
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

      logInfo("market_price_accepted", {
        symbol,
        provider: provider.name
      });

      return marketData;
    } catch (error) {
      logWarn("market_price_rejected", {
        symbol,
        provider: provider.name,
        message: error.message
      });
    }
  }

  logError("market_price_unavailable", { symbol });

  throw new Error(
    `No fresh market data available for ${symbol}`
  );
}

export async function getAmericasOilWatchPrice(symbol) {
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

  logInfo("market_price_request", {
    symbol,
    provider: "AmericasOilWatch"
  });

  const response = await fetch(url);

  if (!response.ok) {
    logWarn("market_price_http_error", {
      symbol,
      provider: "AmericasOilWatch",
      status: response.status
    });
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
