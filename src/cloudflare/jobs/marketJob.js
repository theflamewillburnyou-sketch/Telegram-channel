import * as outcomeMod from "../../market/outcome.js";
import * as evaMod from "../../market/expectedVsActual.js";
import * as horizonMod from "../../market/outcomeHorizon.js";
import * as reportMod from "../../market/marketReactionReport.js";
import { getConfig } from "../config.js";
import { getEventsWithSnapshots } from "../d1/eventRepository.js";
import {
  getInitialSnapshot,
  getOutcomesByHorizon
} from "../d1/marketRepository.js";
import {
  getExpectedVsActual,
  outcomeExists,
  saveExpectedVsActual,
  saveOutcome
} from "../d1/outcomeRepository.js";
import { getPrediction } from "../d1/predictionRepository.js";
import { isReactionPublished } from "../d1/reactionPublishRepository.js";
import {
  getMarketReaction,
  reactionExists,
  saveMarketReaction
} from "../d1/reactionRepository.js";
import { logError, logInfo, logWarn } from "../logger.js";
import { getMarketPriceFromProviders } from "../market/prices.js";
import { publishAndRecordReaction } from "../telegram/publishWithLedger.js";

function pickExport(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }

  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }

  if (mod && mod[name] !== undefined) {
    return mod[name];
  }

  if (mod?.default && mod.default[name] !== undefined) {
    return mod.default[name];
  }

  throw new Error(`Missing export ${name}`);
}

const createOutcome = pickExport(outcomeMod, "createOutcome");
const createExpectedVsActual = pickExport(evaMod, "createExpectedVsActual");
const OUTCOME_HORIZONS = pickExport(horizonMod, "OUTCOME_HORIZONS");
const createMarketReactionReport = pickExport(
  reportMod,
  "createMarketReactionReport"
);

async function processCloudflareReaction(env, event, horizon) {
  const eventId = event.eventId;

  if (await reactionExists(env, eventId, horizon)) {
    return {
      status: "ALREADY_PROCESSED",
      eventId,
      horizon
    };
  }

  const outcomes = await getOutcomesByHorizon(env, eventId, horizon);

  if (!outcomes.length) {
    return { status: "NO_DATA", eventId, horizon };
  }

  const normalizedOutcomes = [];

  for (const outcome of outcomes) {
    const expectedVsActual = await getExpectedVsActual(
      env,
      eventId,
      outcome.symbol,
      horizon
    );

    normalizedOutcomes.push({
      symbol: outcome.symbol,
      percentageChange: outcome.percentage_change,
      direction: outcome.direction,
      expectedVsActual: {
        expected: expectedVsActual?.expected || "UNKNOWN",
        actual: expectedVsActual?.actual || outcome.direction,
        percentageChange: outcome.percentage_change,
        result: expectedVsActual?.result || "UNKNOWN"
      }
    });
  }

  const prediction = await getPrediction(env, eventId);
  const report = createMarketReactionReport(
    {
      eventId,
      direction: prediction?.direction || "NEUTRAL"
    },
    normalizedOutcomes
  );

  await saveMarketReaction(env, {
    ...report,
    horizon
  });

  return {
    status: "SUCCESS",
    eventId,
    horizon,
    report
  };
}

async function processEventOutcomes(env, event) {
  const prediction = await getPrediction(env, event.eventId);

  if (!prediction) {
    logWarn("OUTCOME_SKIP_NO_PREDICTION", { eventId: event.eventId });
    return;
  }

  const horizons = [
    OUTCOME_HORIZONS.ONE_HOUR,
    OUTCOME_HORIZONS.ONE_DAY,
    OUTCOME_HORIZONS.ONE_WEEK
  ];

  for (const horizon of horizons) {
    for (const symbol of event.affectedAssets || []) {
      try {
        const initialSnapshot = await getInitialSnapshot(
          env,
          event.eventId,
          symbol
        );

        if (!initialSnapshot) {
          continue;
        }

        const initialTime = new Date(initialSnapshot.timestamp).getTime();
        const elapsed = Date.now() - initialTime;

        if (elapsed < horizon.milliseconds) {
          continue;
        }

        if (await outcomeExists(env, event.eventId, symbol, horizon.name)) {
          continue;
        }

        const laterSnapshot = await getMarketPriceFromProviders(
          env,
          symbol,
          initialSnapshot.timestamp
        );

        const outcome = createOutcome(
          event,
          initialSnapshot,
          laterSnapshot,
          horizon.name
        );

        await saveOutcome(env, outcome);

        const expectedVsActual = createExpectedVsActual(
          prediction.direction,
          outcome
        );

        await saveExpectedVsActual(
          env,
          event.eventId,
          expectedVsActual,
          horizon.name
        );

        await processCloudflareReaction(env, event, horizon.name);
      } catch (error) {
        logError("OUTCOME_SYMBOL_FAILED", {
          eventId: event.eventId,
          symbol,
          horizon: horizon.name,
          reason: String(error.message || error)
        });
      }
    }
  }
}

export async function runMarketJob(env, options = {}) {
  const config = getConfig(env);
  const events = await getEventsWithSnapshots(env);
  const limited = events.slice(0, config.maxMarketEventsPerRun);

  logInfo("JOB_START", { job: "market", events: limited.length });

  for (const event of limited) {
    try {
      await processEventOutcomes(env, event);
    } catch (error) {
      logError("MARKET_EVENT_FAILED", {
        eventId: event.eventId,
        reason: String(error.message || error)
      });
    }
  }

  if (!options.disableTelegram) {
    await publishMarketReactions(env, options);
  }

  logInfo("JOB_SUCCESS", { job: "market" });
  return { status: "SUCCESS", events: limited.length };
}

export async function runOutcomeJob(env, options = {}) {
  return runMarketJob(env, { ...options, disableTelegram: true });
}

async function publishMarketReactions(env, options = {}) {
  const events = await getEventsWithSnapshots(env);
  const horizons = ["1H", "1D", "1W"];
  const reactionMessageMod = await import(
    "../../telegram/marketReactionMessage.js"
  );
  const buildMarketReactionMessage = pickExport(
    reactionMessageMod,
    "buildMarketReactionMessage"
  );

  for (const event of events.slice(0, getConfig(env).maxMarketEventsPerRun)) {
    for (const horizon of horizons) {
      try {
        if (await isReactionPublished(env, event.eventId, horizon)) {
          continue;
        }

        const reaction = await getMarketReaction(env, event.eventId, horizon);

        if (!reaction) {
          continue;
        }

        const message = buildMarketReactionMessage(event, reaction);

        if (!message) {
          continue;
        }

        if (options.disableTelegram || options.dryRunPublish) {
          logWarn("REACTION_TELEGRAM_SKIPPED", {
            eventId: event.eventId,
            horizon
          });
          continue;
        }

        await publishAndRecordReaction(env, event.eventId, horizon, message);
      } catch (error) {
        logError("REACTION_PUBLISH_FAILED", {
          eventId: event.eventId,
          horizon,
          reason: String(error.message || error)
        });
      }
    }
  }
}

export async function runReactionJob(env, options = {}) {
  logInfo("JOB_START", { job: "reaction" });
  await publishMarketReactions(env, options);
  logInfo("JOB_SUCCESS", { job: "reaction" });
  return { status: "SUCCESS" };
}
