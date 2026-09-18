/**
 * GitHub Actions job runner — news / market / publish / reaction / performance
 * against production D1 via REST (no Worker CPU). Webhook stays on Cloudflare.
 *
 * Usage:
 *   node src/cloudflare/gha/runJobs.mjs
 *   node src/cloudflare/gha/runJobs.mjs --jobs=news,publish
 */
import { createRemoteD1 } from "./remoteD1.js";
import { runNewsJob } from "../jobs/newsJob.js";
import { runMarketJob, runReactionJob } from "../jobs/marketJob.js";
import { runPublishJob } from "../jobs/publishJob.js";
import { runPerformanceJob } from "../jobs/performanceJob.js";
import { runMaintenanceJob } from "../jobs/maintenanceJob.js";

function required(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return String(value).trim();
}

function optional(name, fallback = "") {
  const value = process.env[name];
  if (value === undefined || value === null || !String(value).trim()) {
    return fallback;
  }
  return String(value).trim();
}

function parseJobs(argv) {
  const flag = argv.find((arg) => arg.startsWith("--jobs="));
  if (!flag) {
    // Default full cycle for a single GHA schedule
    return ["news", "market", "publish", "reaction", "performance"];
  }
  return flag
    .slice("--jobs=".length)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function buildEnv() {
  return {
    DB: createRemoteD1({
      accountId: required("CLOUDFLARE_ACCOUNT_ID"),
      databaseId: required("CLOUDFLARE_D1_DATABASE_ID"),
      apiToken: required("CLOUDFLARE_API_TOKEN")
    }),
    TELEGRAM_BOT_TOKEN: required("TELEGRAM_BOT_TOKEN"),
    TELEGRAM_CHANNEL_ID: required("TELEGRAM_CHANNEL_ID"),
    CF_ALLOW_PRODUCTION_TELEGRAM: optional(
      "CF_ALLOW_PRODUCTION_TELEGRAM",
      "true"
    ),
    TELEGRAM_MAX_POSTS_PER_JOB: optional("TELEGRAM_MAX_POSTS_PER_JOB", "1"),
    TELEGRAM_MIN_MINUTES_BETWEEN_POSTS: optional(
      "TELEGRAM_MIN_MINUTES_BETWEEN_POSTS",
      "10"
    ),
    GOOGLE_API_KEY: optional("GOOGLE_API_KEY"),
    GEMINI_API_KEY: optional("GEMINI_API_KEY"),
    GEMINI_MODEL: optional("GEMINI_MODEL", "gemini-2.0-flash"),
    GROQ_API_KEY: optional("GROQ_API_KEY"),
    GROQ_MODEL: optional("GROQ_MODEL", "llama-3.1-8b-instant"),
    OPENROUTER_API_KEY: optional("OPENROUTER_API_KEY"),
    OPENROUTER_MODEL: optional("OPENROUTER_MODEL", "openrouter/free"),
    OPENROUTER_SITE_URL: optional(
      "OPENROUTER_SITE_URL",
      "https://midnight-society.local"
    ),
    OPENROUTER_APP_NAME: optional("OPENROUTER_APP_NAME", "Midnight Society"),
    AI_PROVIDER_ORDER: optional(
      "AI_PROVIDER_ORDER",
      "GEMINI,GROQ,OPENROUTER"
    ),
    AI_PROVIDER_MAX_RETRIES: optional("AI_PROVIDER_MAX_RETRIES", "1"),
    CF_MAX_RSS_SOURCES: optional("CF_MAX_RSS_SOURCES", "24"),
    CF_MAX_NEW_EVENTS: optional("CF_MAX_NEW_EVENTS", "5"),
    CF_MAX_AI_CALLS: optional("CF_MAX_AI_CALLS", "3"),
    CF_MAX_MARKET_EVENTS: optional("CF_MAX_MARKET_EVENTS", "10"),
    CF_MAX_SYMBOLS_PER_EVENT: optional("CF_MAX_SYMBOLS_PER_EVENT", "4"),
    OILPRICEAPI_KEY: optional("OILPRICEAPI_KEY")
  };
}

async function main() {
  const jobs = parseJobs(process.argv.slice(2));
  const env = buildEnv();
  const telegramOptions = {};
  const summary = [];

  console.log(
    JSON.stringify({
      status: "START",
      jobs,
      allowTelegram: env.CF_ALLOW_PRODUCTION_TELEGRAM
    })
  );

  for (const job of jobs) {
    const started = Date.now();
    let result;

    try {
      if (job === "news") {
        result = await runNewsJob(env, {
          ...telegramOptions,
          maxNewEvents: Number(env.CF_MAX_NEW_EVENTS),
          maxAiCalls: Number(env.CF_MAX_AI_CALLS)
        });
      } else if (job === "market") {
        result = await runMarketJob(env, telegramOptions);
      } else if (job === "publish") {
        result = await runPublishJob(env, telegramOptions);
      } else if (job === "reaction") {
        result = await runReactionJob(env, telegramOptions);
      } else if (job === "performance") {
        result = await runPerformanceJob(env);
      } else if (job === "maintenance") {
        result = await runMaintenanceJob(env);
      } else {
        throw new Error(`Unknown job: ${job}`);
      }

      summary.push({
        job,
        status: result?.status || "SUCCESS",
        ms: Date.now() - started,
        result
      });
    } catch (error) {
      summary.push({
        job,
        status: "ERROR",
        ms: Date.now() - started,
        reason: String(error.message || error)
      });
      console.error(
        JSON.stringify({
          status: "JOB_ERROR",
          job,
          reason: String(error.message || error)
        })
      );
    }
  }

  const failed = summary.filter((item) => item.status === "ERROR");

  console.log(
    JSON.stringify({
      status: failed.length ? "PARTIAL_FAILURE" : "SUCCESS",
      summary
    })
  );

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      status: "FATAL",
      reason: String(error.message || error)
    })
  );
  process.exit(1);
});
