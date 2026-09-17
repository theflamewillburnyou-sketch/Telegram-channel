import { getConfig } from "../config.js";
import {
  buildAnalysisPrompt,
  parseJsonResponse
} from "./analysisPrompt.js";
import { validateAnalysis } from "./validateAnalysis.js";

/**
 * Cloudflare Workers AI — free Neuron pool, no external API key.
 * Requires [ai] binding = "AI" in wrangler.toml.
 */
export async function analyzeWithCloudflareAi(env, article) {
  if (!env?.AI || typeof env.AI.run !== "function") {
    const error = new Error(
      "Cloudflare Workers AI binding not configured"
    );
    error.status = 401;
    throw error;
  }

  const config = getConfig(env);
  const model =
    config.cloudflareAiModel || "@cf/meta/llama-3.1-8b-instruct";
  const prompt = buildAnalysisPrompt(article);

  let payload;

  try {
    payload = await env.AI.run(model, {
      messages: [
        {
          role: "system",
          content:
            "You are Midnight Society's market intelligence engine. Return only valid JSON matching the requested schema. No markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1024
    });
  } catch (error) {
    const wrapped = new Error(
      `Cloudflare AI error: ${error.message || error}`
    );
    wrapped.status = 503;
    throw wrapped;
  }

  const content =
    typeof payload === "string"
      ? payload
      : payload?.response ||
        payload?.result?.response ||
        payload?.choices?.[0]?.message?.content ||
        "";

  let analysis;

  try {
    analysis = parseJsonResponse(content);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from Cloudflare AI: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }

  const validation = validateAnalysis(analysis);

  if (!validation.valid) {
    const validationError = new Error(
      `Invalid response from Cloudflare AI: ${validation.reason}`
    );
    validationError.status = 502;
    throw validationError;
  }

  return analysis;
}
