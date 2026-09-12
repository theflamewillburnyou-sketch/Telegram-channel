const { GoogleGenAI } = require("@google/genai");

const {
  buildAnalysisPrompt,
  parseJsonResponse
} = require("../analysisPrompt");

const {
  validateAnalysis
} = require("../validateAnalysis");


function getGeminiApiKey() {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    ""
  );
}


function getGeminiModel() {
  return (
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash"
  );
}


async function analyzeWithGemini(article) {

  const apiKey =
    getGeminiApiKey();

  if (!apiKey) {
    const error =
      new Error(
        "Gemini API key not configured"
      );
    error.status = 401;
    throw error;
  }

  const ai = new GoogleGenAI({
    apiKey
  });

  const prompt =
    buildAnalysisPrompt(article);

  let response;

  try {
    response =
      await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt
      });
  } catch (error) {
    if (
      error?.status ||
      error?.code
    ) {
      error.status =
        error.status ||
        error.code;
    }
    throw error;
  }

  const text =
    response?.text?.trim?.() ||
    "";

  let analysis;

  try {
    analysis =
      parseJsonResponse(text);
  } catch (error) {
    const parseError =
      new Error(
        `Invalid response from Gemini: ${error.message}`
      );
    parseError.status = 502;
    throw parseError;
  }

  const validation =
    validateAnalysis(analysis);

  if (!validation.valid) {
    const validationError =
      new Error(
        `Invalid response from Gemini: ${validation.reason}`
      );
    validationError.status = 502;
    throw validationError;
  }

  return analysis;
}


module.exports = {
  analyzeWithGemini,
  getGeminiApiKey,
  getGeminiModel
};
