/**
 * Bridge note: processNews orchestration lives in ./processNews.js (ESM).
 * Local CJS transforms under src/news/* are imported via interop there.
 * Prefer importing processNews from this package path rather than
 * re-requiring src/news/processNews.js inside the Worker.
 */
export { processNews } from "./processNews.js";
