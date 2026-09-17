var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
  }
});

// C:/Users/shawn/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "C:/Users/shawn/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/cloudflare/d1/client.js
function getDb(env) {
  if (!env || !env.DB) {
    throw new Error("D1 binding env.DB is missing");
  }
  return env.DB;
}
function prepared(env, sql, params = []) {
  const statement = getDb(env).prepare(sql);
  if (!params.length) {
    return statement;
  }
  return statement.bind(...params);
}
async function dbRun(env, sql, ...params) {
  return prepared(env, sql, params).run();
}
async function dbGet(env, sql, ...params) {
  return prepared(env, sql, params).first();
}
async function dbAll(env, sql, ...params) {
  const result = await prepared(env, sql, params).all();
  return result.results || [];
}
var init_client = __esm({
  "src/cloudflare/d1/client.js"() {
    init_modules_watch_stub();
    __name(getDb, "getDb");
    __name(prepared, "prepared");
    __name(dbRun, "dbRun");
    __name(dbGet, "dbGet");
    __name(dbAll, "dbAll");
  }
});

// src/market/change.js
var require_change = __commonJS({
  "src/market/change.js"(exports, module) {
    init_modules_watch_stub();
    function calculatePercentageChange(oldPrice, newPrice) {
      if (typeof oldPrice !== "number" || typeof newPrice !== "number") {
        throw new Error(
          "Prices must be numbers"
        );
      }
      if (oldPrice === 0) {
        throw new Error(
          "Old price cannot be zero"
        );
      }
      const change = (newPrice - oldPrice) / oldPrice * 100;
      return Number(change.toFixed(2));
    }
    __name(calculatePercentageChange, "calculatePercentageChange");
    function getDirection(change) {
      if (change > 0) {
        return "UP";
      }
      if (change < 0) {
        return "DOWN";
      }
      return "FLAT";
    }
    __name(getDirection, "getDirection");
    function calculatePriceChange(oldPrice, newPrice) {
      const percentageChange = calculatePercentageChange(
        oldPrice,
        newPrice
      );
      return {
        oldPrice,
        newPrice,
        percentageChange,
        direction: getDirection(
          percentageChange
        )
      };
    }
    __name(calculatePriceChange, "calculatePriceChange");
    module.exports = {
      calculatePercentageChange,
      getDirection,
      calculatePriceChange
    };
  }
});

// src/market/outcome.js
var require_outcome = __commonJS({
  "src/market/outcome.js"(exports, module) {
    init_modules_watch_stub();
    var {
      calculatePriceChange
    } = require_change();
    function createOutcome2(event, initialSnapshot, laterSnapshot, horizon) {
      if (!initialSnapshot) {
        throw new Error(
          "Initial market snapshot not found"
        );
      }
      if (!laterSnapshot) {
        throw new Error(
          "Later market snapshot not found"
        );
      }
      const initialTime = new Date(initialSnapshot.timestamp).getTime();
      const laterTime = new Date(laterSnapshot.timestamp).getTime();
      if (laterTime <= initialTime) {
        throw new Error(
          "Later snapshot must have a newer timestamp than initial snapshot"
        );
      }
      const priceChange = calculatePriceChange(
        initialSnapshot.price,
        laterSnapshot.price
      );
      return {
        eventId: event.eventId,
        symbol: initialSnapshot.symbol,
        horizon,
        initialPrice: initialSnapshot.price,
        laterPrice: laterSnapshot.price,
        percentageChange: priceChange.percentageChange,
        direction: priceChange.direction,
        initialTimestamp: initialSnapshot.timestamp,
        laterTimestamp: laterSnapshot.timestamp
      };
    }
    __name(createOutcome2, "createOutcome");
    function addOutcome(event, outcome) {
      return {
        ...event,
        outcomes: [
          ...event.outcomes || [],
          outcome
        ]
      };
    }
    __name(addOutcome, "addOutcome");
    module.exports = {
      createOutcome: createOutcome2,
      addOutcome
    };
  }
});

// src/market/expectedVsActual.js
var require_expectedVsActual = __commonJS({
  "src/market/expectedVsActual.js"(exports, module) {
    init_modules_watch_stub();
    var DEFAULT_THRESHOLD = 0.25;
    function getActualDirection(percentageChange, threshold = DEFAULT_THRESHOLD) {
      if (percentageChange >= threshold) {
        return "UP";
      }
      if (percentageChange <= -threshold) {
        return "DOWN";
      }
      return "FLAT";
    }
    __name(getActualDirection, "getActualDirection");
    function compareExpectedVsActual(expectedDirection, actualDirection) {
      if (expectedDirection === "BULLISH" && actualDirection === "UP") {
        return "CONFIRMED";
      }
      if (expectedDirection === "BEARISH" && actualDirection === "DOWN") {
        return "CONFIRMED";
      }
      if (expectedDirection === "BULLISH" && actualDirection === "DOWN") {
        return "DIVERGENCE";
      }
      if (expectedDirection === "BEARISH" && actualDirection === "UP") {
        return "DIVERGENCE";
      }
      return "NEUTRAL";
    }
    __name(compareExpectedVsActual, "compareExpectedVsActual");
    function createExpectedVsActual2(expectedDirection, outcome, threshold = DEFAULT_THRESHOLD) {
      const actualDirection = getActualDirection(
        outcome.percentageChange,
        threshold
      );
      const result = compareExpectedVsActual(
        expectedDirection,
        actualDirection
      );
      return {
        symbol: outcome.symbol,
        expected: expectedDirection,
        actual: actualDirection,
        percentageChange: outcome.percentageChange,
        threshold,
        result
      };
    }
    __name(createExpectedVsActual2, "createExpectedVsActual");
    module.exports = {
      DEFAULT_THRESHOLD,
      getActualDirection,
      compareExpectedVsActual,
      createExpectedVsActual: createExpectedVsActual2
    };
  }
});

// src/market/outcomeHorizon.js
var require_outcomeHorizon = __commonJS({
  "src/market/outcomeHorizon.js"(exports, module) {
    init_modules_watch_stub();
    var OUTCOME_HORIZONS2 = {
      ONE_HOUR: {
        name: "1H",
        milliseconds: 60 * 60 * 1e3
      },
      ONE_DAY: {
        name: "1D",
        milliseconds: 24 * 60 * 60 * 1e3
      },
      ONE_WEEK: {
        name: "1W",
        milliseconds: 7 * 24 * 60 * 60 * 1e3
      }
    };
    function getTargetTime(eventTimestamp, horizon) {
      const target = new Date(eventTimestamp).getTime() + horizon.milliseconds;
      return new Date(target).toISOString();
    }
    __name(getTargetTime, "getTargetTime");
    module.exports = {
      OUTCOME_HORIZONS: OUTCOME_HORIZONS2,
      getTargetTime
    };
  }
});

// src/market/marketReaction.js
var require_marketReaction = __commonJS({
  "src/market/marketReaction.js"(exports, module) {
    init_modules_watch_stub();
    var {
      createExpectedVsActual: createExpectedVsActual2
    } = require_expectedVsActual();
    function analyzeMarketReaction(event, outcomes) {
      const reactions = outcomes.map(
        (outcome) => {
          const expectedVsActual = outcome.expectedVsActual || createExpectedVsActual2(
            event.direction,
            outcome
          );
          return {
            symbol: outcome.symbol,
            percentageChange: outcome.percentageChange,
            direction: outcome.direction,
            expectedVsActual
          };
        }
      );
      const confirmed = reactions.filter(
        (reaction) => reaction.expectedVsActual.result === "CONFIRMED"
      ).length;
      const divergences = reactions.filter(
        (reaction) => reaction.expectedVsActual.result === "DIVERGENCE"
      ).length;
      const neutral = reactions.filter(
        (reaction) => reaction.expectedVsActual.result === "NEUTRAL"
      ).length;
      let overall = "MIXED";
      if (reactions.length === 0) {
        overall = "NO_DATA";
      } else if (divergences > confirmed && divergences > neutral) {
        overall = "DIVERGENCE";
      } else if (confirmed > divergences && confirmed >= neutral) {
        overall = "CONFIRMED";
      } else if (neutral === reactions.length) {
        overall = "NEUTRAL";
      }
      return {
        eventId: event.eventId,
        expectedDirection: event.direction,
        totalAssets: reactions.length,
        confirmed,
        divergences,
        neutral,
        overall,
        reactions
      };
    }
    __name(analyzeMarketReaction, "analyzeMarketReaction");
    module.exports = {
      analyzeMarketReaction
    };
  }
});

// src/market/crossMarket.js
var require_crossMarket = __commonJS({
  "src/market/crossMarket.js"(exports, module) {
    init_modules_watch_stub();
    function analyzeCrossMarketReaction(reactions) {
      if (!reactions || reactions.length === 0) {
        return {
          status: "NO_DATA",
          totalAssets: 0,
          confirmingAssets: [],
          divergingAssets: [],
          neutralAssets: [],
          overall: "NO_DATA"
        };
      }
      const confirmingAssets = reactions.filter(
        (reaction) => reaction.expectedVsActual?.result === "CONFIRMED"
      ).map(
        (reaction) => reaction.symbol
      );
      const divergingAssets = reactions.filter(
        (reaction) => reaction.expectedVsActual?.result === "DIVERGENCE"
      ).map(
        (reaction) => reaction.symbol
      );
      const neutralAssets = reactions.filter(
        (reaction) => reaction.expectedVsActual?.result === "NEUTRAL"
      ).map(
        (reaction) => reaction.symbol
      );
      let overall = "MIXED";
      if (divergingAssets.length > confirmingAssets.length) {
        overall = "DIVERGENCE";
      } else if (confirmingAssets.length > divergingAssets.length) {
        overall = "CONFIRMED";
      } else if (neutralAssets.length === reactions.length) {
        overall = "NEUTRAL";
      }
      return {
        status: "SUCCESS",
        totalAssets: reactions.length,
        confirmingAssets,
        divergingAssets,
        neutralAssets,
        overall
      };
    }
    __name(analyzeCrossMarketReaction, "analyzeCrossMarketReaction");
    module.exports = {
      analyzeCrossMarketReaction
    };
  }
});

// src/market/marketReactionReport.js
var require_marketReactionReport = __commonJS({
  "src/market/marketReactionReport.js"(exports, module) {
    init_modules_watch_stub();
    var {
      analyzeMarketReaction
    } = require_marketReaction();
    var {
      analyzeCrossMarketReaction
    } = require_crossMarket();
    function createMarketReactionReport2(event, outcomes) {
      const marketReaction = analyzeMarketReaction(
        event,
        outcomes
      );
      const crossMarketReaction = analyzeCrossMarketReaction(
        marketReaction.reactions
      );
      return {
        eventId: event.eventId,
        expectedDirection: event.direction,
        totalAssets: marketReaction.totalAssets,
        overall: crossMarketReaction.overall,
        confirmed: marketReaction.confirmed,
        divergences: marketReaction.divergences,
        neutral: marketReaction.neutral,
        confirmingAssets: crossMarketReaction.confirmingAssets,
        divergingAssets: crossMarketReaction.divergingAssets,
        neutralAssets: crossMarketReaction.neutralAssets,
        reactions: marketReaction.reactions
      };
    }
    __name(createMarketReactionReport2, "createMarketReactionReport");
    module.exports = {
      createMarketReactionReport: createMarketReactionReport2
    };
  }
});

// src/cloudflare/d1/eventRepository.js
var eventRepository_exports = {};
__export(eventRepository_exports, {
  eventExistsByLink: () => eventExistsByLink,
  getAllEvents: () => getAllEvents,
  getEvent: () => getEvent,
  getEventByLink: () => getEventByLink,
  getEventsWithSnapshots: () => getEventsWithSnapshots,
  saveEvent: () => saveEvent,
  updateEventFinalAnalysis: () => updateEventFinalAnalysis
});
function mapEventRow(row) {
  if (!row) {
    return null;
  }
  return {
    eventId: row.event_id,
    title: row.title,
    source: row.source,
    link: row.link,
    publishedAt: row.published_at,
    marketTags: JSON.parse(row.market_tags || "[]"),
    affectedAssets: JSON.parse(row.affected_assets || "[]"),
    direction: row.direction,
    magnitude: row.magnitude,
    eventType: row.event_type,
    timeframe: row.timeframe,
    confidence: row.confidence,
    priorityScore: row.priority_score,
    priorityLevel: row.priority_level,
    createdAt: row.created_at
  };
}
async function saveEvent(env, event) {
  await dbRun(
    env,
    `
      INSERT INTO events (
        event_id,
        title,
        source,
        link,
        published_at,
        market_tags,
        affected_assets,
        direction,
        magnitude,
        event_type,
        timeframe,
        confidence,
        priority_score,
        priority_level,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    event.eventId,
    event.title,
    event.source,
    event.link || "",
    event.publishedAt || null,
    JSON.stringify(event.marketTags || []),
    JSON.stringify(event.affectedAssets || []),
    event.direction || "NEUTRAL",
    event.magnitude || "LOW",
    event.eventType || "OTHER",
    event.timeframe || "MEDIUM_TERM",
    event.confidence || "LOW",
    event.priorityScore || 0,
    event.priorityLevel || "LOW",
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
async function getEvent(env, eventId) {
  const row = await dbGet(
    env,
    `
      SELECT *
      FROM events
      WHERE event_id = ?
    `,
    eventId
  );
  return mapEventRow(row);
}
async function getAllEvents(env) {
  const rows = await dbAll(
    env,
    `
      SELECT *
      FROM events
      ORDER BY created_at DESC
    `
  );
  return rows.map(mapEventRow);
}
async function eventExistsByLink(env, link) {
  if (!link) {
    return false;
  }
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM events
      WHERE link = ?
      LIMIT 1
    `,
    link
  );
  return Boolean(row);
}
async function getEventByLink(env, link) {
  if (!link) {
    return null;
  }
  const row = await dbGet(
    env,
    `
      SELECT *
      FROM events
      WHERE link = ?
      LIMIT 1
    `,
    link
  );
  return mapEventRow(row);
}
async function getEventsWithSnapshots(env) {
  const rows = await dbAll(
    env,
    `
      SELECT DISTINCT
        e.event_id,
        e.title,
        e.direction,
        e.market_tags,
        e.affected_assets
      FROM events e
      INNER JOIN snapshots s
        ON e.event_id = s.event_id
      ORDER BY e.created_at ASC
    `
  );
  return rows.map((row) => ({
    eventId: row.event_id,
    title: row.title,
    direction: row.direction,
    marketTags: JSON.parse(row.market_tags || "[]"),
    affectedAssets: JSON.parse(row.affected_assets || "[]")
  }));
}
async function updateEventFinalAnalysis(env, eventId, finalAnalysis) {
  await dbRun(
    env,
    `
      UPDATE events
      SET
        direction = ?,
        magnitude = ?,
        event_type = ?,
        timeframe = ?,
        confidence = ?
      WHERE event_id = ?
    `,
    finalAnalysis.final?.direction || "NEUTRAL",
    finalAnalysis.final?.magnitude || "LOW",
    finalAnalysis.final?.eventType || "OTHER",
    finalAnalysis.final?.timeframe || "MEDIUM_TERM",
    finalAnalysis.final?.finalConfidence || "LOW",
    eventId
  );
}
var init_eventRepository = __esm({
  "src/cloudflare/d1/eventRepository.js"() {
    init_modules_watch_stub();
    init_client();
    __name(mapEventRow, "mapEventRow");
    __name(saveEvent, "saveEvent");
    __name(getEvent, "getEvent");
    __name(getAllEvents, "getAllEvents");
    __name(eventExistsByLink, "eventExistsByLink");
    __name(getEventByLink, "getEventByLink");
    __name(getEventsWithSnapshots, "getEventsWithSnapshots");
    __name(updateEventFinalAnalysis, "updateEventFinalAnalysis");
  }
});

// src/telegram/marketReactionMessage.js
var require_marketReactionMessage = __commonJS({
  "src/telegram/marketReactionMessage.js"(exports, module) {
    init_modules_watch_stub();
    function escapeHtml2(text) {
      if (text === void 0 || text === null) {
        return "";
      }
      return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    __name(escapeHtml2, "escapeHtml");
    function formatPercentage(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        return "N/A";
      }
      return `${number.toFixed(2)}%`;
    }
    __name(formatPercentage, "formatPercentage");
    function buildMarketReactionMessage(event, reaction) {
      let message = "";
      message += `\u{1F4CA} <b>MARKET REACTION \u2014 ${escapeHtml2(reaction.horizon)}</b>

`;
      message += `<b>${escapeHtml2(event.title)}</b>

`;
      message += `<b>Expected:</b> ${escapeHtml2(reaction.expectedDirection)}
`;
      message += `<b>Result:</b> ${escapeHtml2(reaction.overall)}

`;
      if (reaction.confirmingAssets?.length) {
        message += `<b>Confirmed:</b> ${escapeHtml2(
          reaction.confirmingAssets.join(", ")
        )}
`;
      }
      if (reaction.divergingAssets?.length) {
        message += `<b>Diverging:</b> ${escapeHtml2(
          reaction.divergingAssets.join(", ")
        )}
`;
      }
      if (reaction.neutralAssets?.length) {
        message += `<b>Neutral:</b> ${escapeHtml2(
          reaction.neutralAssets.join(", ")
        )}
`;
      }
      message += "\n";
      if (reaction.reactions?.length) {
        message += `<b>Asset Moves</b>
`;
        for (const asset of reaction.reactions) {
          message += `${escapeHtml2(asset.symbol)}: `;
          message += `${escapeHtml2(
            formatPercentage(
              asset.percentageChange
            )
          )}`;
          message += "\n";
        }
      }
      message += `
<b>Overall:</b> ${escapeHtml2(reaction.overall)}`;
      return message;
    }
    __name(buildMarketReactionMessage, "buildMarketReactionMessage");
    module.exports = {
      buildMarketReactionMessage
    };
  }
});

// src/market/event.js
var require_event = __commonJS({
  "src/market/event.js"(exports, module) {
    init_modules_watch_stub();
    function createEventId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    }
    __name(createEventId, "createEventId");
    function createMarketEvent2(article) {
      return {
        eventId: createEventId(),
        title: article.title,
        source: article.source,
        link: article.link || "",
        publishedAt: article.publishedAt,
        marketTags: article.marketTags || [],
        affectedAssets: article.affectedAssets || [],
        priorityScore: article.priorityScore || 0,
        priorityLevel: article.priorityLevel || "LOW",
        clusterId: article.clusterId || null,
        clusterSize: article.clusterSize || 1,
        noveltyScore: article.noveltyScore || 0,
        noveltyLevel: article.noveltyLevel || "HIGH",
        relatedArticles: article.relatedArticles || [],
        direction: article.finalAnalysis?.final?.direction || article.direction || "NEUTRAL",
        magnitude: article.finalAnalysis?.final?.magnitude || article.impactLevel || "LOW",
        eventType: article.finalAnalysis?.final?.eventType || "OTHER",
        timeframe: article.finalAnalysis?.final?.timeframe || "MEDIUM_TERM",
        confidence: article.finalAnalysis?.final?.finalConfidence || "LOW",
        snapshots: [],
        outcomes: []
      };
    }
    __name(createMarketEvent2, "createMarketEvent");
    function addSnapshot2(event, snapshot) {
      return {
        ...event,
        snapshots: [
          ...event.snapshots,
          snapshot
        ]
      };
    }
    __name(addSnapshot2, "addSnapshot");
    module.exports = {
      createEventId,
      createMarketEvent: createMarketEvent2,
      addSnapshot: addSnapshot2
    };
  }
});

// src/news/rssSources.js
var require_rssSources = __commonJS({
  "src/news/rssSources.js"(exports, module) {
    init_modules_watch_stub();
    var NEWS_SOURCES2 = [
      // Geopolitics (can spill into all markets)
      {
        name: "BBC World",
        url: "https://feeds.bbci.co.uk/news/world/rss.xml",
        category: "geopolitics"
      },
      {
        name: "Al Jazeera",
        url: "https://www.aljazeera.com/xml/rss/all.xml",
        category: "geopolitics"
      },
      // ----- STOCK MARKET (core) -----
      {
        name: "BBC Business",
        url: "https://feeds.bbci.co.uk/news/business/rss.xml",
        category: "markets"
      },
      {
        name: "CNBC Top News",
        url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
        category: "markets"
      },
      {
        name: "MarketWatch",
        url: "https://feeds.marketwatch.com/marketwatch/topstories/",
        category: "markets"
      },
      {
        name: "Yahoo Finance",
        url: "https://finance.yahoo.com/news/rssindex",
        category: "markets"
      },
      // Stock market — macro calendar / filings / corporate actions / Europe / futures
      {
        name: "Google News Macro Calendar",
        url: "https://news.google.com/rss/search?q=CPI+OR+inflation+OR+%22nonfarm+payrolls%22+OR+NFP+OR+GDP+OR+PMI+OR+%22interest+rate%22&hl=en-US&gl=US&ceid=US:en",
        category: "macro"
      },
      {
        name: "Google News Earnings Guidance",
        url: "https://news.google.com/rss/search?q=earnings+OR+guidance+OR+%22quarterly+results%22+OR+%22EPS%22&hl=en-US&gl=US&ceid=US:en",
        category: "markets"
      },
      {
        name: "Google News M&A IPO",
        url: "https://news.google.com/rss/search?q=IPO+OR+%22mergers+and+acquisitions%22+OR+takeover+OR+%22deal+to+buy%22&hl=en-US&gl=US&ceid=US:en",
        category: "markets"
      },
      {
        name: "Google News Corporate Actions",
        url: "https://news.google.com/rss/search?q=%22share+buyback%22+OR+dividend+OR+%22stock+split%22+OR+dilution+OR+%22share+repurchase%22&hl=en-US&gl=US&ceid=US:en",
        category: "markets"
      },
      {
        name: "Google News Europe Stocks",
        url: "https://news.google.com/rss/search?q=FTSE+OR+DAX+OR+STOXX+OR+%22European+stocks%22+OR+%22Euro+Stoxx%22&hl=en-GB&gl=GB&ceid=GB:en",
        category: "markets"
      },
      {
        name: "Google News India Markets",
        url: "https://news.google.com/rss/search?q=Nifty+OR+Sensex+OR+SEBI+OR+%22Indian+stocks%22+OR+RBI&hl=en-IN&gl=IN&ceid=IN:en",
        category: "markets"
      },
      {
        name: "Google News Analyst Ratings",
        url: "https://news.google.com/rss/search?q=%22analyst+upgrade%22+OR+%22analyst+downgrade%22+OR+%22price+target%22+OR+%22cuts+rating%22&hl=en-US&gl=US&ceid=US:en",
        category: "markets"
      },
      {
        name: "SEC Press Releases",
        url: "https://www.sec.gov/news/pressreleases.rss",
        category: "regulation"
      },
      {
        name: "Yahoo ES Futures",
        url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=ES=F&region=US&lang=en-US",
        category: "markets"
      },
      {
        name: "Yahoo NQ Futures",
        url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=NQ=F&region=US&lang=en-US",
        category: "markets"
      },
      // Bonds / central banks
      {
        name: "Federal Reserve",
        url: "https://www.federalreserve.gov/feeds/press_all.xml",
        category: "bonds"
      },
      {
        name: "ECB",
        url: "https://www.ecb.europa.eu/rss/press.html",
        category: "bonds"
      },
      // ----- CRYPTO -----
      {
        name: "CoinDesk",
        url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
        category: "crypto"
      },
      {
        name: "Cointelegraph",
        url: "https://cointelegraph.com/rss",
        category: "crypto"
      },
      {
        name: "The Block",
        url: "https://www.theblock.co/rss.xml",
        category: "crypto"
      },
      {
        name: "Google News Crypto Regulation",
        url: "https://news.google.com/rss/search?q=crypto+regulation+OR+%22SEC+crypto%22+OR+%22Bitcoin+ETF%22+OR+%22Ethereum+ETF%22+OR+stablecoin&hl=en-US&gl=US&ceid=US:en",
        category: "crypto"
      },
      {
        name: "Google News Crypto Exchange",
        url: "https://news.google.com/rss/search?q=Binance+OR+Coinbase+OR+%22crypto+exchange%22+OR+%22crypto+hack%22+OR+%22exchange+hack%22&hl=en-US&gl=US&ceid=US:en",
        category: "crypto"
      },
      {
        name: "Google News Crypto Macro",
        url: "https://news.google.com/rss/search?q=Bitcoin+OR+Ethereum+OR+Solana+OR+%22crypto+market%22&hl=en-US&gl=US&ceid=US:en",
        category: "crypto"
      },
      // ----- COMMODITIES (oil, gas, metals) -----
      {
        name: "EIA Today in Energy",
        url: "https://www.eia.gov/rss/todayinenergy.xml",
        category: "energy"
      },
      {
        name: "OilPrice",
        url: "https://oilprice.com/rss/main",
        category: "energy"
      },
      {
        name: "Google News OPEC Oil",
        url: "https://news.google.com/rss/search?q=OPEC+OR+Brent+OR+WTI+OR+%22crude+oil%22+OR+%22oil+prices%22&hl=en-US&gl=US&ceid=US:en",
        category: "energy"
      },
      {
        name: "Google News Natural Gas LNG",
        url: "https://news.google.com/rss/search?q=%22natural+gas%22+OR+LNG+OR+%22gas+prices%22+OR+Henry+Hub&hl=en-US&gl=US&ceid=US:en",
        category: "energy"
      },
      {
        name: "Google News Metals",
        url: "https://news.google.com/rss/search?q=gold+OR+silver+OR+%22precious+metals%22+OR+copper+OR+%22industrial+metals%22&hl=en-US&gl=US&ceid=US:en",
        category: "metals"
      },
      {
        name: "Yahoo Gold Futures",
        url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC=F&region=US&lang=en-US",
        category: "metals"
      },
      {
        name: "Yahoo Silver Futures",
        url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SI=F&region=US&lang=en-US",
        category: "metals"
      },
      {
        name: "Yahoo Natural Gas Futures",
        url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=NG=F&region=US&lang=en-US",
        category: "energy"
      },
      {
        name: "Yahoo Copper Futures",
        url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=HG=F&region=US&lang=en-US",
        category: "metals"
      },
      {
        name: "Google News Commodities Supply",
        url: "https://news.google.com/rss/search?q=%22supply+disruption%22+OR+refinery+OR+pipeline+OR+%22strategic+petroleum%22+OR+%22oil+inventory%22&hl=en-US&gl=US&ceid=US:en",
        category: "energy"
      }
    ];
    module.exports = {
      NEWS_SOURCES: NEWS_SOURCES2
    };
  }
});

// src/news/deduplicate.js
var require_deduplicate = __commonJS({
  "src/news/deduplicate.js"(exports, module) {
    init_modules_watch_stub();
    function normalizeTitle(title) {
      return title.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((word) => word.length > 3);
    }
    __name(normalizeTitle, "normalizeTitle");
    function calculateSimilarity(title1, title2) {
      const words1 = new Set(normalizeTitle(title1));
      const words2 = new Set(normalizeTitle(title2));
      let commonWords = 0;
      for (const word of words1) {
        if (words2.has(word)) {
          commonWords++;
        }
      }
      const totalUniqueWords = (/* @__PURE__ */ new Set([
        ...words1,
        ...words2
      ])).size;
      if (totalUniqueWords === 0) {
        return 0;
      }
      return commonWords / totalUniqueWords;
    }
    __name(calculateSimilarity, "calculateSimilarity");
    function deduplicateArticles2(articles) {
      const uniqueArticles = [];
      for (const article of articles) {
        let isDuplicate = false;
        for (const existingArticle of uniqueArticles) {
          const similarity = calculateSimilarity(
            article.title,
            existingArticle.title
          );
          if (similarity >= 0.5) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          uniqueArticles.push(article);
        }
      }
      return uniqueArticles;
    }
    __name(deduplicateArticles2, "deduplicateArticles");
    module.exports = {
      deduplicateArticles: deduplicateArticles2
    };
  }
});

// src/news/relevance.js
var require_relevance = __commonJS({
  "src/news/relevance.js"(exports, module) {
    init_modules_watch_stub();
    var relevantKeywords = [
      // Crypto
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "solana",
      "crypto",
      "cryptocurrency",
      "stablecoin",
      "defi",
      "blockchain",
      "binance",
      "coinbase",
      "bitcoin etf",
      "ethereum etf",
      "crypto hack",
      "exchange hack",
      // Oil & energy / commodities
      "oil",
      "crude",
      "brent",
      "wti",
      "opec",
      "natural gas",
      "lng",
      "energy",
      "petroleum",
      "refinery",
      "pipeline",
      "copper",
      "industrial metals",
      // Gold & metals
      "gold",
      "silver",
      "precious metals",
      // US / global stocks
      "s&p",
      "nasdaq",
      "dow",
      "nyse",
      "wall street",
      "earnings",
      "guidance",
      "ipo",
      "merger",
      "acquisition",
      "takeover",
      "buyback",
      "dividend",
      "stock split",
      "price target",
      "analyst upgrade",
      "analyst downgrade",
      "sec",
      // Macro calendar
      "fed",
      "federal reserve",
      "treasury",
      "interest rates",
      "inflation",
      "cpi",
      "jobs",
      "nonfarm",
      "payrolls",
      "nfp",
      "gdp",
      "pmi",
      // Europe stocks
      "ftse",
      "dax",
      "stoxx",
      "european stocks",
      // Indian markets
      "nifty",
      "sensex",
      "bank nifty",
      "rbi",
      "sebi",
      "rupee",
      "fii",
      "dii",
      // Global markets
      "stocks",
      "stock market",
      "shares",
      "equities",
      "bond market",
      "futures",
      // Geopolitics
      "war",
      "conflict",
      "sanctions",
      "tariff",
      "trade war",
      "middle east",
      "iran",
      "israel",
      "russia",
      "ukraine",
      "china",
      "taiwan"
    ];
    function isRelevant(article) {
      const text = (article.title || "").toLowerCase();
      return relevantKeywords.some((keyword) => text.includes(keyword));
    }
    __name(isRelevant, "isRelevant");
    function filterRelevantArticles2(articles) {
      return articles.filter(isRelevant);
    }
    __name(filterRelevantArticles2, "filterRelevantArticles");
    module.exports = {
      isRelevant,
      filterRelevantArticles: filterRelevantArticles2,
      relevantKeywords
    };
  }
});

// src/news/eventCluster.js
var require_eventCluster = __commonJS({
  "src/news/eventCluster.js"(exports, module) {
    init_modules_watch_stub();
    function normalizeWords(title) {
      return title.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((word) => word.length > 3);
    }
    __name(normalizeWords, "normalizeWords");
    function calculateSimilarity(title1, title2) {
      const words1 = new Set(normalizeWords(title1));
      const words2 = new Set(normalizeWords(title2));
      let common = 0;
      for (const word of words1) {
        if (words2.has(word)) {
          common++;
        }
      }
      const total = (/* @__PURE__ */ new Set([
        ...words1,
        ...words2
      ])).size;
      if (total === 0) {
        return 0;
      }
      return common / total;
    }
    __name(calculateSimilarity, "calculateSimilarity");
    function clusterArticles2(articles, threshold = 0.35) {
      const clusters = [];
      for (const article of articles) {
        let matchedCluster = null;
        for (const cluster of clusters) {
          const similarity = calculateSimilarity(
            article.title,
            cluster.articles[0].title
          );
          if (similarity >= threshold) {
            matchedCluster = cluster;
            break;
          }
        }
        if (matchedCluster) {
          matchedCluster.articles.push(
            article
          );
        } else {
          clusters.push({
            clusterId: `cluster_${clusters.length + 1}`,
            articles: [
              article
            ]
          });
        }
      }
      return clusters;
    }
    __name(clusterArticles2, "clusterArticles");
    module.exports = {
      normalizeWords,
      calculateSimilarity,
      clusterArticles: clusterArticles2
    };
  }
});

// src/news/novelty.js
var require_novelty = __commonJS({
  "src/news/novelty.js"(exports, module) {
    init_modules_watch_stub();
    function calculateNovelty(clusterSize) {
      if (clusterSize === 1) {
        return 100;
      }
      if (clusterSize === 2) {
        return 80;
      }
      if (clusterSize <= 4) {
        return 60;
      }
      if (clusterSize <= 7) {
        return 40;
      }
      return 20;
    }
    __name(calculateNovelty, "calculateNovelty");
    function getNoveltyLevel(noveltyScore) {
      if (noveltyScore >= 80) {
        return "HIGH";
      }
      if (noveltyScore >= 50) {
        return "MEDIUM";
      }
      return "LOW";
    }
    __name(getNoveltyLevel, "getNoveltyLevel");
    function addNovelty2(clusters) {
      return clusters.map(
        (cluster) => {
          const noveltyScore = calculateNovelty(
            cluster.articles.length
          );
          return {
            ...cluster,
            noveltyScore,
            noveltyLevel: getNoveltyLevel(
              noveltyScore
            )
          };
        }
      );
    }
    __name(addNovelty2, "addNovelty");
    module.exports = {
      calculateNovelty,
      getNoveltyLevel,
      addNovelty: addNovelty2
    };
  }
});

// src/news/canonicalEvent.js
var require_canonicalEvent = __commonJS({
  "src/news/canonicalEvent.js"(exports, module) {
    init_modules_watch_stub();
    function selectCanonicalArticle(cluster) {
      const articles = cluster.articles || [];
      if (articles.length === 0) {
        return null;
      }
      const sorted = [...articles].sort(
        (a, b) => {
          const contentA = (a.content || "").length;
          const contentB = (b.content || "").length;
          return contentB - contentA;
        }
      );
      return sorted[0];
    }
    __name(selectCanonicalArticle, "selectCanonicalArticle");
    function createCanonicalEvent2(cluster) {
      const article = selectCanonicalArticle(
        cluster
      );
      if (!article) {
        return null;
      }
      return {
        ...article,
        clusterId: cluster.clusterId,
        clusterSize: cluster.articles.length,
        noveltyScore: cluster.noveltyScore,
        noveltyLevel: cluster.noveltyLevel,
        relatedArticles: cluster.articles.map(
          (item) => ({
            title: item.title,
            source: item.source,
            link: item.link,
            publishedAt: item.publishedAt
          })
        )
      };
    }
    __name(createCanonicalEvent2, "createCanonicalEvent");
    module.exports = {
      selectCanonicalArticle,
      createCanonicalEvent: createCanonicalEvent2
    };
  }
});

// src/news/sourceQuality.js
var require_sourceQuality = __commonJS({
  "src/news/sourceQuality.js"(exports, module) {
    init_modules_watch_stub();
    var SOURCE_QUALITY = {
      "Reuters": 5,
      "Bloomberg": 5,
      "BBC World": 5,
      "BBC Business": 5,
      "Federal Reserve": 5,
      "ECB": 5,
      "EIA Today in Energy": 5,
      "Al Jazeera": 4,
      "CNBC": 4,
      "CNBC Top News": 4,
      "Financial Times": 5,
      "Wall Street Journal": 5,
      "MarketWatch": 4,
      "Yahoo Finance": 3,
      "CoinDesk": 4,
      "Cointelegraph": 3,
      "The Block": 4,
      "OilPrice": 3,
      "Google News Metals": 3,
      "Yahoo Gold Futures": 3,
      "Unknown": 1
    };
    function getSourceQuality(source) {
      return SOURCE_QUALITY[source] || 1;
    }
    __name(getSourceQuality, "getSourceQuality");
    function getSourceQualityLevel(score) {
      if (score >= 5) {
        return "HIGH";
      }
      if (score >= 3) {
        return "MEDIUM";
      }
      return "LOW";
    }
    __name(getSourceQualityLevel, "getSourceQualityLevel");
    function addSourceQuality2(articles) {
      return articles.map((article) => {
        const score = getSourceQuality(
          article.source
        );
        return {
          ...article,
          sourceQualityScore: score,
          sourceQualityLevel: getSourceQualityLevel(score)
        };
      });
    }
    __name(addSourceQuality2, "addSourceQuality");
    module.exports = {
      SOURCE_QUALITY,
      getSourceQuality,
      getSourceQualityLevel,
      addSourceQuality: addSourceQuality2
    };
  }
});

// src/news/impactScore.js
var require_impactScore = __commonJS({
  "src/news/impactScore.js"(exports, module) {
    init_modules_watch_stub();
    function calculateImpactScore(article) {
      const title = article.title.toLowerCase();
      let score = 1;
      const geopoliticalKeywords = [
        "war",
        "conflict",
        "attack",
        "missile",
        "drone attack",
        "invasion"
      ];
      if (geopoliticalKeywords.some(
        (keyword) => title.includes(keyword)
      )) {
        score += 3;
      }
      const supplyKeywords = [
        "pipeline",
        "pipeline shutdown",
        "pipeline shut",
        "supply disruption",
        "supply shortage",
        "production cut",
        "refinery",
        "oil facility",
        "oil terminal"
      ];
      if (supplyKeywords.some(
        (keyword) => title.includes(keyword)
      )) {
        score += 3;
      }
      const macroKeywords = [
        "federal reserve",
        "fed",
        "fomc",
        "interest rate",
        "rate decision",
        "rate cut",
        "rate hike",
        "rate cuts",
        "rate hikes",
        "monetary policy",
        "inflation",
        "cpi",
        "recession",
        "bank failure",
        "banking crisis"
      ];
      if (macroKeywords.some(
        (keyword) => title.includes(keyword)
      )) {
        score += 3;
      }
      const criticalKeywords = [
        "fomc",
        "rate cut",
        "rate hike",
        "declares war",
        "invasion of",
        "state of war",
        "nuclear",
        "opec emergency"
      ];
      if (criticalKeywords.some(
        (keyword) => title.includes(keyword)
      )) {
        score += 2;
      }
      const marketKeywords = [
        "bitcoin etf",
        "ethereum etf",
        "nifty",
        "sensex",
        "oil",
        "gold"
      ];
      if (marketKeywords.some(
        (keyword) => title.includes(keyword)
      )) {
        score += 2;
      }
      if (score > 10) {
        score = 10;
      }
      return score;
    }
    __name(calculateImpactScore, "calculateImpactScore");
    function getImpactLevel(score) {
      if (score >= 9) {
        return "CRITICAL";
      }
      if (score >= 7) {
        return "HIGH";
      }
      if (score >= 4) {
        return "MEDIUM";
      }
      return "LOW";
    }
    __name(getImpactLevel, "getImpactLevel");
    function addImpactScore2(articles) {
      return articles.map((article) => {
        const score = calculateImpactScore(article);
        return {
          ...article,
          impactScore: score,
          impactLevel: getImpactLevel(score)
        };
      });
    }
    __name(addImpactScore2, "addImpactScore");
    module.exports = {
      calculateImpactScore,
      getImpactLevel,
      addImpactScore: addImpactScore2
    };
  }
});

// src/news/marketTags.js
var require_marketTags = __commonJS({
  "src/news/marketTags.js"(exports, module) {
    init_modules_watch_stub();
    var marketKeywords = {
      crypto: [
        "bitcoin",
        "btc",
        "ethereum",
        "eth",
        "solana",
        "crypto",
        "cryptocurrency",
        "stablecoin",
        "defi",
        "blockchain",
        "binance",
        "coinbase",
        "bitcoin etf",
        "ethereum etf"
      ],
      oil: [
        "oil",
        "crude",
        "brent",
        "wti",
        "opec",
        "petroleum"
      ],
      energy: [
        "energy",
        "natural gas",
        "lng",
        "henry hub",
        "gas prices"
      ],
      gold: [
        "gold",
        "silver",
        "precious metals"
      ],
      copper: [
        "copper",
        "industrial metals",
        "base metals"
      ],
      usStocks: [
        "s&p",
        "nasdaq",
        "dow",
        "wall street",
        "us stocks",
        "nyse",
        "earnings",
        "ipo",
        "buyback",
        "stock split",
        "price target",
        "analyst upgrade",
        "analyst downgrade"
      ],
      europeStocks: [
        "ftse",
        "dax",
        "stoxx",
        "euro stoxx",
        "european stocks",
        "cac 40"
      ],
      indiaStocks: [
        "nifty",
        "sensex",
        "bank nifty",
        "indian stocks",
        "rbi",
        "sebi"
      ],
      macro: [
        "cpi",
        "inflation",
        "nonfarm",
        "payrolls",
        "nfp",
        "gdp",
        "pmi",
        "interest rate",
        "federal reserve",
        "fed"
      ],
      forex: [
        "dollar",
        "usd",
        "rupee",
        "inr",
        "euro",
        "yen"
      ],
      bonds: [
        "treasury",
        "bond yields",
        "government bonds",
        "10-year yield"
      ],
      geopolitics: [
        "war",
        "conflict",
        "sanctions",
        "tariff",
        "trade war",
        "middle east",
        "iran",
        "israel",
        "russia",
        "ukraine",
        "china",
        "taiwan"
      ]
    };
    function detectMarketTags(article) {
      const title = (article.title || "").toLowerCase();
      const tags = [];
      for (const [market, keywords] of Object.entries(marketKeywords)) {
        const matchedKeyword = keywords.find((keyword) => {
          const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          return pattern.test(title);
        });
        if (matchedKeyword) {
          console.log(`Market match: ${market} \u2190 "${matchedKeyword}"`);
          tags.push(market);
        }
      }
      if (tags.length === 0) {
        if (article.category === "crypto") {
          tags.push("crypto");
        }
        if (article.category === "markets" || article.category === "macro") {
          tags.push("usStocks");
          tags.push("globalMarkets");
        }
        if (article.category === "geopolitics") {
          tags.push("geopolitics");
        }
        if (article.category === "energy") {
          tags.push("oil");
          tags.push("energy");
        }
        if (article.category === "metals") {
          tags.push("gold");
        }
        if (article.category === "bonds" || article.category === "regulation") {
          tags.push("bonds");
          tags.push("usStocks");
        }
      }
      if (tags.some(
        (tag) => ["usStocks", "indiaStocks", "europeStocks", "macro", "bonds"].includes(tag)
      )) {
        tags.push("stockMarket");
      }
      if (tags.includes("crypto")) {
        tags.push("cryptoMarket");
      }
      if (tags.some((tag) => ["oil", "energy", "gold", "copper"].includes(tag))) {
        tags.push("commoditiesMarket");
      }
      return [...new Set(tags)];
    }
    __name(detectMarketTags, "detectMarketTags");
    function addMarketTags2(articles) {
      return articles.map((article) => {
        const marketTags = detectMarketTags(article);
        return {
          ...article,
          marketTags
        };
      });
    }
    __name(addMarketTags2, "addMarketTags");
    module.exports = {
      detectMarketTags,
      addMarketTags: addMarketTags2,
      marketKeywords
    };
  }
});

// src/news/assetMapping.js
var require_assetMapping = __commonJS({
  "src/news/assetMapping.js"(exports, module) {
    init_modules_watch_stub();
    var marketAssets = {
      crypto: ["BTC", "ETH", "SOL"],
      oil: ["BRENT", "WTI"],
      energy: ["NATURAL_GAS", "ENERGY_STOCKS"],
      gold: ["GOLD", "SILVER"],
      copper: ["COPPER"],
      usStocks: ["S&P_500", "NASDAQ", "DOW", "ES_FUTURES"],
      europeStocks: ["FTSE_100", "DAX", "EURO_STOXX_50"],
      indiaStocks: ["NIFTY_50", "BANK_NIFTY", "SENSEX"],
      macro: ["S&P_500", "NASDAQ", "US_10Y"],
      forex: ["USD", "EUR", "JPY", "INR"],
      bonds: ["US_10Y", "US_2Y"],
      geopolitics: ["GLOBAL_MARKETS"],
      stockMarket: ["S&P_500", "NASDAQ", "DOW"],
      cryptoMarket: ["BTC", "ETH"],
      commoditiesMarket: ["BRENT", "WTI", "GOLD", "SILVER", "NATURAL_GAS", "COPPER"]
    };
    function mapAssets(marketTags) {
      const assets = [];
      for (const tag of marketTags || []) {
        const mappedAssets = marketAssets[tag];
        if (mappedAssets) {
          assets.push(...mappedAssets);
        }
      }
      return [...new Set(assets)];
    }
    __name(mapAssets, "mapAssets");
    function addAssetMapping2(articles) {
      return articles.map((article) => {
        const affectedAssets = mapAssets(article.marketTags);
        return {
          ...article,
          affectedAssets
        };
      });
    }
    __name(addAssetMapping2, "addAssetMapping");
    module.exports = {
      mapAssets,
      addAssetMapping: addAssetMapping2,
      marketAssets
    };
  }
});

// src/news/direction.js
var require_direction = __commonJS({
  "src/news/direction.js"(exports, module) {
    init_modules_watch_stub();
    var bullishKeywords = [
      "surge",
      "rises",
      "rise",
      "rally",
      "gain",
      "gains",
      "growth",
      "cuts",
      "cut",
      "approval",
      "approved",
      "inflows",
      "demand increases",
      "production cut"
    ];
    var bearishKeywords = [
      "falls",
      "fall",
      "drop",
      "drops",
      "decline",
      "declines",
      "crash",
      "selloff",
      "outflows",
      "ban",
      "banned",
      "sanctions",
      "war",
      "conflict",
      "rate hike",
      "raises rates",
      "production increase"
    ];
    function detectDirection(article) {
      const title = article.title.toLowerCase();
      let bullishScore = 0;
      let bearishScore = 0;
      for (const keyword of bullishKeywords) {
        if (title.includes(keyword)) {
          bullishScore++;
        }
      }
      for (const keyword of bearishKeywords) {
        if (title.includes(keyword)) {
          bearishScore++;
        }
      }
      if (bullishScore > bearishScore) {
        return "BULLISH";
      }
      if (bearishScore > bullishScore) {
        return "BEARISH";
      }
      return "NEUTRAL";
    }
    __name(detectDirection, "detectDirection");
    function addDirection2(articles) {
      return articles.map((article) => {
        const direction = detectDirection(article);
        return {
          ...article,
          direction
        };
      });
    }
    __name(addDirection2, "addDirection");
    module.exports = {
      detectDirection,
      addDirection: addDirection2
    };
  }
});

// src/news/confidence.js
var require_confidence = __commonJS({
  "src/news/confidence.js"(exports, module) {
    init_modules_watch_stub();
    function calculateConfidence(article) {
      let score = 0;
      if (article.impactScore >= 7) {
        score += 2;
      } else if (article.impactScore >= 4) {
        score += 1;
      }
      if (article.marketTags.length > 0) {
        score += 1;
      }
      if (article.affectedAssets.length > 0) {
        score += 1;
      }
      if (article.direction !== "NEUTRAL") {
        score += 1;
      }
      if (score >= 4) {
        return "HIGH";
      }
      if (score >= 2) {
        return "MEDIUM";
      }
      return "LOW";
    }
    __name(calculateConfidence, "calculateConfidence");
    function addConfidence2(articles) {
      return articles.map((article) => {
        const confidence = calculateConfidence(article);
        return {
          ...article,
          confidence
        };
      });
    }
    __name(addConfidence2, "addConfidence");
    module.exports = {
      calculateConfidence,
      addConfidence: addConfidence2
    };
  }
});

// src/news/impactExplanation.js
var require_impactExplanation = __commonJS({
  "src/news/impactExplanation.js"(exports, module) {
    init_modules_watch_stub();
    function generateImpactExplanation(article) {
      const { marketTags, affectedAssets, direction } = article;
      let explanation = "";
      if (marketTags.includes("crypto") || marketTags.includes("cryptoMarket")) {
        explanation = "The event is relevant to the crypto market and may affect sentiment around crypto infrastructure and institutional activity.";
      }
      if (marketTags.includes("oil") || marketTags.includes("energy")) {
        explanation = "The event may affect oil or energy supply, demand, pricing, or energy-market sentiment.";
      }
      if (marketTags.includes("gold") || marketTags.includes("copper")) {
        explanation = "The event may influence metals demand, inflation expectations, or industrial/precious-metals sentiment.";
      }
      if (marketTags.includes("usStocks") || marketTags.includes("stockMarket")) {
        explanation = "The event may affect equities through earnings, corporate actions, economic expectations, interest rates, or investor sentiment.";
      }
      if (marketTags.includes("europeStocks")) {
        explanation = "The event may affect European equities through earnings, policy, growth expectations, or regional risk sentiment.";
      }
      if (marketTags.includes("indiaStocks")) {
        explanation = "The event may affect Indian equities through earnings, economic expectations, foreign flows, or domestic sentiment.";
      }
      if (marketTags.includes("macro")) {
        explanation = "The event is a macro data or policy signal that can reprice equities, bonds, and risk appetite.";
      }
      if (marketTags.includes("geopolitics")) {
        explanation = "The event may affect markets through geopolitical risk, trade, supply chains, energy prices, and investor risk appetite.";
      }
      if (!explanation) {
        explanation = "The event has potential market relevance, but its direct impact is currently unclear.";
      }
      return explanation;
    }
    __name(generateImpactExplanation, "generateImpactExplanation");
    function addImpactExplanation2(articles) {
      return articles.map((article) => {
        const explanation = generateImpactExplanation(article);
        return {
          ...article,
          impactExplanation: explanation
        };
      });
    }
    __name(addImpactExplanation2, "addImpactExplanation");
    module.exports = {
      generateImpactExplanation,
      addImpactExplanation: addImpactExplanation2
    };
  }
});

// src/news/timeframe.js
var require_timeframe = __commonJS({
  "src/news/timeframe.js"(exports, module) {
    init_modules_watch_stub();
    function detectTimeframe(article) {
      const title = article.title.toLowerCase();
      const immediateKeywords = [
        "war",
        "attack",
        "missile",
        "rate decision",
        "fed",
        "interest rate",
        "cpi",
        "inflation",
        "opec",
        "oil",
        "tariff",
        "sanctions",
        "bank failure",
        "crash"
      ];
      for (const keyword of immediateKeywords) {
        if (title.includes(keyword)) {
          return "IMMEDIATE";
        }
      }
      const shortTermKeywords = [
        "earnings",
        "jobs",
        "unemployment",
        "etf",
        "inflows",
        "outflows",
        "approval",
        "regulation"
      ];
      for (const keyword of shortTermKeywords) {
        if (title.includes(keyword)) {
          return "SHORT_TERM";
        }
      }
      return "MEDIUM_TERM";
    }
    __name(detectTimeframe, "detectTimeframe");
    function addTimeframe2(articles) {
      return articles.map((article) => {
        const timeframe = detectTimeframe(article);
        return {
          ...article,
          timeframe
        };
      });
    }
    __name(addTimeframe2, "addTimeframe");
    module.exports = {
      detectTimeframe,
      addTimeframe: addTimeframe2
    };
  }
});

// src/news/eventType.js
var require_eventType = __commonJS({
  "src/news/eventType.js"(exports, module) {
    init_modules_watch_stub();
    var eventKeywords = {
      GEOPOLITICAL: [
        "war",
        "conflict",
        "attack",
        "missile",
        "invasion",
        "iran",
        "israel",
        "russia",
        "ukraine",
        "taiwan"
      ],
      MACRO: [
        "fed",
        "federal reserve",
        "interest rate",
        "inflation",
        "cpi",
        "jobs",
        "unemployment",
        "nonfarm",
        "payrolls",
        "nfp",
        "gdp",
        "pmi",
        "recession",
        "treasury"
      ],
      REGULATION: [
        "regulation",
        "regulator",
        "sec",
        "sebi",
        "ban",
        "banned",
        "sanctions",
        "law",
        "legislation",
        "policy"
      ],
      ETF: [
        "etf",
        "bitcoin etf",
        "ethereum etf"
      ],
      EARNINGS: [
        "earnings",
        "revenue",
        "profit",
        "quarterly results",
        "guidance",
        "eps"
      ],
      CORPORATE_ACTION: [
        "buyback",
        "share repurchase",
        "dividend",
        "stock split",
        "dilution",
        "share issuance",
        "ipo",
        "merger",
        "acquisition",
        "takeover"
      ],
      SUPPLY_SHOCK: [
        "production cut",
        "production increase",
        "supply disruption",
        "supply shortage",
        "pipeline",
        "refinery",
        "oil facility",
        "opec",
        "inventory"
      ],
      LEADERSHIP_CHANGE: [
        "ceo steps down",
        "ceo resigns",
        "chief executive",
        "appointed ceo",
        "new ceo",
        "steps down",
        "resigns"
      ]
    };
    function detectEventTypes(article) {
      const title = (article.title || "").toLowerCase();
      const eventTypes = [];
      for (const [eventType, keywords] of Object.entries(eventKeywords)) {
        for (const keyword of keywords) {
          if (title.includes(keyword)) {
            eventTypes.push(eventType);
            break;
          }
        }
      }
      if (eventTypes.length === 0) {
        eventTypes.push("OTHER");
      }
      return eventTypes;
    }
    __name(detectEventTypes, "detectEventTypes");
    function addEventType2(articles) {
      return articles.map((article) => {
        const eventTypes = detectEventTypes(article);
        return {
          ...article,
          eventTypes
        };
      });
    }
    __name(addEventType2, "addEventType");
    module.exports = {
      detectEventTypes,
      addEventType: addEventType2,
      eventKeywords
    };
  }
});

// src/ai/evidenceConfidence.js
var require_evidenceConfidence = __commonJS({
  "src/ai/evidenceConfidence.js"(exports, module) {
    init_modules_watch_stub();
    function calculateEvidenceConfidence(article) {
      const content = article.content || "";
      let score = 0;
      if (content.length >= 1e3) {
        score += 3;
      } else if (content.length >= 300) {
        score += 2;
      } else if (content.length >= 100) {
        score += 1;
      }
      if (article.sourceQualityScore >= 5) {
        score += 3;
      } else if (article.sourceQualityScore >= 3) {
        score += 2;
      } else {
        score += 1;
      }
      if (article.clusterSize >= 3) {
        score += 2;
      } else if (article.clusterSize === 2) {
        score += 1;
      }
      if (score >= 7) {
        return "HIGH";
      }
      if (score >= 4) {
        return "MEDIUM";
      }
      return "LOW";
    }
    __name(calculateEvidenceConfidence, "calculateEvidenceConfidence");
    function addEvidenceConfidence2(articles) {
      return articles.map((article) => ({
        ...article,
        evidenceConfidence: calculateEvidenceConfidence(
          article
        )
      }));
    }
    __name(addEvidenceConfidence2, "addEvidenceConfidence");
    module.exports = {
      calculateEvidenceConfidence,
      addEvidenceConfidence: addEvidenceConfidence2
    };
  }
});

// src/news/priority.js
var require_priority = __commonJS({
  "src/news/priority.js"(exports, module) {
    init_modules_watch_stub();
    function calculatePriority(article) {
      let score = 0;
      score += article.impactScore || 0;
      if (article.marketTags && article.marketTags.length >= 2) {
        score += 2;
      }
      if (article.affectedAssets && article.affectedAssets.length >= 2) {
        score += 2;
      }
      const majorEvents = [
        "GEOPOLITICAL",
        "MACRO",
        "SUPPLY_SHOCK",
        "ETF"
      ];
      if (article.eventTypes && article.eventTypes.some(
        (type) => majorEvents.includes(type)
      )) {
        score += 3;
      }
      const title = String(article.title || "").toLowerCase();
      const channelMajorKeywords = [
        "fomc",
        "federal reserve",
        "rate cut",
        "rate hike",
        "war",
        "invasion",
        "missile",
        "drone attack",
        "pipeline"
      ];
      if (channelMajorKeywords.some(
        (keyword) => title.includes(keyword)
      )) {
        score += 2;
      }
      return Math.min(score, 10);
    }
    __name(calculatePriority, "calculatePriority");
    function getPriorityLevel(score) {
      if (score >= 9) {
        return "CRITICAL";
      }
      if (score >= 7) {
        return "HIGH";
      }
      if (score >= 4) {
        return "MEDIUM";
      }
      return "LOW";
    }
    __name(getPriorityLevel, "getPriorityLevel");
    function addPriority2(articles) {
      return articles.map((article) => {
        const priorityScore = calculatePriority(article);
        return {
          ...article,
          priorityScore,
          priorityLevel: getPriorityLevel(
            priorityScore
          )
        };
      });
    }
    __name(addPriority2, "addPriority");
    module.exports = {
      calculatePriority,
      getPriorityLevel,
      addPriority: addPriority2
    };
  }
});

// src/ai/evidenceCheck.js
var require_evidenceCheck = __commonJS({
  "src/ai/evidenceCheck.js"(exports, module) {
    init_modules_watch_stub();
    function getFinalConfidence(aiConfidence, evidenceConfidence) {
      if (aiConfidence === "HIGH" && evidenceConfidence === "LOW") {
        return "LOW";
      }
      if (aiConfidence === "HIGH" && evidenceConfidence === "MEDIUM") {
        return "MEDIUM";
      }
      if (aiConfidence === "MEDIUM" && evidenceConfidence === "LOW") {
        return "LOW";
      }
      return aiConfidence;
    }
    __name(getFinalConfidence, "getFinalConfidence");
    function checkEvidence2(article, aiAnalysis, provider) {
      const issues = [];
      const evidenceConfidence = article.evidenceConfidence || "LOW";
      const finalConfidence = getFinalConfidence(
        aiAnalysis.confidence || "LOW",
        evidenceConfidence
      );
      if (provider !== "RULE_FALLBACK") {
        if (aiAnalysis.classification && aiAnalysis.classification.direction !== article.direction) {
          issues.push(
            "AI direction differs from rule-based direction."
          );
        }
        if (aiAnalysis.classification && aiAnalysis.classification.magnitude !== article.impactLevel) {
          issues.push(
            "AI magnitude differs from rule-based impact level."
          );
        }
        if (aiAnalysis.classification && aiAnalysis.classification.eventType && !article.eventTypes.includes(
          aiAnalysis.classification.eventType
        )) {
          issues.push(
            "AI event type differs from rule-based event type."
          );
        }
      }
      const adjustedConfidence = provider === "RULE_FALLBACK" ? "LOW" : finalConfidence;
      return {
        passed: issues.length === 0,
        issues,
        finalConfidence: adjustedConfidence
      };
    }
    __name(checkEvidence2, "checkEvidence");
    module.exports = {
      getFinalConfidence,
      checkEvidence: checkEvidence2
    };
  }
});

// src/ai/finalAnalysis.js
var require_finalAnalysis = __commonJS({
  "src/ai/finalAnalysis.js"(exports, module) {
    init_modules_watch_stub();
    function buildFinalAnalysis2(article, aiAnalysis, evidenceCheck) {
      return {
        title: article.title,
        content: article.content,
        source: article.source,
        marketTags: article.marketTags,
        affectedAssets: article.affectedAssets,
        // What the rule engine originally thought
        ruleBased: {
          direction: article.direction,
          impactLevel: article.impactLevel,
          eventTypes: article.eventTypes,
          timeframe: article.timeframe
        },
        // Final AI-reviewed result
        final: {
          direction: aiAnalysis.classification?.direction || article.direction,
          magnitude: aiAnalysis.classification?.magnitude || article.impactLevel,
          eventType: aiAnalysis.classification?.eventType || "OTHER",
          timeframe: aiAnalysis.classification?.timeframe || article.timeframe || "MEDIUM_TERM",
          aiConfidence: aiAnalysis.confidence || "LOW",
          evidenceConfidence: article.evidenceConfidence || "LOW",
          finalConfidence: evidenceCheck?.finalConfidence || "LOW"
        },
        summary: aiAnalysis.summary,
        whyItMatters: aiAnalysis.whyItMatters,
        bullishFactors: aiAnalysis.bullishFactors || [],
        bearishFactors: aiAnalysis.bearishFactors || [],
        risks: aiAnalysis.risks || [],
        whatToWatch: aiAnalysis.whatToWatch || [],
        analysisType: aiAnalysis.analysisType || "INTERPRETATION"
      };
    }
    __name(buildFinalAnalysis2, "buildFinalAnalysis");
    module.exports = {
      buildFinalAnalysis: buildFinalAnalysis2
    };
  }
});

// src/telegram/publishDecision.js
var require_publishDecision = __commonJS({
  "src/telegram/publishDecision.js"(exports, module) {
    init_modules_watch_stub();
    function shouldPublish(event) {
      const priorityScore = Number(
        event.priorityScore
      );
      if (!Number.isFinite(priorityScore)) {
        return false;
      }
      return priorityScore >= 8.5;
    }
    __name(shouldPublish, "shouldPublish");
    module.exports = {
      shouldPublish
    };
  }
});

// src/telegram/publishEligibility.js
var require_publishEligibility = __commonJS({
  "src/telegram/publishEligibility.js"(exports, module) {
    init_modules_watch_stub();
    var MAX_EVENT_AGE_MS = 30 * 60 * 1e3;
    function isFreshEvent(event) {
      if (!event.createdAt) {
        return false;
      }
      const createdTime = new Date(
        event.createdAt
      ).getTime();
      if (!Number.isFinite(createdTime)) {
        return false;
      }
      const age = Date.now() - createdTime;
      return age >= 0 && age <= MAX_EVENT_AGE_MS;
    }
    __name(isFreshEvent, "isFreshEvent");
    module.exports = {
      isFreshEvent
    };
  }
});

// src/telegram/postType.js
var require_postType = __commonJS({
  "src/telegram/postType.js"(exports, module) {
    init_modules_watch_stub();
    function detectPostType(event) {
      const eventTypes = event.eventTypes || [];
      const priorityLevel = event.priorityLevel || "LOW";
      const marketTags = event.marketTags || [];
      if (event.eventType === "SUPPLY_SHOCK" || eventTypes.includes(
        "SUPPLY_SHOCK"
      )) {
        return "SUPPLY_SHOCK";
      }
      if (priorityLevel === "CRITICAL") {
        return "BREAKING";
      }
      if (event.eventType === "GEOPOLITICAL" || eventTypes.includes(
        "GEOPOLITICAL"
      ) || marketTags.includes(
        "geopolitics"
      )) {
        return "GEOPOLITICAL";
      }
      if (eventTypes.includes(
        "MACRO"
      )) {
        return "MACRO";
      }
      if (eventTypes.includes(
        "ETF"
      )) {
        return "ETF";
      }
      if (eventTypes.includes(
        "EARNINGS"
      )) {
        return "EARNINGS";
      }
      if (marketTags.includes(
        "crypto"
      )) {
        return "CRYPTO";
      }
      return "MARKET_UPDATE";
    }
    __name(detectPostType, "detectPostType");
    module.exports = {
      detectPostType
    };
  }
});

// src/telegram/postBuilder.js
var require_postBuilder = __commonJS({
  "src/telegram/postBuilder.js"(exports, module) {
    init_modules_watch_stub();
    var {
      detectPostType
    } = require_postType();
    function buildTelegramPost(event, marketReactionReport) {
      const postType = event.postType || detectPostType(event);
      const direction = event.direction || "NEUTRAL";
      const magnitude = event.magnitude || "LOW";
      const timeframe = event.timeframe || "MEDIUM_TERM";
      const confidence = event.confidence || "LOW";
      let message = "";
      message += `${getPostTypeHeader(postType)}

`;
      message += `<b>${escapeHtml2(event.title)}</b>

`;
      const whyItMatters = event.whyItMatters || buildFallbackWhyItMatters(event);
      if (whyItMatters) {
        message += `\u{1F4A1} <b>Why this matters</b>
`;
        message += `${escapeHtml2(whyItMatters)}

`;
      }
      message += `\u{1F3AF} <b>Midnight Society take</b>
`;
      message += `${escapeHtml2(
        describeMarketTake(
          direction,
          magnitude,
          timeframe
        )
      )}

`;
      message += `\u{1F4CC} <b>At a glance</b>
`;
      message += `\u2022 Bias: <b>${escapeHtml2(
        humanDirection(direction)
      )}</b>
`;
      message += `\u2022 Strength: <b>${escapeHtml2(
        humanMagnitude(magnitude)
      )}</b>
`;
      message += `\u2022 Window: <b>${escapeHtml2(
        humanTimeframe(timeframe)
      )}</b>
`;
      message += `\u2022 Confidence: <b>${escapeHtml2(
        humanConfidence(confidence)
      )}</b>
`;
      const assets = event.affectedAssets || [];
      if (assets.length) {
        message += `\u2022 Watch: <b>${escapeHtml2(
          assets.join(", ")
        )}</b>
`;
      }
      message += "\n";
      if (marketReactionReport) {
        message += buildReactionSection(
          marketReactionReport
        );
      }
      message += `\u2014 <i>Midnight Society</i>`;
      return message;
    }
    __name(buildTelegramPost, "buildTelegramPost");
    function describeMarketTake(direction, magnitude, timeframe) {
      const bias = humanDirection(direction);
      const strength = humanMagnitude(magnitude);
      const window = humanTimeframe(timeframe);
      if (direction === "BULLISH") {
        return `Markets may lean ${bias.toLowerCase()} with ${strength.toLowerCase()} force over the ${window.toLowerCase()}.`;
      }
      if (direction === "BEARISH") {
        return `Pressure looks ${bias.toLowerCase()} with ${strength.toLowerCase()} intensity over the ${window.toLowerCase()}.`;
      }
      return `Signal is mixed for now \u2014 watch for confirmation over the ${window.toLowerCase()}.`;
    }
    __name(describeMarketTake, "describeMarketTake");
    function buildFallbackWhyItMatters(event) {
      const assets = event.affectedAssets || [];
      const tags = event.marketTags || [];
      if (assets.length && tags.length) {
        return `This could move ${assets.join(", ")} across ${tags.join(", ")} markets.`;
      }
      if (assets.length) {
        return `Traders will watch ${assets.join(", ")} for the next reaction.`;
      }
      if (tags.length) {
        return `This sits in ${tags.join(", ")} \u2014 a space where headlines can reprice risk quickly.`;
      }
      return "Major market headlines can shift risk appetite before full details are clear.";
    }
    __name(buildFallbackWhyItMatters, "buildFallbackWhyItMatters");
    function buildReactionSection(report) {
      if (!report) {
        return "";
      }
      let message = "";
      message += `\u{1F4CA} <b>Market check</b>
`;
      message += `Result: <b>${escapeHtml2(
        report.overall
      )}</b>
`;
      message += `Expected: <b>${escapeHtml2(
        report.expectedDirection
      )}</b>
`;
      if (report.confirmingAssets?.length) {
        message += `\u2705 Confirmed: ${escapeHtml2(
          report.confirmingAssets.join(", ")
        )}
`;
      }
      if (report.divergingAssets?.length) {
        message += `\u26A0\uFE0F Diverging: ${escapeHtml2(
          report.divergingAssets.join(", ")
        )}
`;
      }
      if (report.neutralAssets?.length) {
        message += `\u2796 Quiet: ${escapeHtml2(
          report.neutralAssets.join(", ")
        )}
`;
      }
      message += "\n";
      return message;
    }
    __name(buildReactionSection, "buildReactionSection");
    function getPostTypeHeader(postType) {
      const headers = {
        BREAKING: "\u{1F6A8} <b>BREAKING</b>\nThis one just crossed our desk",
        GEOPOLITICAL: "\u{1F30D} <b>GEOPOLITICAL RISK</b>\nWhen the world moves markets",
        CRYPTO: "\u20BF <b>CRYPTO PULSE</b>\nA signal worth a closer look",
        MACRO: "\u{1F3E6} <b>MACRO MOVE</b>\nPolicy and the bigger picture",
        SUPPLY_SHOCK: "\u26A1 <b>SUPPLY SHOCK</b>\nWhen the flow gets hit",
        ETF: "\u{1F4CA} <b>ETF FLOW</b>\nCapital is shifting",
        EARNINGS: "\u{1F4BC} <b>EARNINGS SIGNAL</b>\nResults that can reprice the tape",
        MARKET_UPDATE: "\u{1F4C8} <b>MARKET ALERT</b>\nSomething worth your attention"
      };
      return headers[postType] || headers.MARKET_UPDATE;
    }
    __name(getPostTypeHeader, "getPostTypeHeader");
    function humanDirection(direction) {
      const map = {
        BULLISH: "Bullish",
        BEARISH: "Bearish",
        NEUTRAL: "Neutral / Mixed"
      };
      return map[direction] || direction;
    }
    __name(humanDirection, "humanDirection");
    function humanMagnitude(magnitude) {
      const map = {
        HIGH: "High",
        MEDIUM: "Moderate",
        LOW: "Limited"
      };
      return map[magnitude] || magnitude;
    }
    __name(humanMagnitude, "humanMagnitude");
    function humanTimeframe(timeframe) {
      const map = {
        IMMEDIATE: "Next hours",
        SHORT_TERM: "Next few days",
        MEDIUM_TERM: "Coming weeks"
      };
      return map[timeframe] || timeframe;
    }
    __name(humanTimeframe, "humanTimeframe");
    function humanConfidence(confidence) {
      const map = {
        HIGH: "Strong",
        MEDIUM: "Moderate",
        LOW: "Early / developing"
      };
      return map[confidence] || confidence;
    }
    __name(humanConfidence, "humanConfidence");
    function escapeHtml2(text) {
      if (text === void 0 || text === null) {
        return "";
      }
      return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    __name(escapeHtml2, "escapeHtml");
    module.exports = {
      buildTelegramPost,
      buildReactionSection
    };
  }
});

// src/performance/performanceCalculator.js
var require_performanceCalculator = __commonJS({
  "src/performance/performanceCalculator.js"(exports, module) {
    init_modules_watch_stub();
    function getReliability(evaluated) {
      if (evaluated < 10) {
        return "INSUFFICIENT_DATA";
      }
      if (evaluated < 30) {
        return "EARLY_DATA";
      }
      if (evaluated < 100) {
        return "DEVELOPING";
      }
      return "ESTABLISHED";
    }
    __name(getReliability, "getReliability");
    function filterRowsByDays(rows, days) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1e3;
      return rows.filter((row) => {
        const predictedTime = new Date(row.predicted_at).getTime();
        return Number.isFinite(predictedTime) && predictedTime >= cutoff;
      });
    }
    __name(filterRowsByDays, "filterRowsByDays");
    function calculateRollingPerformance(rows) {
      const last7Days = filterRowsByDays(rows, 7);
      const last30Days = filterRowsByDays(rows, 30);
      const last90Days = filterRowsByDays(rows, 90);
      return {
        "7D": calculatePerformance(
          last7Days
        ),
        "30D": calculatePerformance(
          last30Days
        ),
        "90D": calculatePerformance(
          last90Days
        ),
        "ALL": calculatePerformance(
          rows
        )
      };
    }
    __name(calculateRollingPerformance, "calculateRollingPerformance");
    function calculatePerformance(rows) {
      let confirmed = 0;
      let divergence = 0;
      let neutral = 0;
      for (const row of rows) {
        if (row.result === "CONFIRMED") {
          confirmed++;
        } else if (row.result === "DIVERGENCE") {
          divergence++;
        } else if (row.result === "NEUTRAL") {
          neutral++;
        }
      }
      const evaluated = confirmed + divergence;
      const directionalCoverage = rows.length === 0 ? 0 : Number(
        (evaluated / rows.length * 100).toFixed(2)
      );
      const confirmationRate = evaluated === 0 ? null : Number(
        (confirmed / evaluated * 100).toFixed(2)
      );
      return {
        total: rows.length,
        confirmed,
        divergence,
        neutral,
        evaluated,
        sampleSize: evaluated,
        directionalCoverage,
        confirmationRate,
        reliability: getReliability(evaluated)
      };
    }
    __name(calculatePerformance, "calculatePerformance");
    function calculatePerformanceByGroup(rows, groupBy) {
      const groups = {};
      for (const row of rows) {
        const key = row[groupBy];
        if (!key) {
          continue;
        }
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(row);
      }
      const result = {};
      for (const key of Object.keys(groups)) {
        result[key] = calculatePerformance(
          groups[key]
        );
      }
      return result;
    }
    __name(calculatePerformanceByGroup, "calculatePerformanceByGroup");
    function calculatePerformanceByAssetAndHorizon(rows) {
      const groups = {};
      for (const row of rows) {
        if (!row.symbol || !row.horizon) {
          continue;
        }
        const asset = row.symbol;
        const horizon = row.horizon;
        if (!groups[asset]) {
          groups[asset] = {};
        }
        if (!groups[asset][horizon]) {
          groups[asset][horizon] = [];
        }
        groups[asset][horizon].push(row);
      }
      const result = {};
      for (const asset of Object.keys(groups)) {
        result[asset] = {};
        for (const horizon of Object.keys(groups[asset])) {
          result[asset][horizon] = calculatePerformance(
            groups[asset][horizon]
          );
        }
      }
      return result;
    }
    __name(calculatePerformanceByAssetAndHorizon, "calculatePerformanceByAssetAndHorizon");
    function getDisplayConfirmationRate(performance) {
      if (performance.reliability === "INSUFFICIENT_DATA") {
        return null;
      }
      return performance.confirmationRate;
    }
    __name(getDisplayConfirmationRate, "getDisplayConfirmationRate");
    module.exports = {
      calculatePerformance,
      calculatePerformanceByGroup,
      calculatePerformanceByAssetAndHorizon,
      calculateRollingPerformance,
      getReliability,
      getDisplayConfirmationRate
    };
  }
});

// .wrangler/tmp/bundle-S3WVfQ/middleware-loader.entry.ts
init_modules_watch_stub();

// .wrangler/tmp/bundle-S3WVfQ/middleware-insertion-facade.js
init_modules_watch_stub();

// src/cloudflare/worker.js
init_modules_watch_stub();

// src/cloudflare/config.js
init_modules_watch_stub();
function getEnvString(env, key, fallback = "") {
  const value = env?.[key];
  if (value === void 0 || value === null) {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
}
__name(getEnvString, "getEnvString");
function requireEnvString(env, key) {
  const value = getEnvString(env, key, "");
  if (!value) {
    throw new Error(`${key} is not configured`);
  }
  return value;
}
__name(requireEnvString, "requireEnvString");
function getConfig(env) {
  return {
    telegramBotToken: getEnvString(env, "TELEGRAM_BOT_TOKEN"),
    telegramChannelId: getEnvString(env, "TELEGRAM_CHANNEL_ID"),
    telegramTestChannelId: getEnvString(
      env,
      "TELEGRAM_TEST_CHANNEL_ID",
      getEnvString(env, "TELEGRAM_TEST_CHAT_ID")
    ),
    telegramMaxPostsPerJob: Number(
      getEnvString(env, "TELEGRAM_MAX_POSTS_PER_JOB", "1")
    ),
    telegramMinMinutesBetweenPosts: Number(
      getEnvString(env, "TELEGRAM_MIN_MINUTES_BETWEEN_POSTS", "10")
    ),
    oilPriceApiKey: getEnvString(env, "OILPRICEAPI_KEY"),
    googleApiKey: getEnvString(
      env,
      "GOOGLE_API_KEY",
      getEnvString(env, "GEMINI_API_KEY")
    ),
    geminiModel: getEnvString(env, "GEMINI_MODEL", "gemini-2.0-flash"),
    groqApiKey: getEnvString(env, "GROQ_API_KEY"),
    groqModel: getEnvString(env, "GROQ_MODEL", "llama-3.1-8b-instant"),
    openRouterApiKey: getEnvString(env, "OPENROUTER_API_KEY"),
    openRouterModel: getEnvString(env, "OPENROUTER_MODEL", "openrouter/free"),
    openRouterSiteUrl: getEnvString(
      env,
      "OPENROUTER_SITE_URL",
      "https://midnight-society.local"
    ),
    openRouterAppName: getEnvString(
      env,
      "OPENROUTER_APP_NAME",
      "Midnight Society"
    ),
    aiProviderOrder: getEnvString(
      env,
      "AI_PROVIDER_ORDER",
      "GEMINI,GROQ,OPENROUTER"
    ),
    aiProviderMaxRetries: Number(
      getEnvString(env, "AI_PROVIDER_MAX_RETRIES", "1")
    ),
    // Conservative Worker bounds
    maxRssSourcesPerRun: Number(getEnvString(env, "CF_MAX_RSS_SOURCES", "24")),
    maxNewEventsPerRun: Number(getEnvString(env, "CF_MAX_NEW_EVENTS", "5")),
    maxAiCallsPerRun: Number(getEnvString(env, "CF_MAX_AI_CALLS", "3")),
    maxMarketEventsPerRun: Number(getEnvString(env, "CF_MAX_MARKET_EVENTS", "10")),
    maxSymbolsPerEvent: Number(getEnvString(env, "CF_MAX_SYMBOLS_PER_EVENT", "4"))
  };
}
__name(getConfig, "getConfig");
function hasDedicatedTelegramTestDestination(env) {
  const config = getConfig(env);
  return Boolean(config.telegramTestChannelId);
}
__name(hasDedicatedTelegramTestDestination, "hasDedicatedTelegramTestDestination");

// src/cloudflare/worker.js
init_client();

// src/cloudflare/jobs/maintenanceJob.js
init_modules_watch_stub();
init_client();

// src/cloudflare/logger.js
init_modules_watch_stub();
var SECRET_KEYS = [
  "token",
  "api_key",
  "apikey",
  "authorization",
  "password",
  "secret"
];
function sanitizeMeta(meta) {
  if (!meta || typeof meta !== "object") {
    return void 0;
  }
  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (SECRET_KEYS.some((part) => lower.includes(part))) {
      out[key] = "[redacted]";
      continue;
    }
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 200)}\u2026[truncated]`;
      continue;
    }
    out[key] = value;
  }
  return out;
}
__name(sanitizeMeta, "sanitizeMeta");
function logInfo(event, meta) {
  console.log(
    JSON.stringify({
      level: "INFO",
      event,
      ...sanitizeMeta(meta),
      at: (/* @__PURE__ */ new Date()).toISOString()
    })
  );
}
__name(logInfo, "logInfo");
function logWarn(event, meta) {
  console.warn(
    JSON.stringify({
      level: "WARN",
      event,
      ...sanitizeMeta(meta),
      at: (/* @__PURE__ */ new Date()).toISOString()
    })
  );
}
__name(logWarn, "logWarn");
function logError(event, meta) {
  console.error(
    JSON.stringify({
      level: "ERROR",
      event,
      ...sanitizeMeta(meta),
      at: (/* @__PURE__ */ new Date()).toISOString()
    })
  );
}
__name(logError, "logError");

// src/cloudflare/jobs/maintenanceJob.js
async function runMaintenanceJob(env) {
  logInfo("JOB_START", { job: "maintenance" });
  try {
    await dbRun(
      env,
      `
        UPDATE ai_provider_state
        SET
          status = 'AVAILABLE',
          cooldown_until = NULL,
          updated_at = ?
        WHERE status = 'COOLDOWN'
          AND cooldown_until IS NOT NULL
          AND cooldown_until <= ?
      `,
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    );
    logInfo("JOB_SUCCESS", { job: "maintenance" });
    return { status: "SUCCESS" };
  } catch (error) {
    logWarn("JOB_PARTIAL_FAILURE", {
      job: "maintenance",
      reason: String(error.message || error)
    });
    return { status: "ERROR", reason: String(error.message || error) };
  }
}
__name(runMaintenanceJob, "runMaintenanceJob");

// src/cloudflare/jobs/marketJob.js
init_modules_watch_stub();
var outcomeMod = __toESM(require_outcome(), 1);
var evaMod = __toESM(require_expectedVsActual(), 1);
var horizonMod = __toESM(require_outcomeHorizon(), 1);
var reportMod = __toESM(require_marketReactionReport(), 1);
init_eventRepository();

// src/cloudflare/d1/marketRepository.js
init_modules_watch_stub();
init_client();
async function saveSnapshot(env, eventId, snapshot) {
  await dbRun(
    env,
    `
      INSERT INTO snapshots (
        event_id,
        symbol,
        price,
        currency,
        timestamp
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    eventId,
    snapshot.symbol,
    snapshot.price,
    snapshot.currency || "USD",
    snapshot.timestamp
  );
}
__name(saveSnapshot, "saveSnapshot");
async function getInitialSnapshot(env, eventId, symbol) {
  return dbGet(
    env,
    `
      SELECT *
      FROM snapshots
      WHERE event_id = ?
        AND symbol = ?
      ORDER BY timestamp ASC
      LIMIT 1
    `,
    eventId,
    symbol
  );
}
__name(getInitialSnapshot, "getInitialSnapshot");
async function getOutcomesByHorizon(env, eventId, horizon) {
  return dbAll(
    env,
    `
      SELECT *
      FROM outcomes
      WHERE event_id = ?
        AND horizon = ?
      ORDER BY id ASC
    `,
    eventId,
    horizon
  );
}
__name(getOutcomesByHorizon, "getOutcomesByHorizon");

// src/cloudflare/d1/outcomeRepository.js
init_modules_watch_stub();
init_client();
async function outcomeExists(env, eventId, symbol, horizon) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM outcomes
      WHERE event_id = ?
        AND symbol = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    symbol,
    horizon
  );
  return Boolean(row);
}
__name(outcomeExists, "outcomeExists");
async function saveOutcome(env, outcome) {
  await dbRun(
    env,
    `
      INSERT INTO outcomes (
        event_id,
        symbol,
        horizon,
        initial_price,
        later_price,
        percentage_change,
        direction,
        initial_timestamp,
        later_timestamp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    outcome.eventId,
    outcome.symbol,
    outcome.horizon,
    outcome.initialPrice,
    outcome.laterPrice,
    outcome.percentageChange,
    outcome.direction,
    outcome.initialTimestamp,
    outcome.laterTimestamp
  );
}
__name(saveOutcome, "saveOutcome");
async function saveExpectedVsActual(env, eventId, result, horizon) {
  await dbRun(
    env,
    `
      INSERT INTO expected_vs_actual (
        event_id,
        symbol,
        horizon,
        expected,
        actual,
        percentage_change,
        threshold,
        result,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    eventId,
    result.symbol,
    horizon,
    result.expected,
    result.actual,
    result.percentageChange,
    result.threshold,
    result.result,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
__name(saveExpectedVsActual, "saveExpectedVsActual");
async function getExpectedVsActual(env, eventId, symbol, horizon) {
  return dbGet(
    env,
    `
      SELECT *
      FROM expected_vs_actual
      WHERE event_id = ?
        AND symbol = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    symbol,
    horizon
  );
}
__name(getExpectedVsActual, "getExpectedVsActual");

// src/cloudflare/d1/predictionRepository.js
init_modules_watch_stub();
init_client();
async function savePrediction(env, eventId, finalAnalysis) {
  await dbRun(
    env,
    `
      INSERT INTO event_predictions (
        event_id,
        direction,
        magnitude,
        event_type,
        timeframe,
        confidence,
        predicted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    eventId,
    finalAnalysis.final?.direction || "NEUTRAL",
    finalAnalysis.final?.magnitude || "LOW",
    finalAnalysis.final?.eventType || "OTHER",
    finalAnalysis.final?.timeframe || "MEDIUM_TERM",
    finalAnalysis.final?.finalConfidence || "LOW",
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
__name(savePrediction, "savePrediction");
async function getPrediction(env, eventId) {
  return dbGet(
    env,
    `
      SELECT *
      FROM event_predictions
      WHERE event_id = ?
      LIMIT 1
    `,
    eventId
  );
}
__name(getPrediction, "getPrediction");
async function predictionExists(env, eventId) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM event_predictions
      WHERE event_id = ?
      LIMIT 1
    `,
    eventId
  );
  return Boolean(row);
}
__name(predictionExists, "predictionExists");

// src/cloudflare/d1/reactionPublishRepository.js
init_modules_watch_stub();
init_client();
async function isReactionPublished(env, eventId, horizon) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM published_reactions
      WHERE event_id = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    horizon
  );
  return Boolean(row);
}
__name(isReactionPublished, "isReactionPublished");
async function savePublishedReaction(env, eventId, horizon, telegramMessageId) {
  await dbRun(
    env,
    `
      INSERT INTO published_reactions (
        event_id,
        horizon,
        telegram_message_id,
        published_at
      )
      VALUES (?, ?, ?, ?)
    `,
    eventId,
    horizon,
    telegramMessageId,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
__name(savePublishedReaction, "savePublishedReaction");

// src/cloudflare/d1/reactionRepository.js
init_modules_watch_stub();
init_client();
async function getExpectedVsActualRow(env, eventId, symbol, horizon) {
  return dbGet(
    env,
    `
      SELECT *
      FROM expected_vs_actual
      WHERE event_id = ?
        AND symbol = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    symbol,
    horizon
  );
}
__name(getExpectedVsActualRow, "getExpectedVsActualRow");
async function saveMarketReaction(env, reaction) {
  await dbRun(
    env,
    `
      INSERT INTO market_reactions (
        event_id,
        horizon,
        expected_direction,
        total_assets,
        confirmed,
        divergences,
        neutral,
        overall,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    reaction.eventId,
    reaction.horizon,
    reaction.expectedDirection,
    reaction.totalAssets,
    reaction.confirmed,
    reaction.divergences,
    reaction.neutral,
    reaction.overall,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
__name(saveMarketReaction, "saveMarketReaction");
async function getMarketReaction(env, eventId, horizon) {
  const row = await dbGet(
    env,
    `
      SELECT *
      FROM market_reactions
      WHERE event_id = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    horizon
  );
  if (!row) {
    return null;
  }
  const outcomes = await getOutcomesByHorizon(env, eventId, horizon);
  const confirmingAssets = [];
  const divergingAssets = [];
  const neutralAssets = [];
  const reactions = [];
  for (const outcome of outcomes) {
    const expectedVsActual = await getExpectedVsActualRow(
      env,
      eventId,
      outcome.symbol,
      horizon
    );
    const result = expectedVsActual?.result || "UNKNOWN";
    if (result === "CONFIRMED") {
      confirmingAssets.push(outcome.symbol);
    } else if (result === "DIVERGENCE") {
      divergingAssets.push(outcome.symbol);
    } else if (result === "NEUTRAL") {
      neutralAssets.push(outcome.symbol);
    }
    reactions.push({
      symbol: outcome.symbol,
      percentageChange: outcome.percentage_change,
      direction: outcome.direction
    });
  }
  return {
    eventId: row.event_id,
    horizon: row.horizon,
    expectedDirection: row.expected_direction,
    totalAssets: row.total_assets,
    confirmed: row.confirmed,
    divergences: row.divergences,
    neutral: row.neutral,
    overall: row.overall,
    createdAt: row.created_at,
    confirmingAssets,
    divergingAssets,
    neutralAssets,
    reactions
  };
}
__name(getMarketReaction, "getMarketReaction");
async function reactionExists(env, eventId, horizon) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM market_reactions
      WHERE event_id = ?
        AND horizon = ?
      LIMIT 1
    `,
    eventId,
    horizon
  );
  return Boolean(row);
}
__name(reactionExists, "reactionExists");

// src/cloudflare/market/prices.js
init_modules_watch_stub();
var marketProviders = {
  BTC: {
    type: "coinbase",
    url: "https://api.coinbase.com/v2/prices/BTC-USD/spot"
  },
  ETH: {
    type: "coinbase",
    url: "https://api.coinbase.com/v2/prices/ETH-USD/spot"
  },
  BRENT: {
    type: "oilpriceapi",
    code: "BRENT_CRUDE_USD"
  },
  WTI: {
    type: "oilpriceapi",
    code: "WTI_USD"
  }
};
async function getMarketPrice(env, symbol) {
  const provider = marketProviders[symbol];
  if (!provider) {
    throw new Error(
      `No market provider configured for ${symbol}`
    );
  }
  if (provider.type === "coinbase") {
    return getCoinbasePrice(symbol, provider);
  }
  if (provider.type === "oilpriceapi") {
    return getOilPrice(env, symbol, provider);
  }
  throw new Error(
    `Unsupported market provider for ${symbol}`
  );
}
__name(getMarketPrice, "getMarketPrice");
async function getCoinbasePrice(symbol, provider) {
  logInfo("market_price_request", {
    symbol,
    provider: "coinbase"
  });
  const response = await fetch(provider.url);
  if (!response.ok) {
    logWarn("market_price_http_error", {
      symbol,
      provider: "coinbase",
      status: response.status
    });
    throw new Error(
      `Coinbase API failed: ${response.status}`
    );
  }
  const data = await response.json();
  return {
    symbol,
    price: Number(data.data.amount),
    currency: data.data.currency,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(getCoinbasePrice, "getCoinbasePrice");
async function getOilPrice(env, symbol, provider) {
  const config = getConfig(env);
  const apiKey = config.oilPriceApiKey;
  if (!apiKey) {
    throw new Error(
      "OILPRICEAPI_KEY is not configured"
    );
  }
  const url = `https://api.oilpriceapi.com/v1/prices/latest?by_code=${provider.code}`;
  logInfo("market_price_request", {
    symbol,
    provider: "oilpriceapi"
  });
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    logWarn("market_price_http_error", {
      symbol,
      provider: "oilpriceapi",
      status: response.status
    });
    throw new Error(
      `OilPriceAPI failed: ${response.status}`
    );
  }
  const data = await response.json();
  if (!data.data || typeof data.data.price !== "number") {
    throw new Error(
      `Invalid OilPriceAPI response for ${symbol}`
    );
  }
  return {
    symbol,
    price: data.data.price,
    currency: data.data.currency || "USD",
    timestamp: data.data.created_at || data.data.timestamp || (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(getOilPrice, "getOilPrice");
async function getMarketPriceFromProviders(env, symbol, minimumTimestamp = null) {
  const providers = [
    {
      name: "OilPriceAPI",
      fetch: /* @__PURE__ */ __name(() => getMarketPrice(env, symbol), "fetch")
    },
    {
      name: "AmericasOilWatch",
      fetch: /* @__PURE__ */ __name(() => getAmericasOilWatchPrice(symbol), "fetch")
    }
  ];
  for (const provider of providers) {
    try {
      logInfo("market_price_try", {
        symbol,
        provider: provider.name
      });
      const marketData = await provider.fetch();
      if (minimumTimestamp) {
        const minimumTime = new Date(minimumTimestamp).getTime();
        const providerTime = new Date(
          marketData.timestamp
        ).getTime();
        if (!Number.isFinite(providerTime)) {
          throw new Error(
            "Invalid provider timestamp"
          );
        }
        if (providerTime <= minimumTime) {
          throw new Error(
            "Provider returned stale market data"
          );
        }
      }
      logInfo("market_price_accepted", {
        symbol,
        provider: provider.name
      });
      return marketData;
    } catch (error) {
      logWarn("market_price_rejected", {
        symbol,
        provider: provider.name,
        message: error.message
      });
    }
  }
  logError("market_price_unavailable", { symbol });
  throw new Error(
    `No fresh market data available for ${symbol}`
  );
}
__name(getMarketPriceFromProviders, "getMarketPriceFromProviders");
async function getAmericasOilWatchPrice(symbol) {
  const endpoints = {
    BRENT: "https://americasoilwatch.com/api/v1/brent",
    WTI: "https://americasoilwatch.com/api/v1/wti"
  };
  const url = endpoints[symbol];
  if (!url) {
    throw new Error(
      `AmericasOilWatch does not support ${symbol}`
    );
  }
  logInfo("market_price_request", {
    symbol,
    provider: "AmericasOilWatch"
  });
  const response = await fetch(url);
  if (!response.ok) {
    logWarn("market_price_http_error", {
      symbol,
      provider: "AmericasOilWatch",
      status: response.status
    });
    throw new Error(
      `AmericasOilWatch failed: ${response.status}`
    );
  }
  const data = await response.json();
  const price = typeof data.price === "number" ? data.price : data.priceUsd;
  const timestamp = data.timestamp || data.lastUpdated || data.fetchedAt || data.observedAt;
  if (typeof price !== "number" || !timestamp) {
    throw new Error(
      `Invalid AmericasOilWatch response for ${symbol}`
    );
  }
  return {
    symbol,
    price,
    currency: data.currency || "USD",
    timestamp
  };
}
__name(getAmericasOilWatchPrice, "getAmericasOilWatchPrice");

// src/cloudflare/telegram/publishWithLedger.js
init_modules_watch_stub();

// src/cloudflare/d1/publishRepository.js
init_modules_watch_stub();
init_client();
async function isPublished(env, eventId) {
  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM published_posts
      WHERE event_id = ?
      LIMIT 1
    `,
    eventId
  );
  return Boolean(row);
}
__name(isPublished, "isPublished");
async function savePublishedPost(env, eventId, telegramMessageId) {
  await dbRun(
    env,
    `
      INSERT INTO published_posts (
        event_id,
        telegram_message_id,
        published_at
      )
      VALUES (?, ?, ?)
    `,
    eventId,
    telegramMessageId,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
__name(savePublishedPost, "savePublishedPost");
async function getLatestPublishedAt(env) {
  const row = await dbGet(
    env,
    `
      SELECT published_at
      FROM published_posts
      ORDER BY published_at DESC
      LIMIT 1
    `
  );
  return row?.published_at || null;
}
__name(getLatestPublishedAt, "getLatestPublishedAt");

// src/cloudflare/telegram/telegramPublisher.js
init_modules_watch_stub();
var TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
function requireEnvValue(env, key) {
  const value = env?.[key];
  if (value === void 0 || value === null || String(value).trim() === "") {
    throw new Error(`${key} is not configured`);
  }
  return String(value);
}
__name(requireEnvValue, "requireEnvValue");
function sanitizeTelegramError(status, bodyText, telegramDescription) {
  const description = telegramDescription || (bodyText && bodyText.length < 300 ? bodyText : "Telegram request failed");
  return `Telegram API HTTP ${status}: ${description}`;
}
__name(sanitizeTelegramError, "sanitizeTelegramError");
function parseTelegramJson(rawText) {
  if (!rawText || !String(rawText).trim()) {
    throw new Error("Telegram API returned an empty response");
  }
  try {
    return JSON.parse(rawText);
  } catch (_error) {
    throw new Error("Telegram API returned invalid JSON");
  }
}
__name(parseTelegramJson, "parseTelegramJson");
async function publishTelegramMessage(env, message, options = {}) {
  const token = requireEnvValue(env, "TELEGRAM_BOT_TOKEN");
  const chatId = options.chatId !== void 0 && options.chatId !== null ? String(options.chatId) : requireEnvValue(env, "TELEGRAM_CHANNEL_ID");
  if (message === void 0 || message === null || String(message).trim() === "") {
    throw new Error("Telegram message cannot be empty");
  }
  const text = String(message);
  if (text.length > TELEGRAM_MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Telegram message exceeds ${TELEGRAM_MAX_MESSAGE_LENGTH} characters (${text.length})`
    );
  }
  const parseMode = options.parseMode || "HTML";
  const disableLinkPreview = options.disableLinkPreview === void 0 ? true : Boolean(options.disableLinkPreview);
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    link_preview_options: {
      is_disabled: disableLinkPreview
    }
  };
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new Error("fetch is not available");
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  let response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw new Error(
      `Telegram API network error: ${String(error.message || error)}`
    );
  }
  const rawText = await response.text();
  let data;
  try {
    data = parseTelegramJson(rawText);
  } catch (error) {
    throw new Error(
      sanitizeTelegramError(response.status, rawText, error.message)
    );
  }
  if (!response.ok) {
    throw new Error(
      sanitizeTelegramError(
        response.status,
        rawText,
        data?.description
      )
    );
  }
  if (!data || data.ok !== true) {
    throw new Error(
      sanitizeTelegramError(
        response.status,
        rawText,
        data?.description || "ok was not true"
      )
    );
  }
  const result = data.result;
  if (!result || result.message_id === void 0 || result.message_id === null) {
    throw new Error("Telegram API success response missing message_id");
  }
  return {
    ok: true,
    messageId: result.message_id,
    chatId: result.chat?.id ?? chatId,
    // Compatibility with local publisher callers that read message_id
    message_id: result.message_id,
    result
  };
}
__name(publishTelegramMessage, "publishTelegramMessage");

// src/cloudflare/telegram/publishWithLedger.js
async function publishAndRecordPost(env, eventId, message, options = {}) {
  if (!eventId) {
    throw new Error("eventId is required");
  }
  if (await isPublished(env, eventId)) {
    return {
      published: false,
      reason: "ALREADY_PUBLISHED"
    };
  }
  const send = options.send || publishTelegramMessage;
  const save = options.save || savePublishedPost;
  const telegramResult = await send(env, message, options);
  await save(env, eventId, telegramResult.messageId);
  return {
    published: true,
    telegramMessageId: telegramResult.messageId,
    ...telegramResult
  };
}
__name(publishAndRecordPost, "publishAndRecordPost");
async function publishAndRecordReaction(env, eventId, horizon, message, options = {}) {
  if (!eventId) {
    throw new Error("eventId is required");
  }
  if (!horizon) {
    throw new Error("horizon is required");
  }
  if (await isReactionPublished(env, eventId, horizon)) {
    return {
      published: false,
      reason: "ALREADY_PUBLISHED"
    };
  }
  const send = options.send || publishTelegramMessage;
  const save = options.save || savePublishedReaction;
  const telegramResult = await send(env, message, options);
  await save(env, eventId, horizon, telegramResult.messageId);
  return {
    published: true,
    telegramMessageId: telegramResult.messageId,
    ...telegramResult
  };
}
__name(publishAndRecordReaction, "publishAndRecordReaction");

// src/cloudflare/jobs/marketJob.js
function pickExport(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }
  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }
  if (mod && mod[name] !== void 0) {
    return mod[name];
  }
  if (mod?.default && mod.default[name] !== void 0) {
    return mod.default[name];
  }
  throw new Error(`Missing export ${name}`);
}
__name(pickExport, "pickExport");
var createOutcome = pickExport(outcomeMod, "createOutcome");
var createExpectedVsActual = pickExport(evaMod, "createExpectedVsActual");
var OUTCOME_HORIZONS = pickExport(horizonMod, "OUTCOME_HORIZONS");
var createMarketReactionReport = pickExport(
  reportMod,
  "createMarketReactionReport"
);
async function processCloudflareReaction(env, event, horizon) {
  const eventId = event.eventId;
  if (await reactionExists(env, eventId, horizon)) {
    return {
      status: "ALREADY_PROCESSED",
      eventId,
      horizon
    };
  }
  const outcomes = await getOutcomesByHorizon(env, eventId, horizon);
  if (!outcomes.length) {
    return { status: "NO_DATA", eventId, horizon };
  }
  const normalizedOutcomes = [];
  for (const outcome of outcomes) {
    const expectedVsActual = await getExpectedVsActual(
      env,
      eventId,
      outcome.symbol,
      horizon
    );
    normalizedOutcomes.push({
      symbol: outcome.symbol,
      percentageChange: outcome.percentage_change,
      direction: outcome.direction,
      expectedVsActual: {
        expected: expectedVsActual?.expected || "UNKNOWN",
        actual: expectedVsActual?.actual || outcome.direction,
        percentageChange: outcome.percentage_change,
        result: expectedVsActual?.result || "UNKNOWN"
      }
    });
  }
  const prediction = await getPrediction(env, eventId);
  const report = createMarketReactionReport(
    {
      eventId,
      direction: prediction?.direction || "NEUTRAL"
    },
    normalizedOutcomes
  );
  await saveMarketReaction(env, {
    ...report,
    horizon
  });
  return {
    status: "SUCCESS",
    eventId,
    horizon,
    report
  };
}
__name(processCloudflareReaction, "processCloudflareReaction");
async function processEventOutcomes(env, event) {
  const prediction = await getPrediction(env, event.eventId);
  if (!prediction) {
    logWarn("OUTCOME_SKIP_NO_PREDICTION", { eventId: event.eventId });
    return;
  }
  const horizons = [
    OUTCOME_HORIZONS.ONE_HOUR,
    OUTCOME_HORIZONS.ONE_DAY,
    OUTCOME_HORIZONS.ONE_WEEK
  ];
  for (const horizon of horizons) {
    for (const symbol of event.affectedAssets || []) {
      try {
        const initialSnapshot = await getInitialSnapshot(
          env,
          event.eventId,
          symbol
        );
        if (!initialSnapshot) {
          continue;
        }
        const initialTime = new Date(initialSnapshot.timestamp).getTime();
        const elapsed = Date.now() - initialTime;
        if (elapsed < horizon.milliseconds) {
          continue;
        }
        if (await outcomeExists(env, event.eventId, symbol, horizon.name)) {
          continue;
        }
        const laterSnapshot = await getMarketPriceFromProviders(
          env,
          symbol,
          initialSnapshot.timestamp
        );
        const outcome = createOutcome(
          event,
          initialSnapshot,
          laterSnapshot,
          horizon.name
        );
        await saveOutcome(env, outcome);
        const expectedVsActual = createExpectedVsActual(
          prediction.direction,
          outcome
        );
        await saveExpectedVsActual(
          env,
          event.eventId,
          expectedVsActual,
          horizon.name
        );
        await processCloudflareReaction(env, event, horizon.name);
      } catch (error) {
        logError("OUTCOME_SYMBOL_FAILED", {
          eventId: event.eventId,
          symbol,
          horizon: horizon.name,
          reason: String(error.message || error)
        });
      }
    }
  }
}
__name(processEventOutcomes, "processEventOutcomes");
async function runMarketJob(env, options = {}) {
  const config = getConfig(env);
  const events = await getEventsWithSnapshots(env);
  const limited = events.slice(0, config.maxMarketEventsPerRun);
  logInfo("JOB_START", { job: "market", events: limited.length });
  for (const event of limited) {
    try {
      await processEventOutcomes(env, event);
    } catch (error) {
      logError("MARKET_EVENT_FAILED", {
        eventId: event.eventId,
        reason: String(error.message || error)
      });
    }
  }
  if (!options.disableTelegram) {
    await publishMarketReactions(env, options);
  }
  logInfo("JOB_SUCCESS", { job: "market" });
  return { status: "SUCCESS", events: limited.length };
}
__name(runMarketJob, "runMarketJob");
async function publishMarketReactions(env, options = {}) {
  const events = await getEventsWithSnapshots(env);
  const horizons = ["1H", "1D", "1W"];
  const reactionMessageMod = await Promise.resolve().then(() => __toESM(require_marketReactionMessage(), 1));
  const buildMarketReactionMessage = pickExport(
    reactionMessageMod,
    "buildMarketReactionMessage"
  );
  for (const event of events.slice(0, getConfig(env).maxMarketEventsPerRun)) {
    for (const horizon of horizons) {
      try {
        if (await isReactionPublished(env, event.eventId, horizon)) {
          continue;
        }
        const reaction = await getMarketReaction(env, event.eventId, horizon);
        if (!reaction) {
          continue;
        }
        const message = buildMarketReactionMessage(event, reaction);
        if (!message) {
          continue;
        }
        if (options.disableTelegram || options.dryRunPublish) {
          logWarn("REACTION_TELEGRAM_SKIPPED", {
            eventId: event.eventId,
            horizon
          });
          continue;
        }
        await publishAndRecordReaction(env, event.eventId, horizon, message);
      } catch (error) {
        logError("REACTION_PUBLISH_FAILED", {
          eventId: event.eventId,
          horizon,
          reason: String(error.message || error)
        });
      }
    }
  }
}
__name(publishMarketReactions, "publishMarketReactions");
async function runReactionJob(env, options = {}) {
  logInfo("JOB_START", { job: "reaction" });
  await publishMarketReactions(env, options);
  logInfo("JOB_SUCCESS", { job: "reaction" });
  return { status: "SUCCESS" };
}
__name(runReactionJob, "runReactionJob");

// src/cloudflare/jobs/newsJob.js
init_modules_watch_stub();
init_eventRepository();

// src/cloudflare/market/buildMarketEvent.js
init_modules_watch_stub();
var eventMod = __toESM(require_event(), 1);
function pickExport2(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }
  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }
  throw new Error(`Missing export ${name}`);
}
__name(pickExport2, "pickExport");
var createMarketEvent = pickExport2(eventMod, "createMarketEvent");
var addSnapshot = pickExport2(eventMod, "addSnapshot");
async function buildMarketEvent(env, article) {
  const config = getConfig(env);
  let event = createMarketEvent(article);
  const symbols = (event.affectedAssets || []).slice(
    0,
    config.maxSymbolsPerEvent
  );
  for (const symbol of symbols) {
    try {
      const marketData = await getMarketPriceFromProviders(env, symbol);
      event = addSnapshot(event, marketData);
    } catch (error) {
      logWarn("MARKET_SNAPSHOT_SKIP", {
        symbol,
        reason: String(error.message || error)
      });
    }
  }
  logInfo("MARKET_SNAPSHOTS_COLLECTED", {
    eventId: event.eventId,
    count: event.snapshots?.length || 0
  });
  return event;
}
__name(buildMarketEvent, "buildMarketEvent");

// src/cloudflare/news/runProcessNews.js
init_modules_watch_stub();

// src/cloudflare/news/fetchNews.js
init_modules_watch_stub();

// src/cloudflare/news/rssSources.js
init_modules_watch_stub();
var sourcesMod = __toESM(require_rssSources(), 1);
function pickExport3(mod, name) {
  if (mod && mod[name] !== void 0) {
    return mod[name];
  }
  if (mod?.default && mod.default[name] !== void 0) {
    return mod.default[name];
  }
  throw new Error(`Missing export ${name}`);
}
__name(pickExport3, "pickExport");
var NEWS_SOURCES = pickExport3(sourcesMod, "NEWS_SOURCES");

// src/cloudflare/news/safeFetchRss.js
init_modules_watch_stub();
var RSS_TIMEOUT_MS = 1e4;
function decodeXmlEntities(text) {
  if (!text) {
    return "";
  }
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(
    /&#(\d+);/g,
    (_, code) => String.fromCharCode(Number(code))
  ).replace(
    /&#x([0-9a-f]+);/gi,
    (_, hex) => String.fromCharCode(parseInt(hex, 16))
  ).trim();
}
__name(decodeXmlEntities, "decodeXmlEntities");
function stripHtml(text) {
  return decodeXmlEntities(text).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
__name(stripHtml, "stripHtml");
function extractTag(block, tagNames) {
  const names = Array.isArray(tagNames) ? tagNames : [tagNames];
  for (const tag of names) {
    const re = new RegExp(
      `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
      "i"
    );
    const match = block.match(re);
    if (match) {
      return decodeXmlEntities(match[1]);
    }
  }
  return "";
}
__name(extractTag, "extractTag");
function extractLink(block) {
  const tagged = extractTag(block, ["link", "id"]);
  if (tagged && /^https?:\/\//i.test(tagged)) {
    return tagged.trim();
  }
  const hrefMatch = block.match(
    /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i
  );
  if (hrefMatch) {
    return hrefMatch[1].trim();
  }
  if (tagged) {
    return tagged.trim();
  }
  return "";
}
__name(extractLink, "extractLink");
function extractItems(xml) {
  const itemBlocks = [];
  const itemRe = /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    itemBlocks.push(match[2]);
  }
  return itemBlocks.map((block) => {
    const title = extractTag(block, "title");
    const link = extractLink(block);
    const content = extractTag(block, [
      "content:encoded",
      "content",
      "description",
      "summary"
    ]) || "";
    const contentSnippet = stripHtml(content);
    const pubDate = extractTag(block, [
      "pubDate",
      "published",
      "updated",
      "dc:date"
    ]) || null;
    const creator = extractTag(block, ["dc:creator", "author", "creator"]) || void 0;
    return {
      title,
      link,
      content,
      contentSnippet,
      pubDate,
      creator
    };
  });
}
__name(extractItems, "extractItems");
function extractChannelTitle(xml) {
  const channelMatch = xml.match(
    /<channel(?:\s[^>]*)?>[\s\S]*?<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i
  );
  if (channelMatch) {
    return decodeXmlEntities(channelMatch[1]);
  }
  const feedMatch = xml.match(
    /<feed(?:\s[^>]*)?>[\s\S]*?<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i
  );
  if (feedMatch) {
    return decodeXmlEntities(feedMatch[1]);
  }
  return "";
}
__name(extractChannelTitle, "extractChannelTitle");
async function safeFetchRss(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    RSS_TIMEOUT_MS
  );
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const xml = await response.text();
    if (!xml || !xml.trim()) {
      throw new Error("Empty RSS response");
    }
    const items = extractItems(xml);
    const channelTitle = options.sourceName || extractChannelTitle(xml) || "";
    if (channelTitle) {
      for (const item of items) {
        if (!item.source) {
          item.source = channelTitle;
        }
      }
    }
    return { items, title: channelTitle };
  } finally {
    clearTimeout(timeout);
  }
}
__name(safeFetchRss, "safeFetchRss");

// src/cloudflare/news/cleanNews.js
init_modules_watch_stub();
function cleanArticle(article, source) {
  return {
    title: article.title?.trim() || "",
    source: source.name,
    category: source.category,
    publishedAt: article.pubDate || article.isoDate || null,
    link: article.link || "",
    content: article.contentSnippet?.trim() || article.content?.trim() || ""
  };
}
__name(cleanArticle, "cleanArticle");

// src/cloudflare/news/fetchNews.js
async function fetchNews(env, options = {}) {
  const config = getConfig(env);
  const maxSources = options.maxSources ?? config.maxRssSourcesPerRun;
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
__name(fetchNews, "fetchNews");

// src/cloudflare/news/processNews.js
init_modules_watch_stub();
var dedupeMod = __toESM(require_deduplicate(), 1);
var relevanceMod = __toESM(require_relevance(), 1);
var clusterMod = __toESM(require_eventCluster(), 1);
var noveltyMod = __toESM(require_novelty(), 1);
var canonicalMod = __toESM(require_canonicalEvent(), 1);
var sourceQualityMod = __toESM(require_sourceQuality(), 1);
var impactScoreMod = __toESM(require_impactScore(), 1);
var marketTagsMod = __toESM(require_marketTags(), 1);
var assetMappingMod = __toESM(require_assetMapping(), 1);
var directionMod = __toESM(require_direction(), 1);
var confidenceMod = __toESM(require_confidence(), 1);
var impactExplanationMod = __toESM(require_impactExplanation(), 1);
var timeframeMod = __toESM(require_timeframe(), 1);
var eventTypeMod = __toESM(require_eventType(), 1);
var evidenceConfidenceMod = __toESM(require_evidenceConfidence(), 1);
var priorityMod = __toESM(require_priority(), 1);
function pickExport4(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }
  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }
  if (typeof mod?.default === "function" && name === "default") {
    return mod.default;
  }
  throw new Error(
    `Unable to resolve export "${name}" from news transform module`
  );
}
__name(pickExport4, "pickExport");
var deduplicateArticles = pickExport4(dedupeMod, "deduplicateArticles");
var filterRelevantArticles = pickExport4(
  relevanceMod,
  "filterRelevantArticles"
);
var clusterArticles = pickExport4(clusterMod, "clusterArticles");
var addNovelty = pickExport4(noveltyMod, "addNovelty");
var createCanonicalEvent = pickExport4(
  canonicalMod,
  "createCanonicalEvent"
);
var addSourceQuality = pickExport4(sourceQualityMod, "addSourceQuality");
var addImpactScore = pickExport4(impactScoreMod, "addImpactScore");
var addMarketTags = pickExport4(marketTagsMod, "addMarketTags");
var addAssetMapping = pickExport4(assetMappingMod, "addAssetMapping");
var addDirection = pickExport4(directionMod, "addDirection");
var addConfidence = pickExport4(confidenceMod, "addConfidence");
var addImpactExplanation = pickExport4(
  impactExplanationMod,
  "addImpactExplanation"
);
var addTimeframe = pickExport4(timeframeMod, "addTimeframe");
var addEventType = pickExport4(eventTypeMod, "addEventType");
var addEvidenceConfidence = pickExport4(
  evidenceConfidenceMod,
  "addEvidenceConfidence"
);
var addPriority = pickExport4(priorityMod, "addPriority");
function processNews(articles) {
  const uniqueArticles = deduplicateArticles(articles);
  const relevantArticles = filterRelevantArticles(uniqueArticles);
  const clusters = clusterArticles(relevantArticles);
  const clustersWithNovelty = addNovelty(clusters);
  let events = clustersWithNovelty.map((cluster) => createCanonicalEvent(cluster)).filter(Boolean);
  events = addSourceQuality(events);
  events = addImpactScore(events);
  events = addMarketTags(events);
  events = addAssetMapping(events);
  events = addDirection(events);
  events = addConfidence(events);
  events = addImpactExplanation(events);
  events = addTimeframe(events);
  events = addEventType(events);
  events = addEvidenceConfidence(events);
  events = addPriority(events);
  return events;
}
__name(processNews, "processNews");

// src/cloudflare/news/runProcessNews.js
async function runProcessNews(env, options = {}) {
  const articles = await fetchNews(env, options);
  return processNews(articles);
}
__name(runProcessNews, "runProcessNews");

// src/cloudflare/jobs/analyzeEvent.js
init_modules_watch_stub();
var evidenceMod = __toESM(require_evidenceCheck(), 1);
var finalMod = __toESM(require_finalAnalysis(), 1);

// src/cloudflare/ai/aiFilter.js
init_modules_watch_stub();
function shouldUseAI(article) {
  if (article.priorityScore >= 7) {
    return true;
  }
  if (article.priorityLevel === "CRITICAL") {
    return true;
  }
  return false;
}
__name(shouldUseAI, "shouldUseAI");

// src/cloudflare/ai/aiRouter.js
init_modules_watch_stub();

// src/cloudflare/ai/geminiProvider.js
init_modules_watch_stub();

// src/cloudflare/ai/analysisPrompt.js
init_modules_watch_stub();
function buildAnalysisPrompt(article) {
  return `
    You are the market intelligence engine for Midnight Society.
    
    Analyze the following news event.
    
    NEWS TITLE:
    ${article.title}

    ARTICLE CONTENT:
    ${article.content || "No article content available."}
    
    SOURCE:
    ${article.source}
    
    MARKETS:
    ${(article.marketTags || []).join(", ")}
    
    AFFECTED ASSETS:
    ${(article.affectedAssets || []).join(", ")}
    
    RULE-BASED EVENT TYPES:
    ${(article.eventTypes || []).join(", ")}

    RULE-BASED TIMEFRAME:
    ${article.timeframe}

    RULE-BASED IMPACT:
    ${article.impactLevel}

    RULE-BASED DIRECTION:
    ${article.direction}
    
    Return ONLY valid JSON.
    
    Use exactly this structure:
    
    {
    "summary": "",
    "whyItMatters": "",

    "classification": {
        "direction": "BULLISH | BEARISH | NEUTRAL",
        "magnitude": "HIGH | MEDIUM | LOW",
        "eventType": "GEOPOLITICAL | MACRO | REGULATION | ETF | EARNINGS | SUPPLY_SHOCK | LEADERSHIP_CHANGE | CORPORATE_ACTION | OTHER",
        "timeframe": "IMMEDIATE | SHORT_TERM | MEDIUM_TERM"
    },

    "bullishFactors": [],
    "bearishFactors": [],
    "risks": [],
    "whatToWatch": [],

    "analysisType": "FACT | INTERPRETATION",
    "confidence": "HIGH | MEDIUM | LOW"
    }
    
    Rules:
    
    - Do not invent facts.
    - Do not invent statistics, prices, companies, people, events, or relationships.
    - Only treat information explicitly provided in the input as fact.
    - If something is an inference, label it as interpretation.
    - Do not give personalized financial advice.
    - Do not claim certainty about future market movements.
    - Keep the analysis concise.
    - Treat the rule-based classification only as an initial guess.
    - You may disagree with the rule-based direction, event type, timeframe, or impact level.
    - Classify the event based on the actual meaning of the news, not isolated keywords.
    - Identify what the event is actually about.
    - Do not classify an event as GEOPOLITICAL unless the article is genuinely about geopolitical developments.
    - Do not classify an event as IMMEDIATE merely because the headline contains words such as "cuts", "rises", or "falls".
    - CORPORATE_ACTION should be used for events such as share issuance, share cancellation, buybacks, compensation changes, dilution changes, capital structure changes, or similar company actions.
    - Magnitude describes the likely market importance of this specific event, not how important the company is.
    - Confidence describes how confident you are in your classification based on the available evidence.
    `;
}
__name(buildAnalysisPrompt, "buildAnalysisPrompt");
function parseJsonResponse(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response");
  }
  const cleanedText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleanedText);
}
__name(parseJsonResponse, "parseJsonResponse");

// src/cloudflare/ai/validateAnalysis.js
init_modules_watch_stub();
var DIRECTIONS = [
  "BULLISH",
  "BEARISH",
  "NEUTRAL"
];
var MAGNITUDES = [
  "HIGH",
  "MEDIUM",
  "LOW"
];
var EVENT_TYPES = [
  "GEOPOLITICAL",
  "MACRO",
  "REGULATION",
  "ETF",
  "EARNINGS",
  "SUPPLY_SHOCK",
  "LEADERSHIP_CHANGE",
  "CORPORATE_ACTION",
  "OTHER"
];
var TIMEFRAMES = [
  "IMMEDIATE",
  "SHORT_TERM",
  "MEDIUM_TERM"
];
var CONFIDENCES = [
  "HIGH",
  "MEDIUM",
  "LOW"
];
var ANALYSIS_TYPES = [
  "FACT",
  "INTERPRETATION"
];
function validateAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") {
    return {
      valid: false,
      reason: "Analysis is missing or not an object"
    };
  }
  if (typeof analysis.summary !== "string" || !analysis.summary.trim()) {
    return {
      valid: false,
      reason: "Missing summary"
    };
  }
  if (typeof analysis.whyItMatters !== "string" || !analysis.whyItMatters.trim()) {
    return {
      valid: false,
      reason: "Missing whyItMatters"
    };
  }
  const classification = analysis.classification;
  if (!classification || typeof classification !== "object") {
    return {
      valid: false,
      reason: "Missing classification"
    };
  }
  if (!DIRECTIONS.includes(classification.direction)) {
    return {
      valid: false,
      reason: "Invalid direction"
    };
  }
  if (!MAGNITUDES.includes(classification.magnitude)) {
    return {
      valid: false,
      reason: "Invalid magnitude"
    };
  }
  if (!EVENT_TYPES.includes(classification.eventType)) {
    return {
      valid: false,
      reason: "Invalid eventType"
    };
  }
  if (!TIMEFRAMES.includes(classification.timeframe)) {
    return {
      valid: false,
      reason: "Invalid timeframe"
    };
  }
  if (!CONFIDENCES.includes(analysis.confidence)) {
    return {
      valid: false,
      reason: "Invalid confidence"
    };
  }
  if (!ANALYSIS_TYPES.includes(analysis.analysisType)) {
    return {
      valid: false,
      reason: "Invalid analysisType"
    };
  }
  const arrayFields = [
    "bullishFactors",
    "bearishFactors",
    "risks",
    "whatToWatch"
  ];
  for (const field of arrayFields) {
    if (!Array.isArray(analysis[field])) {
      return {
        valid: false,
        reason: `${field} must be an array`
      };
    }
  }
  return {
    valid: true
  };
}
__name(validateAnalysis, "validateAnalysis");

// src/cloudflare/ai/geminiProvider.js
function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }
  return parts.map(
    (part) => typeof part?.text === "string" ? part.text : ""
  ).join("").trim();
}
__name(extractGeminiText, "extractGeminiText");
async function analyzeWithGemini(env, article) {
  const config = getConfig(env);
  const apiKey = config.googleApiKey;
  const model = config.geminiModel;
  if (!apiKey) {
    const error = new Error("Gemini API key not configured");
    error.status = 401;
    throw error;
  }
  const prompt = buildAnalysisPrompt(article);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });
  } catch (error) {
    const networkError = new Error(
      `Gemini network error: ${error.message}`
    );
    networkError.status = 503;
    throw networkError;
  }
  const retryAfter = response.headers.get("retry-after");
  const rawText = await response.text();
  if (!response.ok) {
    let details = rawText;
    try {
      details = JSON.parse(rawText)?.error?.message || rawText;
    } catch (_error) {
    }
    const error = new Error(
      `Gemini HTTP ${response.status}: ${details}`
    );
    error.status = response.status;
    if (retryAfter) {
      error.retryAfter = retryAfter;
    }
    throw error;
  }
  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from Gemini: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }
  const text = extractGeminiText(payload);
  let analysis;
  try {
    analysis = parseJsonResponse(text);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from Gemini: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }
  const validation = validateAnalysis(analysis);
  if (!validation.valid) {
    const validationError = new Error(
      `Invalid response from Gemini: ${validation.reason}`
    );
    validationError.status = 502;
    throw validationError;
  }
  return analysis;
}
__name(analyzeWithGemini, "analyzeWithGemini");

// src/cloudflare/ai/groqProvider.js
init_modules_watch_stub();
var GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
async function analyzeWithGroq(env, article) {
  const config = getConfig(env);
  const apiKey = config.groqApiKey;
  const model = config.groqModel;
  if (!apiKey) {
    const error = new Error("Groq API key not configured");
    error.status = 401;
    throw error;
  }
  const prompt = buildAnalysisPrompt(article);
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: "You are Midnight Society's market intelligence engine. Return only valid JSON matching the requested schema."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });
  const retryAfter = response.headers.get("retry-after");
  const rawText = await response.text();
  if (!response.ok) {
    let details = rawText;
    try {
      details = JSON.parse(rawText)?.error?.message || rawText;
    } catch (_error) {
    }
    const error = new Error(
      `Groq HTTP ${response.status}: ${details}`
    );
    error.status = response.status;
    if (retryAfter) {
      error.retryAfter = retryAfter;
    }
    throw error;
  }
  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from Groq: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }
  const content = payload?.choices?.[0]?.message?.content;
  let analysis;
  try {
    analysis = parseJsonResponse(content);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from Groq: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }
  const validation = validateAnalysis(analysis);
  if (!validation.valid) {
    const validationError = new Error(
      `Invalid response from Groq: ${validation.reason}`
    );
    validationError.status = 502;
    throw validationError;
  }
  return analysis;
}
__name(analyzeWithGroq, "analyzeWithGroq");

// src/cloudflare/ai/openrouterProvider.js
init_modules_watch_stub();
var OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
async function analyzeWithOpenRouter(env, article) {
  const config = getConfig(env);
  const apiKey = config.openRouterApiKey;
  const model = config.openRouterModel;
  if (!apiKey) {
    const error = new Error(
      "OpenRouter API key not configured"
    );
    error.status = 401;
    throw error;
  }
  const prompt = buildAnalysisPrompt(article);
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": config.openRouterSiteUrl,
      "X-Title": config.openRouterAppName
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are Midnight Society's market intelligence engine. Return only valid JSON matching the requested schema."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });
  const retryAfter = response.headers.get("retry-after");
  const rawText = await response.text();
  if (!response.ok) {
    let details = rawText;
    try {
      details = JSON.parse(rawText)?.error?.message || rawText;
    } catch (_error) {
    }
    const error = new Error(
      `OpenRouter HTTP ${response.status}: ${details}`
    );
    error.status = response.status;
    if (retryAfter) {
      error.retryAfter = retryAfter;
    }
    throw error;
  }
  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from OpenRouter: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }
  const usageCost = Number(
    payload?.usage?.cost ?? payload?.usage?.total_cost ?? 0
  );
  if (Number.isFinite(usageCost) && usageCost > 0) {
    const paidError = new Error(
      "OpenRouter returned a paid model response \u2014 rejecting to keep free-first policy"
    );
    paidError.status = 402;
    throw paidError;
  }
  const content = payload?.choices?.[0]?.message?.content;
  let analysis;
  try {
    analysis = parseJsonResponse(content);
  } catch (error) {
    const parseError = new Error(
      `Invalid response from OpenRouter: ${error.message}`
    );
    parseError.status = 502;
    throw parseError;
  }
  const validation = validateAnalysis(analysis);
  if (!validation.valid) {
    const validationError = new Error(
      `Invalid response from OpenRouter: ${validation.reason}`
    );
    validationError.status = 502;
    throw validationError;
  }
  return analysis;
}
__name(analyzeWithOpenRouter, "analyzeWithOpenRouter");

// src/cloudflare/ai/ruleFallback.js
init_modules_watch_stub();
function mapMagnitude(impactLevel) {
  if (impactLevel === "CRITICAL" || impactLevel === "HIGH") {
    return "HIGH";
  }
  if (impactLevel === "MEDIUM") {
    return "MEDIUM";
  }
  return "LOW";
}
__name(mapMagnitude, "mapMagnitude");
function createRuleFallback(article) {
  return {
    summary: article.title || "",
    whyItMatters: article.impactExplanation || "This event may affect the related market or asset.",
    classification: {
      direction: article.direction || "NEUTRAL",
      magnitude: mapMagnitude(
        article.impactLevel || article.magnitude
      ),
      eventType: article.eventTypes?.[0] || article.eventType || "OTHER",
      timeframe: article.timeframe || "MEDIUM_TERM"
    },
    bullishFactors: article.direction === "BULLISH" ? [
      "Rule-based analysis indicates a positive market bias."
    ] : [],
    bearishFactors: article.direction === "BEARISH" ? [
      "Rule-based analysis indicates a negative market bias."
    ] : [],
    risks: [
      "Rule-based fallback has limited context and may miss important factors."
    ],
    whatToWatch: article.affectedAssets || [],
    analysisType: "INTERPRETATION",
    confidence: "LOW"
  };
}
__name(createRuleFallback, "createRuleFallback");

// src/cloudflare/ai/providerError.js
init_modules_watch_stub();
var ERROR_TYPES = {
  RATE_LIMIT: "RATE_LIMIT",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  AUTH_ERROR: "AUTH_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",
  SERVER_ERROR: "SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  INVALID_RESPONSE: "INVALID_RESPONSE",
  MISSING_API_KEY: "MISSING_API_KEY",
  UNKNOWN: "UNKNOWN"
};
function classifyProviderError(error) {
  const status = error?.status || error?.statusCode || error?.httpStatus || null;
  const message = String(
    error?.message || error || ""
  ).toLowerCase();
  if (message.includes("api key not configured") || message.includes("missing") && message.includes("api key")) {
    return {
      type: ERROR_TYPES.MISSING_API_KEY,
      retryable: false,
      cooldown: true,
      retryAfterMs: null
    };
  }
  if (status === 429 || message.includes("rate limit") || message.includes("too many requests") || message.includes("resource_exhausted") || message.includes("resource exhausted")) {
    const retryAfterMs = parseRetryAfterMs(error);
    return {
      type: ERROR_TYPES.RATE_LIMIT,
      retryable: false,
      cooldown: true,
      retryAfterMs
    };
  }
  if (message.includes("quota") || message.includes("billing") || message.includes("exceeded your current quota")) {
    return {
      type: ERROR_TYPES.QUOTA_EXCEEDED,
      retryable: false,
      cooldown: true,
      retryAfterMs: parseRetryAfterMs(error) || 60 * 60 * 1e3
    };
  }
  if (status === 401 || status === 403 || message.includes("unauthorized") || message.includes("forbidden") || message.includes("invalid api key") || message.includes("authentication")) {
    return {
      type: ERROR_TYPES.AUTH_ERROR,
      retryable: false,
      cooldown: true,
      retryAfterMs: 30 * 60 * 1e3
    };
  }
  if (status === 400 || message.includes("invalid request") || message.includes("bad request")) {
    return {
      type: ERROR_TYPES.INVALID_REQUEST,
      retryable: false,
      cooldown: false,
      retryAfterMs: null
    };
  }
  if (message.includes("invalid response") || message.includes("empty ai response") || message.includes("json") || message.includes("validation") || message.includes("missing summary") || message.includes("invalid direction") || message.includes("invalid magnitude") || message.includes("invalid eventtype") || message.includes("invalid timeframe") || message.includes("invalid confidence")) {
    return {
      type: ERROR_TYPES.INVALID_RESPONSE,
      retryable: false,
      cooldown: false,
      retryAfterMs: null
    };
  }
  if (status >= 500 || message.includes("internal server") || message.includes("service unavailable") || message.includes("bad gateway")) {
    return {
      type: ERROR_TYPES.SERVER_ERROR,
      retryable: true,
      cooldown: true,
      retryAfterMs: parseRetryAfterMs(error) || 60 * 1e3
    };
  }
  if (message.includes("fetch failed") || message.includes("network") || message.includes("econnreset") || message.includes("etimedout") || message.includes("abort") || message.includes("timeout")) {
    return {
      type: ERROR_TYPES.NETWORK_ERROR,
      retryable: true,
      cooldown: true,
      retryAfterMs: 30 * 1e3
    };
  }
  return {
    type: ERROR_TYPES.UNKNOWN,
    retryable: false,
    cooldown: true,
    retryAfterMs: 60 * 1e3
  };
}
__name(classifyProviderError, "classifyProviderError");
function parseRetryAfterMs(error) {
  const header = error?.retryAfter || error?.headers?.["retry-after"] || error?.response?.headers?.["retry-after"];
  if (header === void 0 || header === null) {
    return null;
  }
  const asNumber = Number(header);
  if (Number.isFinite(asNumber)) {
    return asNumber * 1e3;
  }
  const asDate = new Date(header).getTime();
  if (Number.isFinite(asDate)) {
    return Math.max(0, asDate - Date.now());
  }
  return null;
}
__name(parseRetryAfterMs, "parseRetryAfterMs");

// src/cloudflare/d1/providerStateRepository.js
init_modules_watch_stub();
init_client();
var DEFAULT_COOLDOWN_MS = 5 * 60 * 1e3;
function mapRow(row) {
  if (!row) {
    return {
      status: "AVAILABLE",
      failureCount: 0,
      cooldownUntil: 0,
      lastErrorType: null
    };
  }
  return {
    status: row.status,
    failureCount: row.failure_count || 0,
    cooldownUntil: row.cooldown_until ? new Date(row.cooldown_until).getTime() : 0,
    lastErrorType: row.last_error_type || null
  };
}
__name(mapRow, "mapRow");
async function getProviderState(env, provider) {
  const row = await dbGet(
    env,
    `
      SELECT *
      FROM ai_provider_state
      WHERE provider = ?
      LIMIT 1
    `,
    provider
  );
  return mapRow(row);
}
__name(getProviderState, "getProviderState");
async function isProviderAvailable(env, provider) {
  const state = await getProviderState(env, provider);
  if (state.status === "COOLDOWN" && Date.now() >= state.cooldownUntil) {
    await markProviderSuccess(env, provider);
    return true;
  }
  return state.status === "AVAILABLE";
}
__name(isProviderAvailable, "isProviderAvailable");
async function markProviderSuccess(env, provider) {
  await dbRun(
    env,
    `
      INSERT INTO ai_provider_state (
        provider,
        status,
        failure_count,
        cooldown_until,
        last_error_type,
        updated_at
      )
      VALUES (?, 'AVAILABLE', 0, NULL, NULL, ?)
      ON CONFLICT(provider) DO UPDATE SET
        status = 'AVAILABLE',
        failure_count = 0,
        cooldown_until = NULL,
        last_error_type = NULL,
        updated_at = excluded.updated_at
    `,
    provider,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
__name(markProviderSuccess, "markProviderSuccess");
async function markProviderCooldown(env, provider, options = {}) {
  const cooldownMs = options.cooldownMs || DEFAULT_COOLDOWN_MS;
  const cooldownUntil = new Date(Date.now() + cooldownMs).toISOString();
  const existing = await getProviderState(env, provider);
  const failureCount = (existing.failureCount || 0) + 1;
  await dbRun(
    env,
    `
      INSERT INTO ai_provider_state (
        provider,
        status,
        failure_count,
        cooldown_until,
        last_error_type,
        updated_at
      )
      VALUES (?, 'COOLDOWN', ?, ?, ?, ?)
      ON CONFLICT(provider) DO UPDATE SET
        status = 'COOLDOWN',
        failure_count = excluded.failure_count,
        cooldown_until = excluded.cooldown_until,
        last_error_type = excluded.last_error_type,
        updated_at = excluded.updated_at
    `,
    provider,
    failureCount,
    cooldownUntil,
    options.errorType || null,
    (/* @__PURE__ */ new Date()).toISOString()
  );
  return {
    status: "COOLDOWN",
    failureCount,
    cooldownUntil: Date.now() + cooldownMs,
    lastErrorType: options.errorType || null
  };
}
__name(markProviderCooldown, "markProviderCooldown");

// src/cloudflare/ai/aiRouter.js
var PROVIDERS = {
  GEMINI: {
    name: "GEMINI",
    analyze: analyzeWithGemini
  },
  GROQ: {
    name: "GROQ",
    analyze: analyzeWithGroq
  },
  OPENROUTER: {
    name: "OPENROUTER",
    analyze: analyzeWithOpenRouter
  }
};
var DEFAULT_ORDER = [
  "GEMINI",
  "GROQ",
  "OPENROUTER"
];
function getProviderOrder(env) {
  const config = getConfig(env);
  const configured = config.aiProviderOrder;
  if (!configured) {
    return [...DEFAULT_ORDER];
  }
  return configured.split(",").map((name) => name.trim().toUpperCase()).filter((name) => PROVIDERS[name]);
}
__name(getProviderOrder, "getProviderOrder");
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
__name(sleep, "sleep");
async function tryProvider(env, provider, article, maxRetries) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      logInfo("ai_router_attempt", { provider: provider.name });
      const analysis = await provider.analyze(env, article);
      await markProviderSuccess(env, provider.name);
      logInfo("ai_router_success", { provider: provider.name });
      return {
        provider: provider.name,
        status: "SUCCESS",
        analysis
      };
    } catch (error) {
      const classified = classifyProviderError(error);
      logError("ai_router_provider_error", {
        provider: provider.name,
        errorType: classified.type,
        message: error.message
      });
      if (classified.retryable && attempt < maxRetries) {
        attempt += 1;
        logWarn("ai_router_retry", {
          provider: provider.name,
          attempt,
          maxRetries
        });
        await sleep(500 * attempt);
        continue;
      }
      if (classified.cooldown) {
        const cooldownMs = classified.retryAfterMs || DEFAULT_COOLDOWN_MS;
        await markProviderCooldown(env, provider.name, {
          cooldownMs,
          errorType: classified.type
        });
        logWarn("ai_router_cooldown", {
          provider: provider.name,
          cooldownSeconds: Math.round(cooldownMs / 1e3)
        });
      }
      return {
        provider: provider.name,
        status: "FAILED",
        errorType: classified.type,
        error: error.message
      };
    }
  }
  return {
    provider: provider.name,
    status: "FAILED",
    errorType: "UNKNOWN",
    error: "Unexpected provider failure"
  };
}
__name(tryProvider, "tryProvider");
async function routeAI(env, article) {
  const config = getConfig(env);
  const order = getProviderOrder(env);
  const maxRetries = config.aiProviderMaxRetries;
  const attempts = [];
  for (const providerName of order) {
    const provider = PROVIDERS[providerName];
    if (!provider) {
      continue;
    }
    const available = await isProviderAvailable(env, providerName);
    if (!available) {
      logInfo("ai_router_skipped_cooldown", { provider: providerName });
      attempts.push({
        provider: providerName,
        status: "COOLDOWN"
      });
      continue;
    }
    const result = await tryProvider(
      env,
      provider,
      article,
      maxRetries
    );
    attempts.push(result);
    if (result.status === "SUCCESS") {
      return {
        provider: result.provider,
        status: "SUCCESS",
        analysis: result.analysis,
        attempts
      };
    }
  }
  logWarn("ai_router_rule_fallback", {});
  const fallback = createRuleFallback(article);
  return {
    provider: "RULE_FALLBACK",
    status: "FALLBACK",
    analysis: fallback,
    attempts
  };
}
__name(routeAI, "routeAI");

// src/cloudflare/jobs/analyzeEvent.js
init_eventRepository();
function pickExport5(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }
  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }
  throw new Error(`Missing export ${name}`);
}
__name(pickExport5, "pickExport");
var checkEvidence = pickExport5(evidenceMod, "checkEvidence");
var buildFinalAnalysis = pickExport5(finalMod, "buildFinalAnalysis");
async function savePredictionIfNeeded(env, eventId, finalAnalysis) {
  if (await predictionExists(env, eventId)) {
    return { saved: false, reason: "ALREADY_EXISTS" };
  }
  await savePrediction(env, eventId, finalAnalysis);
  return { saved: true, reason: "CREATED" };
}
__name(savePredictionIfNeeded, "savePredictionIfNeeded");
async function analyzeEvent(env, event, options = {}) {
  let aiAnalysis;
  let provider;
  if (!shouldUseAI(event)) {
    aiAnalysis = createRuleFallback(event);
    provider = "RULE_FALLBACK";
  } else if (options.skipAi) {
    aiAnalysis = createRuleFallback(event);
    provider = "RULE_FALLBACK";
  } else {
    const aiResult = await routeAI(env, event);
    aiAnalysis = aiResult.analysis;
    provider = aiResult.provider;
  }
  const evidenceCheck = checkEvidence(event, aiAnalysis, provider);
  const finalAnalysis = buildFinalAnalysis(event, aiAnalysis, evidenceCheck);
  await updateEventFinalAnalysis(env, event.eventId, finalAnalysis);
  const predictionResult = await savePredictionIfNeeded(
    env,
    event.eventId,
    finalAnalysis
  );
  logInfo("EVENT_ANALYZED", {
    eventId: event.eventId,
    provider,
    prediction: predictionResult.reason
  });
  return {
    success: true,
    provider,
    finalAnalysis,
    predictionResult
  };
}
__name(analyzeEvent, "analyzeEvent");

// src/cloudflare/jobs/publishJob.js
init_modules_watch_stub();

// src/cloudflare/telegram/preferenceDelivery.js
init_modules_watch_stub();

// src/cloudflare/d1/subscriberRepository.js
init_modules_watch_stub();
init_client();
var PREFERENCES = {
  STOCKS: "stocks",
  CRYPTO: "crypto",
  COMMODITIES: "commodities",
  ALL: "all"
};
function isValidPreference(value) {
  return Object.values(PREFERENCES).includes(String(value || "").toLowerCase());
}
__name(isValidPreference, "isValidPreference");
async function upsertSubscriber(env, user) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await getSubscriber(env, user.telegramUserId);
  if (existing) {
    await dbRun(
      env,
      `
        UPDATE subscriber_preferences
        SET
          username = ?,
          first_name = ?,
          updated_at = ?
        WHERE telegram_user_id = ?
      `,
      user.username || null,
      user.firstName || null,
      now,
      String(user.telegramUserId)
    );
    return getSubscriber(env, user.telegramUserId);
  }
  await dbRun(
    env,
    `
      INSERT INTO subscriber_preferences (
        telegram_user_id,
        username,
        first_name,
        preference,
        welcome_sent_at,
        preference_set_at,
        updated_at,
        created_at
      )
      VALUES (?, ?, ?, 'all', NULL, NULL, ?, ?)
    `,
    String(user.telegramUserId),
    user.username || null,
    user.firstName || null,
    now,
    now
  );
  return getSubscriber(env, user.telegramUserId);
}
__name(upsertSubscriber, "upsertSubscriber");
async function getSubscriber(env, telegramUserId) {
  return dbGet(
    env,
    `
      SELECT *
      FROM subscriber_preferences
      WHERE telegram_user_id = ?
      LIMIT 1
    `,
    String(telegramUserId)
  );
}
__name(getSubscriber, "getSubscriber");
async function markWelcomeSent(env, telegramUserId) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await dbRun(
    env,
    `
      UPDATE subscriber_preferences
      SET welcome_sent_at = ?, updated_at = ?
      WHERE telegram_user_id = ?
    `,
    now,
    now,
    String(telegramUserId)
  );
}
__name(markWelcomeSent, "markWelcomeSent");
async function setPreference(env, telegramUserId, preference) {
  if (!isValidPreference(preference)) {
    throw new Error("Invalid market preference");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const normalized = String(preference).toLowerCase();
  await upsertSubscriber(env, { telegramUserId });
  await dbRun(
    env,
    `
      UPDATE subscriber_preferences
      SET
        preference = ?,
        preference_set_at = ?,
        updated_at = ?
      WHERE telegram_user_id = ?
    `,
    normalized,
    now,
    now,
    String(telegramUserId)
  );
  return getSubscriber(env, telegramUserId);
}
__name(setPreference, "setPreference");
async function listAllSubscribers(env, options = {}) {
  const limit = Number(options.limit || 200);
  return dbAll(
    env,
    `
      SELECT *
      FROM subscriber_preferences
      WHERE preference_set_at IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT ?
    `,
    limit
  );
}
__name(listAllSubscribers, "listAllSubscribers");

// src/cloudflare/telegram/welcome.js
init_modules_watch_stub();
function buildWelcomeMessage(firstName) {
  const name = firstName ? String(firstName).trim() : "";
  const greeting = name ? `Welcome, ${escapeHtml(name)}.` : "Welcome.";
  return `${greeting}

You didn\u2019t just join another feed.
You stepped into a room where only the moves that matter make it through.

<b>Midnight Society</b> is built for people who want signal over noise \u2014 the kind of clarity that makes you feel ahead, not overwhelmed.

You\u2019re in the right place.`;
}
__name(buildWelcomeMessage, "buildWelcomeMessage");
function buildPreferencePromptMessage() {
  return `One last step \u2014 make this yours.

Which market should we watch for you?
You\u2019ll only get major alerts for what you choose.`;
}
__name(buildPreferencePromptMessage, "buildPreferencePromptMessage");
function buildPreferenceSavedMessage(preference) {
  const labels = {
    [PREFERENCES.STOCKS]: "Stock market",
    [PREFERENCES.CRYPTO]: "Crypto",
    [PREFERENCES.COMMODITIES]: "Commodities",
    [PREFERENCES.ALL]: "All markets"
  };
  const label = labels[preference] || preference;
  return `Locked in: <b>${escapeHtml(label)}</b>.

From here, Midnight Society will focus your alerts on that lane.
You can change this anytime with /markets.`;
}
__name(buildPreferenceSavedMessage, "buildPreferenceSavedMessage");
function buildMarketPreferenceKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "\u{1F4C8} Stock market", callback_data: "pref:stocks" },
        { text: "\u20BF Crypto", callback_data: "pref:crypto" }
      ],
      [
        { text: "\u{1F6E2} Commodities", callback_data: "pref:commodities" },
        { text: "\u{1F310} All", callback_data: "pref:all" }
      ]
    ]
  };
}
__name(buildMarketPreferenceKeyboard, "buildMarketPreferenceKeyboard");
function getEventMarketBuckets(event) {
  const tags = (event?.marketTags || []).map(
    (tag) => String(tag).toLowerCase()
  );
  const buckets = /* @__PURE__ */ new Set();
  if (tags.some(
    (tag) => [
      "stockmarket",
      "usstocks",
      "indiastocks",
      "europestocks",
      "macro",
      "bonds",
      "globalmarkets"
    ].includes(tag)
  )) {
    buckets.add(PREFERENCES.STOCKS);
  }
  if (tags.some((tag) => ["crypto", "cryptomarket"].includes(tag))) {
    buckets.add(PREFERENCES.CRYPTO);
  }
  if (tags.some(
    (tag) => ["oil", "energy", "gold", "copper", "commoditiesmarket"].includes(tag)
  )) {
    buckets.add(PREFERENCES.COMMODITIES);
  }
  if (buckets.size === 0) {
    const title = String(event?.title || "").toLowerCase();
    if (/bitcoin|ethereum|crypto|btc|eth|solana|stablecoin/.test(title)) {
      buckets.add(PREFERENCES.CRYPTO);
    } else if (/oil|brent|wti|opec|gold|silver|copper|natural gas|lng/.test(title)) {
      buckets.add(PREFERENCES.COMMODITIES);
    } else {
      buckets.add(PREFERENCES.STOCKS);
    }
  }
  return [...buckets];
}
__name(getEventMarketBuckets, "getEventMarketBuckets");
function preferenceMatchesEvent(preference, event) {
  const pref = String(preference || PREFERENCES.ALL).toLowerCase();
  if (pref === PREFERENCES.ALL) {
    return true;
  }
  const buckets = getEventMarketBuckets(event);
  return buckets.includes(pref);
}
__name(preferenceMatchesEvent, "preferenceMatchesEvent");
function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
__name(escapeHtml, "escapeHtml");

// src/cloudflare/telegram/preferenceDelivery.js
async function deliverToMatchingSubscribers(env, event, message, options = {}) {
  const subscribers = await listAllSubscribers(env, {
    limit: options.limit || 200
  });
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const subscriber of subscribers) {
    if (!preferenceMatchesEvent(subscriber.preference, event)) {
      skipped += 1;
      continue;
    }
    try {
      await publishTelegramMessage(env, message, {
        chatId: subscriber.telegram_user_id
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      logWarn("SUBSCRIBER_DM_FAILED", {
        telegramUserId: subscriber.telegram_user_id,
        reason: String(error.message || error)
      });
    }
  }
  logInfo("SUBSCRIBER_DM_DELIVERY", { sent, skipped, failed });
  return { sent, skipped, failed };
}
__name(deliverToMatchingSubscribers, "deliverToMatchingSubscribers");

// src/cloudflare/jobs/publishJob.js
function pickExport6(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }
  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }
  return null;
}
__name(pickExport6, "pickExport");
async function loadBuilders() {
  const decision = await Promise.resolve().then(() => __toESM(require_publishDecision(), 1));
  const eligibility = await Promise.resolve().then(() => __toESM(require_publishEligibility(), 1));
  const postBuilder = await Promise.resolve().then(() => __toESM(require_postBuilder(), 1));
  return {
    shouldPublish: pickExport6(decision, "shouldPublish"),
    isFreshEvent: pickExport6(eligibility, "isFreshEvent"),
    buildTelegramPost: pickExport6(postBuilder, "buildTelegramPost")
  };
}
__name(loadBuilders, "loadBuilders");
async function getPacingStatus(env) {
  const config = getConfig(env);
  const gapMs = Math.max(1, config.telegramMinMinutesBetweenPosts) * 60 * 1e3;
  const latestPublishedAt = await getLatestPublishedAt(env);
  if (!latestPublishedAt) {
    return { allowed: true, waitMs: 0, latestPublishedAt: null };
  }
  const lastTime = new Date(latestPublishedAt).getTime();
  if (!Number.isFinite(lastTime)) {
    return { allowed: true, waitMs: 0, latestPublishedAt };
  }
  const elapsed = Date.now() - lastTime;
  if (elapsed >= gapMs) {
    return { allowed: true, waitMs: 0, latestPublishedAt };
  }
  return {
    allowed: false,
    waitMs: gapMs - elapsed,
    latestPublishedAt
  };
}
__name(getPacingStatus, "getPacingStatus");
async function publishEvent(env, event, options = {}) {
  const eventId = event.eventId;
  if (await isPublished(env, eventId)) {
    return { published: false, reason: "ALREADY_PUBLISHED" };
  }
  const { shouldPublish, isFreshEvent, buildTelegramPost } = await loadBuilders();
  if (!isFreshEvent(event)) {
    return { published: false, reason: "EVENT_TOO_OLD" };
  }
  if (!shouldPublish(event)) {
    return { published: false, reason: "NOT_ELIGIBLE" };
  }
  const pacing = await getPacingStatus(env);
  if (!pacing.allowed) {
    return {
      published: false,
      reason: "PACING_COOLDOWN",
      waitMs: pacing.waitMs
    };
  }
  const message = buildTelegramPost(event);
  if (!message) {
    return { published: false, reason: "EMPTY_MESSAGE" };
  }
  if (!event.title) {
    return { published: false, reason: "MISSING_TITLE" };
  }
  if (options.disableTelegram) {
    logWarn("TELEGRAM_PUBLISH_DISABLED", { eventId });
    return { published: false, reason: "TELEGRAM_DISABLED" };
  }
  const result = await publishAndRecordPost(env, eventId, message, {
    chatId: options.chatId
  });
  let dmResult = { sent: 0, skipped: 0, failed: 0 };
  try {
    dmResult = await deliverToMatchingSubscribers(env, event, message);
  } catch (error) {
    logWarn("PREFERENCE_DM_BATCH_FAILED", {
      eventId,
      reason: String(error.message || error)
    });
  }
  logInfo("TELEGRAM_SUCCESS", {
    eventId,
    messageId: result.telegramMessageId,
    dmSent: dmResult.sent
  });
  return {
    ...result,
    dmResult
  };
}
__name(publishEvent, "publishEvent");
async function runPublishJob(env, options = {}) {
  const { getAllEvents: getAllEvents2 } = await Promise.resolve().then(() => (init_eventRepository(), eventRepository_exports));
  const config = getConfig(env);
  const events = await getAllEvents2(env);
  const maxPosts = Math.max(1, config.telegramMaxPostsPerJob);
  let published = 0;
  logInfo("JOB_START", { job: "publish" });
  const ranked = [...events].sort(
    (a, b) => Number(b.priorityScore || 0) - Number(a.priorityScore || 0)
  );
  for (const event of ranked) {
    if (published >= maxPosts) {
      break;
    }
    try {
      const result = await publishEvent(env, event, options);
      if (result.published) {
        published += 1;
      }
      if (result.reason === "PACING_COOLDOWN") {
        break;
      }
    } catch (error) {
      logWarn("PUBLISH_EVENT_FAILED", {
        eventId: event.eventId,
        reason: String(error.message || error)
      });
    }
  }
  logInfo("JOB_SUCCESS", { job: "publish", published });
  return { status: "SUCCESS", published };
}
__name(runPublishJob, "runPublishJob");

// src/cloudflare/jobs/newsJob.js
function sortByPublishPriority(events) {
  return [...events].sort((a, b) => {
    const scoreDiff = Number(b.priorityScore || 0) - Number(a.priorityScore || 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    const aTime = new Date(a.createdAt || a.publishedAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.publishedAt || 0).getTime();
    return bTime - aTime;
  });
}
__name(sortByPublishPriority, "sortByPublishPriority");
async function runNewsJob(env, options = {}) {
  const config = getConfig(env);
  const maxNew = options.maxNewEvents || config.maxNewEventsPerRun;
  const maxAi = options.maxAiCalls || config.maxAiCallsPerRun;
  const maxPosts = options.maxPosts || config.telegramMaxPostsPerJob;
  logInfo("JOB_START", { job: "news" });
  try {
    const events = await runProcessNews(env, options);
    logInfo("NEWS_PROCESSED", { events: events.length });
    const newEvents = [];
    for (const event of events) {
      if (newEvents.length >= maxNew) {
        break;
      }
      if (event.link && await eventExistsByLink(env, event.link)) {
        continue;
      }
      newEvents.push(event);
    }
    logInfo("NEWS_NEW_EVENTS", { count: newEvents.length });
    const publishCandidates = [];
    let aiCalls = 0;
    for (const event of newEvents) {
      try {
        const marketEvent = await buildMarketEvent(env, event);
        await saveEvent(env, marketEvent);
        for (const snapshot of marketEvent.snapshots || []) {
          await saveSnapshot(env, marketEvent.eventId, snapshot);
        }
        const skipAi = aiCalls >= maxAi;
        const analysis = await analyzeEvent(env, marketEvent, { skipAi });
        if (!skipAi && analysis.provider !== "RULE_FALLBACK") {
          aiCalls += 1;
        }
        const saved = await getEvent(env, marketEvent.eventId);
        if (saved) {
          publishCandidates.push(saved);
        }
      } catch (error) {
        logError("NEWS_EVENT_FAILED", {
          title: event.title,
          reason: String(error.message || error)
        });
      }
    }
    const ranked = sortByPublishPriority(publishCandidates);
    let publishedCount = 0;
    for (const candidate of ranked) {
      if (publishedCount >= Math.max(1, maxPosts)) {
        break;
      }
      if (options.disableTelegram || options.dryRunPublish) {
        logWarn("TELEGRAM_PUBLISH_SKIPPED", {
          eventId: candidate.eventId,
          mode: options.dryRunPublish ? "dryRun" : "disabled"
        });
        continue;
      }
      try {
        const publishResult = await publishEvent(env, candidate, options);
        if (publishResult.published) {
          publishedCount += 1;
        }
        if (publishResult.reason === "PACING_COOLDOWN") {
          break;
        }
      } catch (error) {
        logError("TELEGRAM_PUBLISH_FAILED", {
          eventId: candidate.eventId,
          reason: String(error.message || error)
        });
      }
    }
    logInfo("JOB_SUCCESS", {
      job: "news",
      newEvents: newEvents.length,
      published: publishedCount,
      aiCalls
    });
    return {
      status: "SUCCESS",
      newEvents: newEvents.length,
      published: publishedCount,
      aiCalls
    };
  } catch (error) {
    logError("JOB_FAILURE", {
      job: "news",
      reason: String(error.message || error)
    });
    return {
      status: "ERROR",
      reason: String(error.message || error)
    };
  }
}
__name(runNewsJob, "runNewsJob");

// src/cloudflare/jobs/performanceJob.js
init_modules_watch_stub();
var calcMod = __toESM(require_performanceCalculator(), 1);

// src/cloudflare/d1/performanceRepository.js
init_modules_watch_stub();
init_client();
async function getPerformanceRows(env, options = {}) {
  const limit = Number(options.limit || 500);
  return dbAll(
    env,
    `
      SELECT
        eva.event_id,
        eva.symbol,
        eva.horizon,
        eva.expected,
        eva.actual,
        eva.percentage_change,
        eva.threshold,
        eva.result,
        ep.event_type,
        ep.confidence,
        ep.predicted_at
      FROM expected_vs_actual eva
      JOIN event_predictions ep
        ON eva.event_id = ep.event_id
      ORDER BY ep.predicted_at ASC
      LIMIT ?
    `,
    limit
  );
}
__name(getPerformanceRows, "getPerformanceRows");

// src/cloudflare/jobs/performanceJob.js
function pickExport7(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }
  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }
  throw new Error(`Missing export ${name}`);
}
__name(pickExport7, "pickExport");
async function runPerformanceJob(env) {
  logInfo("JOB_START", { job: "performance" });
  try {
    const rows = await getPerformanceRows(env, { limit: 500 });
    const calculatePerformance = pickExport7(calcMod, "calculatePerformance");
    const calculatePerformanceByGroup = pickExport7(
      calcMod,
      "calculatePerformanceByGroup"
    );
    const calculatePerformanceByAssetAndHorizon = pickExport7(
      calcMod,
      "calculatePerformanceByAssetAndHorizon"
    );
    const calculateRollingPerformance = pickExport7(
      calcMod,
      "calculateRollingPerformance"
    );
    const report = {
      overall: calculatePerformance(rows),
      byAsset: calculatePerformanceByGroup(rows, "symbol"),
      byEventType: calculatePerformanceByGroup(rows, "event_type"),
      byConfidence: calculatePerformanceByGroup(rows, "confidence"),
      byAssetAndHorizon: calculatePerformanceByAssetAndHorizon(rows),
      rolling: calculateRollingPerformance(rows),
      rowCount: rows.length
    };
    logInfo("JOB_SUCCESS", {
      job: "performance",
      rows: rows.length,
      overallAccuracy: report.overall?.accuracy
    });
    return { status: "SUCCESS", report };
  } catch (error) {
    logError("JOB_FAILURE", {
      job: "performance",
      reason: String(error.message || error)
    });
    return { status: "ERROR", reason: String(error.message || error) };
  }
}
__name(runPerformanceJob, "runPerformanceJob");

// src/cloudflare/telegram/getMe.js
init_modules_watch_stub();
async function getTelegramMe(env, options = {}) {
  const token = requireEnvString(env, "TELEGRAM_BOT_TOKEN");
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const url = `https://api.telegram.org/bot${token}/getMe`;
  const response = await fetchImpl(url, { method: "GET" });
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (_error) {
    throw new Error(`Telegram getMe HTTP ${response.status}: invalid JSON`);
  }
  if (!response.ok || data.ok !== true) {
    throw new Error(
      `Telegram getMe HTTP ${response.status}: ${data.description || "failed"}`
    );
  }
  return {
    ok: true,
    botUsername: data.result?.username || null,
    botId: data.result?.id || null
  };
}
__name(getTelegramMe, "getTelegramMe");

// src/cloudflare/telegram/webhookHandler.js
init_modules_watch_stub();

// src/cloudflare/telegram/api.js
init_modules_watch_stub();
function requireToken(env) {
  const token = env?.TELEGRAM_BOT_TOKEN;
  if (!token || !String(token).trim()) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  return String(token);
}
__name(requireToken, "requireToken");
async function callTelegramApi(env, method, payload = {}, options = {}) {
  const token = requireToken(env);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (_error) {
    throw new Error(`Telegram API HTTP ${response.status}: invalid JSON`);
  }
  if (!response.ok || data.ok !== true) {
    const description = data?.description || "Telegram request failed";
    const error = new Error(`Telegram API HTTP ${response.status}: ${description}`);
    error.status = response.status;
    error.telegramDescription = description;
    throw error;
  }
  return data.result;
}
__name(callTelegramApi, "callTelegramApi");

// src/cloudflare/telegram/webhookHandler.js
function isJoinToMember(oldStatus, newStatus) {
  const previouslyNotMember = ["left", "kicked", "restricted"].includes(
    String(oldStatus || "")
  ) || !oldStatus;
  const nowMember = ["member", "administrator", "creator", "restricted"].includes(
    String(newStatus || "")
  );
  return previouslyNotMember && nowMember && newStatus !== "left";
}
__name(isJoinToMember, "isJoinToMember");
async function sendWelcomeFlow(env, user, options = {}) {
  const telegramUserId = user.id;
  await upsertSubscriber(env, {
    telegramUserId,
    username: user.username,
    firstName: user.first_name
  });
  const existing = await getSubscriber(env, telegramUserId);
  const force = Boolean(options.force);
  if (existing?.welcome_sent_at && !force) {
    if (!existing.preference_set_at) {
      await callTelegramApi(env, "sendMessage", {
        chat_id: telegramUserId,
        text: buildPreferencePromptMessage(),
        parse_mode: "HTML",
        reply_markup: buildMarketPreferenceKeyboard(),
        link_preview_options: { is_disabled: true }
      });
    }
    return { status: "ALREADY_WELCOMED" };
  }
  await callTelegramApi(env, "sendMessage", {
    chat_id: telegramUserId,
    text: buildWelcomeMessage(user.first_name),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true }
  });
  await callTelegramApi(env, "sendMessage", {
    chat_id: telegramUserId,
    text: buildPreferencePromptMessage(),
    parse_mode: "HTML",
    reply_markup: buildMarketPreferenceKeyboard(),
    link_preview_options: { is_disabled: true }
  });
  await markWelcomeSent(env, telegramUserId);
  logInfo("WELCOME_SENT", { telegramUserId: String(telegramUserId) });
  return { status: "WELCOME_SENT" };
}
__name(sendWelcomeFlow, "sendWelcomeFlow");
async function handleStartCommand(env, message) {
  const user = message.from;
  if (!user?.id) {
    return { status: "IGNORED" };
  }
  try {
    return await sendWelcomeFlow(env, user, { force: true });
  } catch (error) {
    logWarn("WELCOME_SEND_FAILED", {
      telegramUserId: String(user.id),
      reason: String(error.message || error)
    });
    return { status: "FAILED", reason: String(error.message || error) };
  }
}
__name(handleStartCommand, "handleStartCommand");
async function handleMarketsCommand(env, message) {
  const user = message.from;
  if (!user?.id) {
    return { status: "IGNORED" };
  }
  await upsertSubscriber(env, {
    telegramUserId: user.id,
    username: user.username,
    firstName: user.first_name
  });
  await callTelegramApi(env, "sendMessage", {
    chat_id: user.id,
    text: buildPreferencePromptMessage(),
    parse_mode: "HTML",
    reply_markup: buildMarketPreferenceKeyboard(),
    link_preview_options: { is_disabled: true }
  });
  return { status: "PREFERENCE_PROMPT_SENT" };
}
__name(handleMarketsCommand, "handleMarketsCommand");
async function handleCallbackQuery(env, callbackQuery) {
  const data = String(callbackQuery.data || "");
  const user = callbackQuery.from;
  if (!user?.id || !data.startsWith("pref:")) {
    return { status: "IGNORED" };
  }
  const preference = data.slice("pref:".length).toLowerCase();
  const allowed = Object.values(PREFERENCES);
  if (!allowed.includes(preference)) {
    await callTelegramApi(env, "answerCallbackQuery", {
      callback_query_id: callbackQuery.id,
      text: "Invalid choice",
      show_alert: false
    });
    return { status: "INVALID_PREFERENCE" };
  }
  await setPreference(env, user.id, preference);
  await callTelegramApi(env, "answerCallbackQuery", {
    callback_query_id: callbackQuery.id,
    text: "Preference saved",
    show_alert: false
  });
  await callTelegramApi(env, "sendMessage", {
    chat_id: user.id,
    text: buildPreferenceSavedMessage(preference),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true }
  });
  if (callbackQuery.message?.chat?.id && callbackQuery.message?.message_id) {
    try {
      await callTelegramApi(env, "editMessageReplyMarkup", {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        reply_markup: { inline_keyboard: [] }
      });
    } catch (_error) {
    }
  }
  logInfo("PREFERENCE_SAVED", {
    telegramUserId: String(user.id),
    preference
  });
  return { status: "PREFERENCE_SAVED", preference };
}
__name(handleCallbackQuery, "handleCallbackQuery");
function channelMatchesConfigured(env, chat) {
  const configured = String(env.TELEGRAM_CHANNEL_ID || "").trim();
  if (!configured) {
    return true;
  }
  const chatId = String(chat?.id || "");
  const username = String(chat?.username || "").trim();
  const withAt = username ? `@${username}` : "";
  const configuredBare = configured.replace(/^@/, "");
  return configured === chatId || configured === withAt || configured === username || configuredBare === username;
}
__name(channelMatchesConfigured, "channelMatchesConfigured");
async function handleChatMemberJoin(env, chatMemberUpdate) {
  const newMember = chatMemberUpdate.new_chat_member;
  const oldMember = chatMemberUpdate.old_chat_member;
  const user = newMember?.user;
  if (!user?.id || user.is_bot) {
    return { status: "IGNORED" };
  }
  if (!channelMatchesConfigured(env, chatMemberUpdate.chat)) {
    return { status: "IGNORED_OTHER_CHAT" };
  }
  if (!isJoinToMember(oldMember?.status, newMember?.status)) {
    return { status: "IGNORED_NOT_JOIN" };
  }
  try {
    return await sendWelcomeFlow(env, user, { force: false });
  } catch (error) {
    logWarn("JOIN_WELCOME_REQUIRES_START", {
      telegramUserId: String(user.id),
      reason: String(error.message || error)
    });
    return {
      status: "NEEDS_USER_START",
      reason: String(error.message || error)
    };
  }
}
__name(handleChatMemberJoin, "handleChatMemberJoin");
async function handleTelegramUpdate(env, update) {
  try {
    if (update?.callback_query) {
      return await handleCallbackQuery(env, update.callback_query);
    }
    if (update?.message?.text) {
      const text = String(update.message.text).trim();
      if (text === "/start" || text.startsWith("/start ")) {
        return await handleStartCommand(env, update.message);
      }
      if (text === "/markets" || text.startsWith("/markets ")) {
        return await handleMarketsCommand(env, update.message);
      }
    }
    if (update?.chat_member) {
      return await handleChatMemberJoin(env, update.chat_member);
    }
    return { status: "IGNORED" };
  } catch (error) {
    logError("TELEGRAM_UPDATE_FAILED", {
      reason: String(error.message || error),
      updateType: Object.keys(update || {}).join(",")
    });
    return {
      status: "ERROR",
      reason: String(error.message || error)
    };
  }
}
__name(handleTelegramUpdate, "handleTelegramUpdate");
async function verifyTelegramWebhookSecret(request, env) {
  const configured = env.TELEGRAM_WEBHOOK_SECRET;
  if (!configured) {
    return true;
  }
  const header = request.headers.get("x-telegram-bot-api-secret-token");
  return header === String(configured);
}
__name(verifyTelegramWebhookSecret, "verifyTelegramWebhookSecret");

// src/cloudflare/worker.js
function json(data, status = 200) {
  return Response.json(data, { status });
}
__name(json, "json");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return json({
        status: "SUCCESS",
        service: "midnight-society-worker"
      });
    }
    if (url.pathname === "/health/db") {
      try {
        const row = await dbGet(env, "SELECT 1 AS connected");
        return json({
          status: "SUCCESS",
          database: { connected: row?.connected ?? null }
        });
      } catch (error) {
        return json(
          {
            status: "ERROR",
            message: String(error.message || error)
          },
          500
        );
      }
    }
    if (url.pathname === "/health/telegram") {
      try {
        const me = await getTelegramMe(env);
        return json({
          status: "SUCCESS",
          telegram: {
            authenticated: true,
            botUsername: me.botUsername
          },
          testDestinationConfigured: hasDedicatedTelegramTestDestination(env)
        });
      } catch (error) {
        return json(
          {
            status: "ERROR",
            message: String(error.message || error)
          },
          500
        );
      }
    }
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      const allowed = await verifyTelegramWebhookSecret(request, env);
      if (!allowed) {
        return json({ status: "UNAUTHORIZED" }, 401);
      }
      let update;
      try {
        update = await request.json();
      } catch (_error) {
        return json({ status: "BAD_REQUEST" }, 400);
      }
      ctx.waitUntil(
        handleTelegramUpdate(env, update).catch((error) => {
          logError("WEBHOOK_ASYNC_FAILURE", {
            reason: String(error.message || error)
          });
        })
      );
      return json({ status: "OK" });
    }
    return new Response("Midnight Society Cloudflare Worker is running.", {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  },
  async scheduled(event, env, ctx) {
    const cron = event.cron || "";
    logInfo("CRON_TRIGGER", { cron });
    const allowProductionTelegram = getConfig(env).telegramTestChannelId || String(env.CF_ALLOW_PRODUCTION_TELEGRAM || "").toLowerCase() === "true";
    const telegramOptions = allowProductionTelegram ? {} : { disableTelegram: true };
    if (!allowProductionTelegram) {
      logWarn("TELEGRAM_SENDS_DISABLED", {
        reason: "no dedicated test destination / production send gate"
      });
    }
    ctx.waitUntil(
      (async () => {
        try {
          if (cron === "0,30 * * * *") {
            const minute = new Date(
              event.scheduledTime || Date.now()
            ).getUTCMinutes();
            if (minute < 15) {
              await runNewsJob(env, {
                ...telegramOptions,
                maxNewEvents: getConfig(env).maxNewEventsPerRun,
                maxAiCalls: getConfig(env).maxAiCallsPerRun
              });
            } else {
              await runMarketJob(env, telegramOptions);
            }
            return;
          }
          if (cron === "5,35 * * * *") {
            await runPublishJob(env, telegramOptions);
            return;
          }
          if (cron === "10,40 * * * *") {
            await runReactionJob(env, telegramOptions);
            return;
          }
          if (cron === "15,45 * * * *") {
            await runPerformanceJob(env);
            return;
          }
          if (cron === "15 3 * * *") {
            await runMaintenanceJob(env);
            return;
          }
          logWarn("CRON_UNMAPPED", { cron });
          await runNewsJob(env, {
            ...telegramOptions,
            dryRunPublish: true,
            disableTelegram: true
          });
        } catch (error) {
          logError("CRON_HANDLER_FAILURE", {
            cron,
            reason: String(error.message || error)
          });
        }
      })()
    );
  }
};

// C:/Users/shawn/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/shawn/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-S3WVfQ/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/shawn/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-S3WVfQ/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
