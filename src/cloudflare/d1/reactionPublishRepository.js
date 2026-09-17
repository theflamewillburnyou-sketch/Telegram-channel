import { dbGet, dbRun } from "./client.js";

export async function isReactionPublished(env, eventId, horizon) {
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

export async function savePublishedReaction(
  env,
  eventId,
  horizon,
  telegramMessageId
) {
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
    new Date().toISOString()
  );
}
