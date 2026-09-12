const {
  buildAnalysisPrompt,
  parseJsonResponse
} = require("../analysisPrompt");

const {
  validateAnalysis
} = require("../validateAnalysis");


const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";


function getOpenRouterApiKey() {
  return process.env.OPENROUTER_API_KEY || "";
}


function getOpenRouterModel() {
  /*
   * Official free router selects currently available free models.
   * Docs: https://openrouter.ai/docs/guides/routing/model-variants/free
   * and https://openrouter.ai/openrouter/free
   */
  return (
    process.env.OPENROUTER_MODEL ||
    "openrouter/free"
  );
}


async function analyzeWithOpenRouter(article) {

  const apiKey =
    getOpenRouterApiKey();

  if (!apiKey) {
    const error =
      new Error(
        "OpenRouter API key not configured"
      );
    error.status = 401;
    throw error;
  }

  const prompt =
    buildAnalysisPrompt(article);

  const response =
    await fetch(
      OPENROUTER_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.OPENROUTER_SITE_URL ||
            "https://midnight-society.local",
          "X-Title":
            process.env.OPENROUTER_APP_NAME ||
            "Midnight Society"
        },
        body: JSON.stringify({
          model: getOpenRouterModel(),
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are Midnight Society's market intelligence engine. Return only valid JSON matching the requested schema."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );


  const retryAfter =
    response.headers.get("retry-after");

  const rawText =
    await response.text();


  if (!response.ok) {

    let details = rawText;

    try {
      details =
        JSON.parse(rawText)?.error?.message ||
        rawText;
    } catch (_error) {
      // keep raw text
    }

    const error =
      new Error(
        `OpenRouter HTTP ${response.status}: ${details}`
      );

    error.status =
      response.status;

    if (retryAfter) {
      error.retryAfter =
        retryAfter;
    }

    throw error;
  }


  let payload;

  try {
    payload =
      JSON.parse(rawText);
  } catch (error) {
    const parseError =
      new Error(
        `Invalid response from OpenRouter: ${error.message}`
      );
    parseError.status = 502;
    throw parseError;
  }


  /*
   * Reject if OpenRouter routed to a non-zero-priced model.
   * Free variants/models report prompt/completion pricing as "0".
   */
  const pricing =
    payload?.model ||
    getOpenRouterModel();

  if (
    typeof pricing === "string" &&
    pricing.includes(":free") === false &&
    pricing !== "openrouter/free" &&
    !String(process.env.OPENROUTER_ALLOW_PAID || "")
      .toLowerCase()
      .includes("true")
  ) {
    /*
     * openrouter/free is itself free; specific routed model IDs may omit :free.
     * We only hard-reject if usage reports non-zero cost.
     */
  }


  const usageCost =
    Number(
      payload?.usage?.cost ??
      payload?.usage?.total_cost ??
      0
    );

  if (
    Number.isFinite(usageCost) &&
    usageCost > 0
  ) {
    const paidError =
      new Error(
        "OpenRouter returned a paid model response — rejecting to keep free-first policy"
      );
    paidError.status = 402;
    throw paidError;
  }


  const content =
    payload?.choices?.[0]?.message?.content;


  let analysis;

  try {
    analysis =
      parseJsonResponse(content);
  } catch (error) {
    const parseError =
      new Error(
        `Invalid response from OpenRouter: ${error.message}`
      );
    parseError.status = 502;
    throw parseError;
  }


  const validation =
    validateAnalysis(analysis);

  if (!validation.valid) {
    const validationError =
      new Error(
        `Invalid response from OpenRouter: ${validation.reason}`
      );
    validationError.status = 502;
    throw validationError;
  }


  return analysis;
}


module.exports = {
  analyzeWithOpenRouter,
  getOpenRouterApiKey,
  getOpenRouterModel
};
