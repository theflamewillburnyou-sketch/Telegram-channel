import { getConfig } from "../config.js";
import {
  buildAnalysisPrompt,
  parseJsonResponse
} from "./analysisPrompt.js";
import { validateAnalysis } from "./validateAnalysis.js";

function extractGeminiText(payload) {
  const parts =
    payload?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) =>
      typeof part?.text === "string" ? part.text : ""
    )
    .join("")
    .trim();
}

/**
 * Gemini via Generative Language REST API (no @google/genai SDK).
 * Never logs the API key.
 */
export async function analyzeWithGemini(env, article) {
  const config = getConfig(env);
  const apiKey = config.googleApiKey;
  const model = config.geminiModel;

  if (!apiKey) {
    const error = new Error("Gemini API key not configured");
    error.status = 401;
    throw error;
  }

  const prompt = buildAnalysisPrompt(article);
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });
  } catch (error) {
    const networkError = new Error(
      `Gemini network error: ${error.message}`
    );
    networkError.status = 503;
    throw networkError;
  }

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
      `Gemini HTTP ${response.status}: ${details}`
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
      `Invalid response from Gemini: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }

  const text = extractGeminiText(payload);

  let analysis;

  try {
    analysis = parseJsonResponse(text);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from Gemini: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }

  const validation = validateAnalysis(analysis);

  if (!validation.valid) {
    const validationError = new Error(
      `Invalid response from Gemini: ${validation.reason}`
    );
    validationError.status = 502;
    throw validationError;
  }

  return analysis;
}
