/**
 * Convenience runner that fetches + processes news using Cloudflare ESM ports.
 */
import { fetchNews } from "./fetchNews.js";
import { processNews } from "./processNews.js";

export async function runProcessNews(env, options = {}) {
  const articles = await fetchNews(env, options);
  return processNews(articles);
}
