import { callTelegramApi } from "./api.js";
import {
  getSubscriber,
  markWelcomeSent,
  PREFERENCES,
  setPreference,
  upsertSubscriber
} from "../d1/subscriberRepository.js";
import { logError, logInfo, logWarn } from "../logger.js";
import {
  buildMarketPreferenceKeyboard,
  buildPreferencePromptMessage,
  buildPreferenceSavedMessage,
  buildWelcomeMessage
} from "./welcome.js";

function extractUserFromUpdate(update) {
  if (update?.callback_query?.from) {
    return update.callback_query.from;
  }

  if (update?.message?.from) {
    return update.message.from;
  }

  if (update?.chat_member?.new_chat_member?.user) {
    return update.chat_member.new_chat_member.user;
  }

  return null;
}

function isJoinToMember(oldStatus, newStatus) {
  const previouslyNotMember = ["left", "kicked", "restricted"].includes(
    String(oldStatus || "")
  ) || !oldStatus;

  const nowMember = ["member", "administrator", "creator", "restricted"].includes(
    String(newStatus || "")
  );

  // restricted can mean limited member; treat as join when moving into member-like
  return previouslyNotMember && nowMember && newStatus !== "left";
}

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
    // Already welcomed — still offer preference if never set.
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

async function handleStartCommand(env, message) {
  const user = message.from;

  if (!user?.id) {
    return { status: "IGNORED" };
  }

  try {
    return await sendWelcomeFlow(env, user, { force: true });
  } catch (error) {
    // User may not have opened DM yet / blocked bot
    logWarn("WELCOME_SEND_FAILED", {
      telegramUserId: String(user.id),
      reason: String(error.message || error)
    });
    return { status: "FAILED", reason: String(error.message || error) };
  }
}

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

  // Remove buttons from the prompt message when possible
  if (callbackQuery.message?.chat?.id && callbackQuery.message?.message_id) {
    try {
      await callTelegramApi(env, "editMessageReplyMarkup", {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        reply_markup: { inline_keyboard: [] }
      });
    } catch (_error) {
      // Non-fatal
    }
  }

  logInfo("PREFERENCE_SAVED", {
    telegramUserId: String(user.id),
    preference
  });

  return { status: "PREFERENCE_SAVED", preference };
}

function channelMatchesConfigured(env, chat) {
  const configured = String(env.TELEGRAM_CHANNEL_ID || "").trim();

  if (!configured) {
    return true;
  }

  const chatId = String(chat?.id || "");
  const username = String(chat?.username || "").trim();
  const withAt = username ? `@${username}` : "";
  const configuredBare = configured.replace(/^@/, "");

  return (
    configured === chatId ||
    configured === withAt ||
    configured === username ||
    configuredBare === username
  );
}

async function handleChatMemberJoin(env, chatMemberUpdate) {
  const newMember = chatMemberUpdate.new_chat_member;
  const oldMember = chatMemberUpdate.old_chat_member;
  const user = newMember?.user;

  if (!user?.id || user.is_bot) {
    return { status: "IGNORED" };
  }

  // Only react to joins in the configured Midnight Society channel (when known)
  if (!channelMatchesConfigured(env, chatMemberUpdate.chat)) {
    return { status: "IGNORED_OTHER_CHAT" };
  }

  if (!isJoinToMember(oldMember?.status, newMember?.status)) {
    return { status: "IGNORED_NOT_JOIN" };
  }

  try {
    return await sendWelcomeFlow(env, user, { force: false });
  } catch (error) {
    // Common: bot cannot DM until user presses Start
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

/**
 * Process one Telegram Update object.
 */
export async function handleTelegramUpdate(env, update) {
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

export async function verifyTelegramWebhookSecret(request, env) {
  const configured = env.TELEGRAM_WEBHOOK_SECRET;

  if (!configured) {
    return true;
  }

  const header = request.headers.get("x-telegram-bot-api-secret-token");
  return header === String(configured);
}
