const {
  buildAnalysisPrompt,
  parseJsonResponse
} = require("../analysisPrompt");

const {
  validateAnalysis
} = require("../validateAnalysis");


const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";


function getGroqApiKey() {
  return process.env.GROQ_API_KEY || "";
}


function getGroqModel() {
  /*
   * Default is a commonly available GroqCloud chat model.
   * Override with GROQ_MODEL to match your console's free-tier models.
   * Official OpenAI-compatible endpoint:
   * https://api.groq.com/openai/v1
   */
  return (
    process.env.GROQ_MODEL ||
    "llama-3.1-8b-instant"
  );
}


async function analyzeWithGroq(article) {

  const apiKey =
    getGroqApiKey();

  if (!apiKey) {
    const error =
      new Error(
        "Groq API key not configured"
      );
    error.status = 401;
    throw error;
  }

  const prompt =
    buildAnalysisPrompt(article);

  const response =
    await fetch(
      GROQ_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: getGroqModel(),
          temperature: 0.2,
          response_format: {
            type: "json_object"
          },
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
        `Groq HTTP ${response.status}: ${details}`
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
        `Invalid response from Groq: ${error.message}`
      );
    parseError.status = 502;
    throw parseError;
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
        `Invalid response from Groq: ${error.message}`
      );
    parseError.status = 502;
    throw parseError;
  }


  const validation =
    validateAnalysis(analysis);

  if (!validation.valid) {
    const validationError =
      new Error(
        `Invalid response from Groq: ${validation.reason}`
      );
    validationError.status = 502;
    throw validationError;
  }


  return analysis;
}


module.exports = {
  analyzeWithGroq,
  getGroqApiKey,
  getGroqModel
};
