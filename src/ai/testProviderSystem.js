const {
  validateAnalysis
} = require("./validateAnalysis");

const {
  classifyProviderError,
  ERROR_TYPES
} = require("./providerError");

const {
  isProviderAvailable,
  markProviderCooldown,
  markProviderSuccess,
  resetProviderState,
  getProviderState
} = require("./providerManager");

const {
  routeAI
} = require("./aiRouter");

const {
  createRuleFallback
} = require("./ruleFallback");


function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}


function validAnalysis(overrides = {}) {
  return {
    summary: "Pipeline disruption raises oil supply risk.",
    whyItMatters: "Brent and WTI may reprice higher.",
    classification: {
      direction: "BULLISH",
      magnitude: "HIGH",
      eventType: "GEOPOLITICAL",
      timeframe: "IMMEDIATE"
    },
    bullishFactors: ["Supply disruption"],
    bearishFactors: [],
    risks: ["Escalation"],
    whatToWatch: ["BRENT"],
    analysisType: "INTERPRETATION",
    confidence: "HIGH",
    ...overrides
  };
}


async function runTests() {

  let passed = 0;
  let failed = 0;


  function test(name, fn) {
    try {
      fn();
      console.log(`PASS: ${name}`);
      passed += 1;
    } catch (error) {
      console.error(`FAIL: ${name}`);
      console.error(error.message);
      failed += 1;
    }
  }


  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed += 1;
    } catch (error) {
      console.error(`FAIL: ${name}`);
      console.error(error.message);
      failed += 1;
    }
  }


  test("validateAnalysis accepts valid payload", () => {
    const result =
      validateAnalysis(
        validAnalysis()
      );
    assert(result.valid === true, "Expected valid");
  });


  test("validateAnalysis rejects invalid direction", () => {
    const result =
      validateAnalysis(
        validAnalysis({
          classification: {
            direction: "UP",
            magnitude: "HIGH",
            eventType: "GEOPOLITICAL",
            timeframe: "IMMEDIATE"
          }
        })
      );
    assert(result.valid === false, "Expected invalid");
  });


  test("classifyProviderError detects rate limit", () => {
    const result =
      classifyProviderError({
        status: 429,
        message: "Too Many Requests",
        retryAfter: "12"
      });

    assert(
      result.type === ERROR_TYPES.RATE_LIMIT,
      "Expected RATE_LIMIT"
    );
    assert(
      result.cooldown === true,
      "Expected cooldown"
    );
    assert(
      result.retryAfterMs === 12000,
      "Expected retry-after ms"
    );
  });


  test("classifyProviderError detects missing key", () => {
    const result =
      classifyProviderError(
        new Error("Gemini API key not configured")
      );

    assert(
      result.type === ERROR_TYPES.MISSING_API_KEY,
      "Expected MISSING_API_KEY"
    );
  });


  test("provider cooldown activates and expires", () => {
    resetProviderState();

    markProviderCooldown("GEMINI", {
      cooldownMs: 50,
      errorType: "RATE_LIMIT"
    });

    assert(
      isProviderAvailable("GEMINI") === false,
      "Expected cooldown"
    );

    const state =
      getProviderState("GEMINI");

    assert(
      state.status === "COOLDOWN",
      "Expected COOLDOWN status"
    );

    // Force expiry
    markProviderSuccess("GEMINI");

    assert(
      isProviderAvailable("GEMINI") === true,
      "Expected available after success"
    );
  });


  test("rule fallback always returns valid analysis shape", () => {
    const fallback =
      createRuleFallback({
        title: "Test",
        direction: "BULLISH",
        impactLevel: "HIGH",
        eventTypes: ["GEOPOLITICAL"],
        timeframe: "IMMEDIATE",
        affectedAssets: ["BRENT"]
      });

    const result =
      validateAnalysis(fallback);

    assert(
      result.valid === true,
      result.reason || "Fallback invalid"
    );
  });


  await testAsync(
    "routeAI falls back when all providers unavailable",
    async () => {
      resetProviderState();

      const originalGemini =
        process.env.GOOGLE_API_KEY;
      const originalGeminiAlias =
        process.env.GEMINI_API_KEY;
      const originalGroq =
        process.env.GROQ_API_KEY;
      const originalOpenRouter =
        process.env.OPENROUTER_API_KEY;

      delete process.env.GOOGLE_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GROQ_API_KEY;
      delete process.env.OPENROUTER_API_KEY;

      const result =
        await routeAI({
          title: "Test event",
          content: "Test content",
          source: "BBC",
          marketTags: ["oil"],
          affectedAssets: ["BRENT"],
          direction: "NEUTRAL",
          impactLevel: "HIGH",
          eventTypes: ["GEOPOLITICAL"],
          timeframe: "IMMEDIATE"
        });

      assert(
        result.provider === "RULE_FALLBACK",
        `Expected RULE_FALLBACK, got ${result.provider}`
      );
      assert(
        result.status === "FALLBACK",
        "Expected FALLBACK status"
      );
      assert(
        validateAnalysis(result.analysis).valid,
        "Fallback analysis must validate"
      );

      if (originalGemini !== undefined) {
        process.env.GOOGLE_API_KEY =
          originalGemini;
      }
      if (originalGeminiAlias !== undefined) {
        process.env.GEMINI_API_KEY =
          originalGeminiAlias;
      }
      if (originalGroq !== undefined) {
        process.env.GROQ_API_KEY =
          originalGroq;
      }
      if (originalOpenRouter !== undefined) {
        process.env.OPENROUTER_API_KEY =
          originalOpenRouter;
      }

      resetProviderState();
    }
  );


  console.log(
    `\nTests passed: ${passed}`
  );
  console.log(
    `Tests failed: ${failed}`
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}


runTests();
