import * as eventMod from "../../market/event.js";
import { getMarketPriceFromProviders } from "./prices.js";
import { getConfig } from "../config.js";
import { logInfo, logWarn } from "../logger.js";

function pickExport(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }

  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }

  throw new Error(`Missing export ${name}`);
}

const createMarketEvent = pickExport(eventMod, "createMarketEvent");
const addSnapshot = pickExport(eventMod, "addSnapshot");

export async function buildMarketEvent(env, article) {
  const config = getConfig(env);
  let event = createMarketEvent(article);
  const symbols = (event.affectedAssets || []).slice(
    0,
    config.maxSymbolsPerEvent
  );

  for (const symbol of symbols) {
    try {
      const marketData = await getMarketPriceFromProviders(env, symbol);
      event = addSnapshot(event, marketData);
    } catch (error) {
      logWarn("MARKET_SNAPSHOT_SKIP", {
        symbol,
        reason: String(error.message || error)
      });
    }
  }

  logInfo("MARKET_SNAPSHOTS_COLLECTED", {
    eventId: event.eventId,
    count: event.snapshots?.length || 0
  });

  return event;
}
