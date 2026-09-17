import { dbAll, dbGet, dbRun } from "./client.js";

export const PREFERENCES = {
  STOCKS: "stocks",
  CRYPTO: "crypto",
  COMMODITIES: "commodities",
  ALL: "all"
};

export function isValidPreference(value) {
  return Object.values(PREFERENCES).includes(String(value || "").toLowerCase());
}

export async function upsertSubscriber(env, user) {
  const now = new Date().toISOString();
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

export async function getSubscriber(env, telegramUserId) {
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

export async function markWelcomeSent(env, telegramUserId) {
  const now = new Date().toISOString();

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

export async function setPreference(env, telegramUserId, preference) {
  if (!isValidPreference(preference)) {
    throw new Error("Invalid market preference");
  }

  const now = new Date().toISOString();
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

export async function listSubscribersByPreference(env, preferences, options = {}) {
  const prefs = (preferences || []).map((item) => String(item).toLowerCase());
  const limit = Number(options.limit || 200);

  if (!prefs.length) {
    return [];
  }

  const placeholders = prefs.map(() => "?").join(", ");

  return dbAll(
    env,
    `
      SELECT *
      FROM subscriber_preferences
      WHERE preference IN (${placeholders})
      ORDER BY updated_at DESC
      LIMIT ?
    `,
    ...prefs,
    limit
  );
}

export async function listAllSubscribers(env, options = {}) {
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
