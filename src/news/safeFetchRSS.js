const Parser = require("rss-parser");

const parser =
  new Parser();


const RSS_TIMEOUT =
  10000;


async function safeFetchRSS(
  url
) {

  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      () => controller.abort(),
      RSS_TIMEOUT
    );


  try {

    const response =
      await fetch(
        url,
        {
          signal:
            controller.signal
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const xml =
      await response.text();


    const feed =
      await parser.parseString(
        xml
      );


    return feed;

  } finally {

    clearTimeout(
      timeout
    );

  }
}


module.exports = {
  safeFetchRSS
};
