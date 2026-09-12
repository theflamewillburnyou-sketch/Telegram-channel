/**
 * CURSOR PROMPT — Midnight Society news sources + major-event gate
 *
 * Paste this into Cursor when expanding news coverage.
 * Do NOT rebuild the pipeline (AI router, DB, scheduler, Telegram).
 * Only extend free trusted sources and publication thresholds.
 */

/*
You are working in the existing Midnight Society Node.js project.

GOAL
----
Expand free, trusted news ingestion for these themes only:
- Crypto
- World stock markets
- Bonds / rates / central banks
- Geopolitical news
- Power & energy (oil, gas, electricity, nuclear)
- Precious metals (gold, silver)

PUBLISH RULE (critical)
-----------------------
Telegram must receive ONLY major events.
Publish only when priorityScore >= 8.5
(examples: Fed / FOMC meeting, rate cut / hike, war / major attack,
 major oil supply shock, systemic bank crisis).

Do NOT publish routine crypto headlines, soft market color, or low-impact stories.

CONSTRAINTS
-----------
1. Free-first only: public RSS feeds and free official APIs. No paid news APIs.
2. Prefer primary / institutional sources (Fed, ECB, EIA, BBC, Reuters/AP via public feeds,
   CoinDesk, MarketWatch, Kitco, CNBC where RSS is free).
3. Reuse existing modules:
   - src/news/fetchNews.js (sources list + safeFetchRSS)
   - src/news/sourceQuality.js
   - src/news/impactScore.js / priority.js
   - src/telegram/publishDecision.js
4. Do NOT rewrite AI providers, database schema, scheduler architecture, or reaction/performance engines.
5. Keep per-source try/catch and timeouts (safeFetchRSS).
6. Keep fetchNews() returning an array of articles.
7. One failed source must not stop other sources.
8. Update sourceQuality scores for any new source names.
9. Strengthen impact/priority keywords for: FOMC, Fed meeting, rate cut/hike, war, invasion,
   missile/drone attack, oil embargo/pipeline shutdown, bank failure.
10. shouldPublish must enforce priorityScore >= 8.5 (numeric). Remove looser HIGH+confidence paths
    that allow lesser events through.
11. Do not invent APIs or scrape paywalled sites. Verify RSS URLs work.
12. Do not commit secrets. Document any optional free API keys in .env.example only.

IMPLEMENTATION STEPS
--------------------
A. Expand `sources` in fetchNews.js with category tags:
   geopolitics | markets | bonds | crypto | energy | metals
B. Update SOURCE_QUALITY map for new publisher names.
C. Tune impactScore / priority so Fed/war/rate-cut class events can exceed 8.5.
D. Change publishDecision to:
     return Number(event.priorityScore) >= 8.5;
E. Smoke-test:
     node -e "require('./src/news/fetchNews').fetchNews().then(a=>console.log(a.length))"
     Confirm failed sources are isolated and major-event gate blocks low scores.

OUT OF SCOPE
------------
- Paid Bloomberg/FT terminal APIs
- Rebuilding processNews clustering
- Changing Telegram formatting
- Adding fake performance stats
*/
