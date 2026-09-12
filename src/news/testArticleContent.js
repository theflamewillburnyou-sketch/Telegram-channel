require("dotenv").config();

const {
  fetchArticleContent
} = require("./articleContent");

const article = {
  title:
    "Zodia Custody CEO Julian Sawyer steps down, becomes adviser",

  source: "CoinDesk",

  link:
    "https://www.coindesk.com/business/2026/09/11/zodia-custody-ceo-julian-sawyer-steps-down-becomes-adviser"
};

async function main() {
  try {
    console.log("Fetching article...\n");

    const result =
      await fetchArticleContent(article);

    console.log(
      "========== ARTICLE CONTENT ==========\n"
    );

    console.log(result.articleText);

    console.log(
      `\nCharacters: ${result.articleText.length}`
    );
  } catch (error) {
    console.error(error.message);
  }
}

main();