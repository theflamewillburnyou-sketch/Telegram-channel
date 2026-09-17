import { getConfig } from "../config.js";
import {
  buildAnalysisPrompt,
  parseJsonResponse
} from "./analysisPrompt.js";
import { validateAnalysis } from "./validateAnalysis.js";

const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

/** Free-only cascade — OpenRouter tries these in order when primary is busy. */
export const OPENROUTER_FREE_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-12b-it:free",
  "qwen/qwen3-8b:free",
  "mistralai/mistral-small-3.1-24b-instruct:free"
];

/**
 * OpenRouter chat completions — free models only.
 * Does NOT honor OPENROUTER_ALLOW_PAID; paid responses are always rejected.
 * Never logs the API key.
 */
export async function analyzeWithOpenRouter(env, article) {
  const config = getConfig(env);
  const apiKey = config.openRouterApiKey;
  const primary = config.openRouterModel || "openrouter/free";

  if (!apiKey) {
    const error = new Error(
      "OpenRouter API key not configured"
    );
    error.status = 401;
    throw error;
  }

  // Prefer configured free model, then known :free / free-router fallbacks
  const freeCascade = [
    primary,
    ...OPENROUTER_FREE_MODELS.filter((id) => id !== primary)
  ].filter((id) => {
    const lower = String(id).toLowerCase();
    return (
      lower === "openrouter/free" ||
      lower.endsWith(":free") ||
      lower.includes("/free")
    );
  });

  const prompt = buildAnalysisPrompt(article);

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": config.openRouterSiteUrl,
      "X-Title": config.openRouterAppName
    },
    body: JSON.stringify({
      model: freeCascade[0],
      models: freeCascade,
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
  });

  const retryAfter = response.headers.get("retry-after");
  const rawText = await response.text();

  if (!response.ok) {
    let details = rawText;

    try {
      details =
        JSON.parse(rawText)?.error?.message ||
        rawText;
    } catch (_error) {
      // keep raw text
    }

    const error = new Error(
      `OpenRouter HTTP ${response.status}: ${details}`
    );
    error.status = response.status;

    if (retryAfter) {
      error.retryAfter = retryAfter;
    }

    throw error;
  }

  let payload;

  try {
    payload = JSON.parse(rawText);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from OpenRouter: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }

  /*
   * Free-first policy: never honor OPENROUTER_ALLOW_PAID.
   * Model comes only from getConfig (default openrouter/free).
   * Reject any response that reports a non-zero usage cost.
   */
  const usageCost = Number(
    payload?.usage?.cost ??
    payload?.usage?.total_cost ??
    0
  );

  if (Number.isFinite(usageCost) && usageCost > 0) {
    const paidError = new Error(
      "OpenRouter returned a paid model response — rejecting to keep free-first policy"
    );
    paidError.status = 402;
    throw paidError;
  }

  const content = payload?.choices?.[0]?.message?.content;

  let analysis;

  try {
    analysis = parseJsonResponse(content);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from OpenRouter: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }

  const validation = validateAnalysis(analysis);

  if (!validation.valid) {
    const validationError = new Error(
      `Invalid response from OpenRouter: ${validation.reason}`
    );
    validationError.status = 502;
    throw validationError;
  }

  return analysis;
}
