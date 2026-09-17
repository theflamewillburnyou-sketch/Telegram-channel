import * as evidenceMod from "../../ai/evidenceCheck.js";
import * as finalMod from "../../ai/finalAnalysis.js";
import { shouldUseAI } from "../ai/aiFilter.js";
import { routeAI } from "../ai/aiRouter.js";
import { createRuleFallback } from "../ai/ruleFallback.js";
import { updateEventFinalAnalysis } from "../d1/eventRepository.js";
import {
  predictionExists,
  savePrediction
} from "../d1/predictionRepository.js";
import { logInfo } from "../logger.js";

function pickExport(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }

  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }

  throw new Error(`Missing export ${name}`);
}

const checkEvidence = pickExport(evidenceMod, "checkEvidence");
const buildFinalAnalysis = pickExport(finalMod, "buildFinalAnalysis");

async function savePredictionIfNeeded(env, eventId, finalAnalysis) {
  if (await predictionExists(env, eventId)) {
    return { saved: false, reason: "ALREADY_EXISTS" };
  }

  await savePrediction(env, eventId, finalAnalysis);
  return { saved: true, reason: "CREATED" };
}

/**
 * Cloudflare analyzeEvent — same business flow as local, D1 + env AI router.
 */
export async function analyzeEvent(env, event, options = {}) {
  let aiAnalysis;
  let provider;

  if (!shouldUseAI(event)) {
    aiAnalysis = createRuleFallback(event);
    provider = "RULE_FALLBACK";
  } else if (options.skipAi) {
    aiAnalysis = createRuleFallback(event);
    provider = "RULE_FALLBACK";
  } else {
    const aiResult = await routeAI(env, event);
    aiAnalysis = aiResult.analysis;
    provider = aiResult.provider;
  }

  const evidenceCheck = checkEvidence(event, aiAnalysis, provider);
  const finalAnalysis = buildFinalAnalysis(event, aiAnalysis, evidenceCheck);

  await updateEventFinalAnalysis(env, event.eventId, finalAnalysis);

  const predictionResult = await savePredictionIfNeeded(
    env,
    event.eventId,
    finalAnalysis
  );

  logInfo("EVENT_ANALYZED", {
    eventId: event.eventId,
    provider,
    prediction: predictionResult.reason
  });

  return {
    success: true,
    provider,
    finalAnalysis,
    predictionResult
  };
}
