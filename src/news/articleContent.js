const https = require("https");
const http = require("http");

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https")
      ? https
      : http;

    const request = client.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 MidnightSociety/1.0"
        }
      },
      response => {
        let data = "";

        response.on("data", chunk => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      }
    );

    request.on("error", reject);

    request.setTimeout(10000, () => {
      request.destroy();

      reject(
        new Error("Request timed out")
      );
    });
  });
}

function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchArticleContent(article) {
  try {
    const html = await fetchPage(article.link);

    const text = extractText(html);

    return {
      ...article,
      articleText: text.slice(0, 15000)
    };
  } catch (error) {
    console.error(
      `Failed to fetch article: ${article.title}`
    );

    return {
      ...article,
      articleText: ""
    };
  }
}

async function addArticleContent(articles) {
  const results = [];

  for (const article of articles) {
    const result =
      await fetchArticleContent(article);

    results.push(result);
  }

  return results;
}

module.exports = {
  fetchArticleContent,
  addArticleContent
};