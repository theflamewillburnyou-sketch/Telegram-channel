const {
  analyzeWithGemini
} = require("./providers/geminiProvider");

const {
  analyzeWithGroq
} = require("./providers/groqProvider");

const {
  analyzeWithOpenRouter
} = require("./providers/openrouterProvider");

const {
  createRuleFallback
} = require("./ruleFallback");

const {
  classifyProviderError
} = require("./providerError");

const {
  isProviderAvailable,
  markProviderSuccess,
  markProviderCooldown,
  DEFAULT_COOLDOWN_MS
} = require("./providerManager");


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


const DEFAULT_ORDER = [
  "GEMINI",
  "GROQ",
  "OPENROUTER"
];


const MAX_RETRIES =
  Number(
    process.env.AI_PROVIDER_MAX_RETRIES ||
    1
  );


function getProviderOrder() {

  const configured =
    process.env.AI_PROVIDER_ORDER;

  if (!configured) {
    return [...DEFAULT_ORDER];
  }

  return configured
    .split(",")
    .map(name => name.trim().toUpperCase())
    .filter(name => PROVIDERS[name]);
}


function sleep(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}


async function tryProvider(
  provider,
  article
) {

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {

    try {

      console.log(
        `AI Router → ${provider.name}`
      );

      const analysis =
        await provider.analyze(
          article
        );

      markProviderSuccess(
        provider.name
      );

      console.log(
        `${provider.name} → SUCCESS`
      );

      return {
        provider: provider.name,
        status: "SUCCESS",
        analysis
      };

    } catch (error) {

      const classified =
        classifyProviderError(error);

      console.error(
        `${provider.name} → ${classified.type}: ${error.message}`
      );

      if (
        classified.retryable &&
        attempt < MAX_RETRIES
      ) {
        attempt += 1;

        console.log(
          `${provider.name} → retry ${attempt}/${MAX_RETRIES}`
        );

        await sleep(500 * attempt);
        continue;
      }

      if (classified.cooldown) {
        const cooldownMs =
          classified.retryAfterMs ||
          DEFAULT_COOLDOWN_MS;

        markProviderCooldown(
          provider.name,
          {
            cooldownMs,
            errorType:
              classified.type
          }
        );

        console.log(
          `${provider.name} → COOLDOWN (${Math.round(cooldownMs / 1000)}s)`
        );
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


async function routeAI(article) {

  const order =
    getProviderOrder();

  const attempts = [];


  for (const providerName of order) {

    const provider =
      PROVIDERS[providerName];

    if (!provider) {
      continue;
    }

    if (
      !isProviderAvailable(
        providerName
      )
    ) {
      console.log(
        `${providerName} → SKIPPED (cooldown)`
      );

      attempts.push({
        provider: providerName,
        status: "COOLDOWN"
      });

      continue;
    }

    const result =
      await tryProvider(
        provider,
        article
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


  console.log(
    "AI Router → Rule fallback"
  );


  const fallback =
    createRuleFallback(
      article
    );


  return {
    provider: "RULE_FALLBACK",
    status: "FALLBACK",
    analysis: fallback,
    attempts
  };
}


module.exports = {
  routeAI,
  getProviderOrder,
  PROVIDERS,
  DEFAULT_ORDER
};
