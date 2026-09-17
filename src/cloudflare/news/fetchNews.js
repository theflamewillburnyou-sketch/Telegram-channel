import { getConfig } from "../config.js";
import { NEWS_SOURCES } from "./rssSources.js";
import { safeFetchRss } from "./safeFetchRss.js";
import { cleanArticle } from "./cleanNews.js";
import { logInfo, logError } from "../logger.js";

/**
 * Fetch and clean RSS articles for the Worker.
 * Isolates per-source failures; respects maxRssSourcesPerRun.
 */
export async function fetchNews(env, options = {}) {
  const config = getConfig(env);
  const maxSources =
    options.maxSources ??
    config.maxRssSourcesPerRun;
  const itemsPerSource = options.itemsPerSource ?? 5;

  const sources = NEWS_SOURCES.slice(
    0,
    Math.max(0, Number(maxSources) || 0)
  );

  const allArticles = [];
  let successfulSources = 0;
  let failedSources = 0;

  for (const source of sources) {
    try {
      logInfo("rss_fetch_start", { source: source.name });

      const feed = await safeFetchRss(source.url, {
        sourceName: source.name
      });

      const items = (feed.items || []).slice(0, itemsPerSource);

      for (const article of items) {
        allArticles.push(cleanArticle(article, source));
      }

      successfulSources += 1;

      logInfo("rss_fetch_success", {
        source: source.name,
        count: items.length
      });
    } catch (error) {
      failedSources += 1;

      logError("rss_fetch_failed", {
        source: source.name,
        message: error.message
      });

      continue;
    }
  }

  logInfo("rss_fetch_complete", {
    successfulSources,
    failedSources,
    totalArticles: allArticles.length
  });

  return allArticles;
}
