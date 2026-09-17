import { listAllSubscribers } from "../d1/subscriberRepository.js";
import { logInfo, logWarn } from "../logger.js";
import { publishTelegramMessage } from "./telegramPublisher.js";
import { preferenceMatchesEvent } from "./welcome.js";

/**
 * Send personalized DMs to subscribers whose market preference matches the event.
 * Channel posting remains separate (publishJob).
 */
export async function deliverToMatchingSubscribers(env, event, message, options = {}) {
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
