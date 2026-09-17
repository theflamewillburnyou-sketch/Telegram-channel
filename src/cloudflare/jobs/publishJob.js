import { getConfig } from "../config.js";
import {
  getLatestPublishedAt,
  isPublished
} from "../d1/publishRepository.js";
import { logInfo, logWarn } from "../logger.js";
import { deliverToMatchingSubscribers } from "../telegram/preferenceDelivery.js";
import { publishAndRecordPost } from "../telegram/publishWithLedger.js";

function pickExport(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }

  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }

  return null;
}

async function loadBuilders() {
  const decision = await import("../../telegram/publishDecision.js");
  const eligibility = await import("../../telegram/publishEligibility.js");
  const postBuilder = await import("../../telegram/postBuilder.js");

  return {
    shouldPublish: pickExport(decision, "shouldPublish"),
    isFreshEvent: pickExport(eligibility, "isFreshEvent"),
    buildTelegramPost: pickExport(postBuilder, "buildTelegramPost")
  };
}

async function getPacingStatus(env) {
  const config = getConfig(env);
  const gapMs =
    Math.max(1, config.telegramMinMinutesBetweenPosts) * 60 * 1000;
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

/**
 * Publish one event via Cloudflare Telegram + D1 ledger.
 * Never writes published_posts unless Telegram succeeds.
 * Also DMs subscribers whose market preference matches.
 */
export async function publishEvent(env, event, options = {}) {
  const eventId = event.eventId;

  if (await isPublished(env, eventId)) {
    return { published: false, reason: "ALREADY_PUBLISHED" };
  }

  const { shouldPublish, isFreshEvent, buildTelegramPost } =
    await loadBuilders();

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

export async function runPublishJob(env, options = {}) {
  const { getAllEvents } = await import("../d1/eventRepository.js");
  const config = getConfig(env);
  const events = await getAllEvents(env);
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
