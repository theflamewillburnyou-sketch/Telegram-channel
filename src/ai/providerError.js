const ERROR_TYPES = {
  RATE_LIMIT: "RATE_LIMIT",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  AUTH_ERROR: "AUTH_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",
  SERVER_ERROR: "SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  INVALID_RESPONSE: "INVALID_RESPONSE",
  MISSING_API_KEY: "MISSING_API_KEY",
  UNKNOWN: "UNKNOWN"
};


function classifyProviderError(error) {

  const status =
    error?.status ||
    error?.statusCode ||
    error?.httpStatus ||
    null;

  const message =
    String(
      error?.message ||
      error ||
      ""
    ).toLowerCase();


  if (
    message.includes("api key not configured") ||
    (
      message.includes("missing") &&
      message.includes("api key")
    )
  ) {
    return {
      type: ERROR_TYPES.MISSING_API_KEY,
      retryable: false,
      cooldown: true,
      retryAfterMs: null
    };
  }


  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("resource_exhausted") ||
    message.includes("resource exhausted")
  ) {

    const retryAfterMs =
      parseRetryAfterMs(error);

    return {
      type: ERROR_TYPES.RATE_LIMIT,
      retryable: false,
      cooldown: true,
      retryAfterMs
    };
  }


  if (
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("exceeded your current quota")
  ) {
    return {
      type: ERROR_TYPES.QUOTA_EXCEEDED,
      retryable: false,
      cooldown: true,
      retryAfterMs:
        parseRetryAfterMs(error) ||
        60 * 60 * 1000
    };
  }


  if (
    status === 401 ||
    status === 403 ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("invalid api key") ||
    message.includes("authentication")
  ) {
    return {
      type: ERROR_TYPES.AUTH_ERROR,
      retryable: false,
      cooldown: true,
      retryAfterMs: 30 * 60 * 1000
    };
  }


  if (
    status === 400 ||
    message.includes("invalid request") ||
    message.includes("bad request")
  ) {
    return {
      type: ERROR_TYPES.INVALID_REQUEST,
      retryable: false,
      cooldown: false,
      retryAfterMs: null
    };
  }


  if (
    message.includes("invalid response") ||
    message.includes("empty ai response") ||
    message.includes("json") ||
    message.includes("validation") ||
    message.includes("missing summary") ||
    message.includes("invalid direction") ||
    message.includes("invalid magnitude") ||
    message.includes("invalid eventtype") ||
    message.includes("invalid timeframe") ||
    message.includes("invalid confidence")
  ) {
    return {
      type: ERROR_TYPES.INVALID_RESPONSE,
      retryable: false,
      cooldown: false,
      retryAfterMs: null
    };
  }


  if (
    status >= 500 ||
    message.includes("internal server") ||
    message.includes("service unavailable") ||
    message.includes("bad gateway")
  ) {
    return {
      type: ERROR_TYPES.SERVER_ERROR,
      retryable: true,
      cooldown: true,
      retryAfterMs:
        parseRetryAfterMs(error) ||
        60 * 1000
    };
  }


  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("abort") ||
    message.includes("timeout")
  ) {
    return {
      type: ERROR_TYPES.NETWORK_ERROR,
      retryable: true,
      cooldown: true,
      retryAfterMs: 30 * 1000
    };
  }


  return {
    type: ERROR_TYPES.UNKNOWN,
    retryable: false,
    cooldown: true,
    retryAfterMs: 60 * 1000
  };
}


function parseRetryAfterMs(error) {

  const header =
    error?.retryAfter ||
    error?.headers?.["retry-after"] ||
    error?.response?.headers?.["retry-after"];

  if (header === undefined || header === null) {
    return null;
  }

  const asNumber =
    Number(header);

  if (Number.isFinite(asNumber)) {
    return asNumber * 1000;
  }

  const asDate =
    new Date(header).getTime();

  if (Number.isFinite(asDate)) {
    return Math.max(
      0,
      asDate - Date.now()
    );
  }

  return null;
}


module.exports = {
  ERROR_TYPES,
  classifyProviderError,
  parseRetryAfterMs
};
