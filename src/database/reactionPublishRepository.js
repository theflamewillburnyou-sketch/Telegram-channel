const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();


function isReactionPublished(
  eventId,
  horizon
) {

  const statement =
    db.prepare(`
      SELECT 1
      FROM published_reactions
      WHERE event_id = ?
        AND horizon = ?
      LIMIT 1
    `);

  return Boolean(
    statement.get(
      eventId,
      horizon
    )
  );
}


function savePublishedReaction(
  eventId,
  horizon,
  telegramMessageId
) {

  const statement =
    db.prepare(`
      INSERT INTO published_reactions (
        event_id,
        horizon,
        telegram_message_id,
        published_at
      )
      VALUES (
        @event_id,
        @horizon,
        @telegram_message_id,
        @published_at
      )
    `);

  statement.run({

    event_id:
      eventId,

    horizon:
      horizon,

    telegram_message_id:
      telegramMessageId,

    published_at:
      new Date().toISOString()

  });
}


module.exports = {
  isReactionPublished,
  savePublishedReaction
};
