const {
  analyzeWithGemini
} = require("./providers/geminiProvider");


async function analyzeNews(article) {
  return analyzeWithGemini(article);
}


module.exports = {
  analyzeNews
};
