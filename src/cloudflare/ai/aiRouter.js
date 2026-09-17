import { getConfig } from "../config.js";
import { analyzeWithGemini } from "./geminiProvider.js";
import { analyzeWithGroq } from "./groqProvider.js";
import { analyzeWithOpenRouter } from "./openrouterProvider.js";
import { analyzeWithCloudflareAi } from "./cloudflareAiProvider.js";
import { createRuleFallback } from "./ruleFallback.js";
import {
  classifyProviderError,
  ERROR_TYPES
} from "./providerError.js";
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
  },
  CLOUDFLARE: {
    name: "CLOUDFLARE",
    analyze: analyzeWithCloudflareAi
  }
};

/** Free-first order: Gemini → Groq → OpenRouter free → Workers AI → rules */
export const DEFAULT_ORDER = [
  "GEMINI",
  "GROQ",
  "OPENROUTER",
  "CLOUDFLARE"
];

function getProviderOrder(env) {
  const config = getConfig(env);
  const configured = config.aiProviderOrder;

  if (!configured) {
    return [...DEFAULT_ORDER];
  }

  const parsed = configured
    .split(",")
    .map((name) => name.trim().toUpperCase())
    .filter((name) => PROVIDERS[name]);

  // Always keep Cloudflare Workers AI as last paid-free net before rules
  if (!parsed.includes("CLOUDFLARE") && PROVIDERS.CLOUDFLARE) {
    parsed.push("CLOUDFLARE");
  }

  return parsed.length ? parsed : [...DEFAULT_ORDER];
}

/**
 * Skip providers that have no credentials / binding — don't burn retries.
 */
export function isProviderConfigured(env, providerName) {
  const config = getConfig(env);

  switch (String(providerName || "").toUpperCase()) {
    case "GEMINI":
      return Boolean(config.googleApiKey);
    case "GROQ":
      return Boolean(config.groqApiKey);
    case "OPENROUTER":
      return Boolean(config.openRouterApiKey);
    case "CLOUDFLARE":
      return Boolean(env?.AI && typeof env.AI.run === "function");
    default:
      return false;
  }
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

      // Missing keys / auth misconfig: skip without long cooldown pollution
      if (
        classified.type === ERROR_TYPES.MISSING_API_KEY ||
        classified.type === ERROR_TYPES.AUTH_ERROR
      ) {
        return {
          provider: provider.name,
          status: "FAILED",
          errorType: classified.type,
          error: error.message
        };
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
 * Always ends on RULE_FALLBACK so the pipeline never hard-stops.
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

    if (!isProviderConfigured(env, providerName)) {
      logInfo("ai_router_skipped_unconfigured", { provider: providerName });
      attempts.push({
        provider: providerName,
        status: "SKIPPED_UNCONFIGURED"
      });
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
