import { getConfig } from "../config.js";
import { analyzeWithGemini } from "./geminiProvider.js";
import { analyzeWithGroq } from "./groqProvider.js";
import { analyzeWithOpenRouter } from "./openrouterProvider.js";
import { createRuleFallback } from "./ruleFallback.js";
import { classifyProviderError } from "./providerError.js";
import {
  isProviderAvailable,
  markProviderSuccess,
  markProviderCooldown,
  DEFAULT_COOLDOWN_MS
} from "../d1/providerStateRepository.js";
import { logInfo, logError, logWarn } from "../logger.js";

const PROVIDERS = {
  GEMINI: {
    name: "GEMINI",
    analyze: analyzeWithGemini
  },
  GROQ: {
    name: "GROQ",
    analyze: analyzeWithGroq
  },
  OPENROUTER: {
    name: "OPENROUTER",
    analyze: analyzeWithOpenRouter
  }
};

export const DEFAULT_ORDER = [
  "GEMINI",
  "GROQ",
  "OPENROUTER"
];

function getProviderOrder(env) {
  const config = getConfig(env);
  const configured = config.aiProviderOrder;

  if (!configured) {
    return [...DEFAULT_ORDER];
  }

  return configured
    .split(",")
    .map((name) => name.trim().toUpperCase())
    .filter((name) => PROVIDERS[name]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryProvider(env, provider, article, maxRetries) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      logInfo("ai_router_attempt", { provider: provider.name });

      const analysis = await provider.analyze(env, article);

      await markProviderSuccess(env, provider.name);

      logInfo("ai_router_success", { provider: provider.name });

      return {
        provider: provider.name,
        status: "SUCCESS",
        analysis
      };
    } catch (error) {
      const classified = classifyProviderError(error);

      logError("ai_router_provider_error", {
        provider: provider.name,
        errorType: classified.type,
        message: error.message
      });

      if (classified.retryable && attempt < maxRetries) {
        attempt += 1;

        logWarn("ai_router_retry", {
          provider: provider.name,
          attempt,
          maxRetries
        });

        await sleep(500 * attempt);
        continue;
      }

      if (classified.cooldown) {
        const cooldownMs =
          classified.retryAfterMs ||
          DEFAULT_COOLDOWN_MS;

        await markProviderCooldown(env, provider.name, {
          cooldownMs,
          errorType: classified.type
        });

        logWarn("ai_router_cooldown", {
          provider: provider.name,
          cooldownSeconds: Math.round(cooldownMs / 1000)
        });
      }

      return {
        provider: provider.name,
        status: "FAILED",
        errorType: classified.type,
        error: error.message
      };
    }
  }

  return {
    provider: provider.name,
    status: "FAILED",
    errorType: "UNKNOWN",
    error: "Unexpected provider failure"
  };
}

/**
 * Failover AI routing with async D1 provider cooldown state.
 */
export async function routeAI(env, article) {
  const config = getConfig(env);
  const order = getProviderOrder(env);
  const maxRetries = config.aiProviderMaxRetries;
  const attempts = [];

  for (const providerName of order) {
    const provider = PROVIDERS[providerName];

    if (!provider) {
      continue;
    }

    const available = await isProviderAvailable(env, providerName);

    if (!available) {
      logInfo("ai_router_skipped_cooldown", { provider: providerName });

      attempts.push({
        provider: providerName,
        status: "COOLDOWN"
      });

      continue;
    }

    const result = await tryProvider(
      env,
      provider,
      article,
      maxRetries
    );

    attempts.push(result);

    if (result.status === "SUCCESS") {
      return {
        provider: result.provider,
        status: "SUCCESS",
        analysis: result.analysis,
        attempts
      };
    }
  }

  logWarn("ai_router_rule_fallback", {});

  const fallback = createRuleFallback(article);

  return {
    provider: "RULE_FALLBACK",
    status: "FALLBACK",
    analysis: fallback,
    attempts
  };
}

export { PROVIDERS, getProviderOrder };
