require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const { analyzeNews } = require("./analyzeNews");

const { checkEvidence } = require("./evidenceCheck");

const { buildFinalAnalysis } = require("./finalAnalysis");

const { addEvidenceConfidence } = require("./evidenceConfidence");

const { shouldUseAI } = require("./aiFilter");

const { routeAI } = require("./aiRouter");

const {
    createRuleFallback
  } = require("./ruleFallback");
  
  console.dir(
    createRuleFallback({
      title:
        "Metaplanet cuts executive reward pool by 41%, extinguishes $220 million in value",
  
      content:
        "The bitcoin treasury firm cut the potential Series 10 share pool to 188.2 million.",
  
      impactExplanation:
        "The event is relevant to the crypto market.",
  
      direction: "BULLISH",
      impactLevel: "LOW",
      eventTypes: ["GEOPOLITICAL"],
      timeframe: "IMMEDIATE"
    }),
    {
      depth: null
    }
  );

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

const testArticle = {
    title:
      "Metaplanet cuts executive reward pool by 41%, extinguishes $220 million in value",
  
    content:
      "The bitcoin treasury firm cut the potential Series 10 share pool to 188.2 million.",
  
    source: "CoinDesk",
  
    marketTags: ["crypto"],
  
    affectedAssets: ["BTC", "ETH"],
  
    eventTypes: ["GEOPOLITICAL"],
  
    impactLevel: "LOW",
  
    direction: "BULLISH"
};

async function main() {
    try {
      console.log("Sending article to AI...\n");
  
      // 1. Calculate evidence confidence
      const evidenceResult =
        addEvidenceConfidence(testArticle);
  
      console.log(
        "========== EVIDENCE CONFIDENCE ==========\n"
      );
  
      console.log(evidenceResult);

      const routerResult =
        await routeAI(evidenceResult);

        console.log(
        "\n========== AI ROUTER ==========\n"
        );

        console.log(routerResult);
  
      const useAI = shouldUseAI(testArticle);

      console.log(
        "\n========== AI FILTER ==========\n"
      );
      
      console.log("Use AI:", useAI);
      
      // 2. Send article to AI
      const analysis =
        await analyzeNews(evidenceResult);
  
      console.log(
        "\n========== AI ANALYSIS ==========\n"
      );
  
      console.log(analysis);
  
      // 3. Check evidence
      const evidenceCheck =
        checkEvidence(
          evidenceResult,
          analysis
        );
  
      console.log(
        "\n========== EVIDENCE CHECK ==========\n"
      );
  
      console.log(evidenceCheck);
  
      // 4. Build final analysis
      const finalAnalysis =
      buildFinalAnalysis(
        evidenceResult,
        analysis,
        evidenceCheck
      );
  
      console.log(
        "\n========== FINAL ANALYSIS ==========\n"
      );
  
      console.log(finalAnalysis);
  
    } catch (error) {
      console.error("AI analysis failed:");
      console.error(error.message);
    }
  }

main();