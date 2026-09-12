const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();


function isPublished(eventId) {

  const statement = db.prepare(`
    SELECT 1
    FROM published_posts
    WHERE event_id = ?
    LIMIT 1
  `);

  return Boolean(
    statement.get(eventId)
  );
}


function savePublishedPost(
  eventId,
  telegramMessageId
) {

  const statement = db.prepare(`
    INSERT INTO published_posts (
      event_id,
      telegram_message_id,
      published_at
    )
    VALUES (
      @event_id,
      @telegram_message_id,
      @published_at
    )
  `);

  statement.run({

    event_id:
      eventId,

    telegram_message_id:
      telegramMessageId,

    published_at:
      new Date().toISOString()

  });
}


function getPublishedPost(eventId) {

  const statement = db.prepare(`
    SELECT *
    FROM published_posts
    WHERE event_id = ?
    LIMIT 1
  `);

  return statement.get(eventId);
}


function getLatestPublishedAt() {

  const row = db.prepare(`
    SELECT published_at
    FROM published_posts
    ORDER BY published_at DESC
    LIMIT 1
  `).get();

  return row?.published_at || null;
}


module.exports = {
  isPublished,
  savePublishedPost,
  getPublishedPost,
  getLatestPublishedAt
};
