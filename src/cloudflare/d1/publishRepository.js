import { dbGet, dbRun } from "./client.js";

export async function isPublished(env, eventId) {
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

export async function savePublishedPost(env, eventId, telegramMessageId) {
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
    new Date().toISOString()
  );
}

export async function getPublishedPost(env, eventId) {
  return dbGet(
    env,
    `
      SELECT *
      FROM published_posts
      WHERE event_id = ?
      LIMIT 1
    `,
    eventId
  );
}

export async function getLatestPublishedAt(env) {
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
