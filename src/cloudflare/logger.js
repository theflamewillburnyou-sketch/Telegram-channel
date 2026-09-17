/**
 * Production-safe structured logging (no secrets).
 */

const SECRET_KEYS = [
  "token",
  "api_key",
  "apikey",
  "authorization",
  "password",
  "secret"
];

function sanitizeMeta(meta) {
  if (!meta || typeof meta !== "object") {
    return undefined;
  }

  const out = {};

  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();

    if (SECRET_KEYS.some((part) => lower.includes(part))) {
      out[key] = "[redacted]";
      continue;
    }

    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 200)}…[truncated]`;
      continue;
    }

    out[key] = value;
  }

  return out;
}

export function logInfo(event, meta) {
  console.log(
    JSON.stringify({
      level: "INFO",
      event,
      ...sanitizeMeta(meta),
      at: new Date().toISOString()
    })
  );
}

export function logWarn(event, meta) {
  console.warn(
    JSON.stringify({
      level: "WARN",
      event,
      ...sanitizeMeta(meta),
      at: new Date().toISOString()
    })
  );
}

export function logError(event, meta) {
  console.error(
    JSON.stringify({
      level: "ERROR",
      event,
      ...sanitizeMeta(meta),
      at: new Date().toISOString()
    })
  );
}
