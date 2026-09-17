/**
 * Cloudflare publish helpers: Telegram send THEN D1 ledger write.
 * Never writes published_* unless Telegram confirms success.
 */
import {
  isPublished,
  savePublishedPost
} from "../d1/publishRepository.js";

import {
  isReactionPublished,
  savePublishedReaction
} from "../d1/reactionPublishRepository.js";

import { publishTelegramMessage } from "./telegramPublisher.js";

/**
 * Send an event post, then record published_posts only on Telegram success.
 */
export async function publishAndRecordPost(
  env,
  eventId,
  message,
  options = {}
) {
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

/**
 * Send a reaction post, then record published_reactions only on Telegram success.
 */
export async function publishAndRecordReaction(
  env,
  eventId,
  horizon,
  message,
  options = {}
) {
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
