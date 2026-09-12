const {
  db,
  initializeDatabase
} = require("./database");

initializeDatabase();

function saveEvent(event) {
  const statement = db.prepare(`
    INSERT INTO events (
      event_id,
      title,
      source,
      link,
      published_at,
      market_tags,
      affected_assets,
      direction,
      magnitude,
      event_type,
      timeframe,
      confidence,
      priority_score,
      priority_level,
      created_at
    )
    VALUES (
      @event_id,
      @title,
      @source,
      @link,
      @published_at,
      @market_tags,
      @affected_assets,
      @direction,
      @magnitude,
      @event_type,
      @timeframe,
      @confidence,
      @priority_score,
      @priority_level,
      @created_at
    )
  `);

  statement.run({
    event_id: event.eventId,

    title: event.title,

    source: event.source,

    link:
      event.link || "",

    published_at:
      event.publishedAt || null,

    market_tags:
      JSON.stringify(
        event.marketTags || []
      ),

    affected_assets:
      JSON.stringify(
        event.affectedAssets || []
      ),

    direction:
      event.direction || "NEUTRAL",

    magnitude:
      event.magnitude || "LOW",

    event_type:
      event.eventType || "OTHER",

    timeframe:
      event.timeframe || "MEDIUM_TERM",

    confidence:
      event.confidence || "LOW",

    priority_score:
      event.priorityScore || 0,

    priority_level:
      event.priorityLevel || "LOW",

    created_at:
      new Date().toISOString()
  });
}

function mapEventRow(row) {
  if (!row) {
    return null;
  }

  return {
    eventId: row.event_id,

    title: row.title,

    source: row.source,

    link: row.link,

    publishedAt:
      row.published_at,

    marketTags:
      JSON.parse(
        row.market_tags || "[]"
      ),

    affectedAssets:
      JSON.parse(
        row.affected_assets || "[]"
      ),

    direction:
      row.direction,

    magnitude:
      row.magnitude,

    eventType:
      row.event_type,

    timeframe:
      row.timeframe,

    confidence:
      row.confidence,

    priorityScore:
      row.priority_score,

    priorityLevel:
      row.priority_level,

    createdAt:
      row.created_at
  };
}

function getEvent(eventId) {
  const statement = db.prepare(`
    SELECT *
    FROM events
    WHERE event_id = ?
  `);

  return mapEventRow(
    statement.get(eventId)
  );
}

function getAllEvents() {
  const statement = db.prepare(`
    SELECT *
    FROM events
    ORDER BY created_at DESC
  `);

  return statement
    .all()
    .map(mapEventRow);
}

function eventExistsByLink(link) {
  if (!link) {
    return false;
  }

  const statement = db.prepare(`
    SELECT 1
    FROM events
    WHERE link = ?
    LIMIT 1
  `);

  return Boolean(
    statement.get(link)
  );
}

function getEventByLink(link) {
  if (!link) {
    return null;
  }

  const statement = db.prepare(`
    SELECT *
    FROM events
    WHERE link = ?
    LIMIT 1
  `);

  return mapEventRow(
    statement.get(link)
  );
}

function getEventsWithSnapshots() {
  const statement = db.prepare(`
    SELECT DISTINCT
      e.event_id,
      e.title,
      e.direction,
      e.market_tags,
      e.affected_assets
    FROM events e
    INNER JOIN snapshots s
      ON e.event_id = s.event_id
    ORDER BY e.created_at ASC
  `);

  const rows = statement.all();

  return rows.map(row => ({
    eventId: row.event_id,
    title: row.title,
    direction: row.direction,

    marketTags:
      JSON.parse(row.market_tags || "[]"),

    affectedAssets:
      JSON.parse(row.affected_assets || "[]")
  }));
}

function updateEventFinalAnalysis(eventId, finalAnalysis) {
  const statement = db.prepare(`
    UPDATE events
    SET
      direction = @direction,
      magnitude = @magnitude,
      event_type = @event_type,
      timeframe = @timeframe,
      confidence = @confidence
    WHERE event_id = @event_id
  `);

  statement.run({
    event_id: eventId,

    direction:
      finalAnalysis.final?.direction ||
      "NEUTRAL",

    magnitude:
      finalAnalysis.final?.magnitude ||
      "LOW",

    event_type:
      finalAnalysis.final?.eventType ||
      "OTHER",

    timeframe:
      finalAnalysis.final?.timeframe ||
      "MEDIUM_TERM",

    confidence:
      finalAnalysis.final?.finalConfidence ||
      "LOW"
  });
}

module.exports = {
  saveEvent,
  getEvent,
  getAllEvents,
  eventExistsByLink,
  getEventByLink,
  getEventsWithSnapshots,
  updateEventFinalAnalysis
};
