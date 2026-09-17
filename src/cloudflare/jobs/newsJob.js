import { getConfig } from "../config.js";
import {
  eventExistsByLink,
  getEvent,
  saveEvent
} from "../d1/eventRepository.js";
import { saveSnapshot } from "../d1/marketRepository.js";
import { logError, logInfo, logWarn } from "../logger.js";
import { buildMarketEvent } from "../market/buildMarketEvent.js";
import { runProcessNews } from "../news/runProcessNews.js";
import { analyzeEvent } from "./analyzeEvent.js";
import { publishEvent } from "./publishJob.js";

function sortByPublishPriority(events) {
  return [...events].sort((a, b) => {
    const scoreDiff =
      Number(b.priorityScore || 0) - Number(a.priorityScore || 0);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const aTime = new Date(a.createdAt || a.publishedAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.publishedAt || 0).getTime();
    return bTime - aTime;
  });
}

/**
 * Cloudflare news job — bounded, async, D1-backed.
 * Does not register cron. Invoked from Worker scheduled().
 */
export async function runNewsJob(env, options = {}) {
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

      if (event.link && (await eventExistsByLink(env, event.link))) {
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
