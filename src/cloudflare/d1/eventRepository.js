import { dbAll, dbGet, dbRun } from "./client.js";

function mapEventRow(row) {
  if (!row) {
    return null;
  }

  return {
    eventId: row.event_id,
    title: row.title,
    source: row.source,
    link: row.link,
    publishedAt: row.published_at,
    marketTags: JSON.parse(row.market_tags || "[]"),
    affectedAssets: JSON.parse(row.affected_assets || "[]"),
    direction: row.direction,
    magnitude: row.magnitude,
    eventType: row.event_type,
    timeframe: row.timeframe,
    confidence: row.confidence,
    priorityScore: row.priority_score,
    priorityLevel: row.priority_level,
    createdAt: row.created_at
  };
}

export async function saveEvent(env, event) {
  await dbRun(
    env,
    `
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    event.eventId,
    event.title,
    event.source,
    event.link || "",
    event.publishedAt || null,
    JSON.stringify(event.marketTags || []),
    JSON.stringify(event.affectedAssets || []),
    event.direction || "NEUTRAL",
    event.magnitude || "LOW",
    event.eventType || "OTHER",
    event.timeframe || "MEDIUM_TERM",
    event.confidence || "LOW",
    event.priorityScore || 0,
    event.priorityLevel || "LOW",
    new Date().toISOString()
  );
}

export async function getEvent(env, eventId) {
  const row = await dbGet(
    env,
    `
      SELECT *
      FROM events
      WHERE event_id = ?
    `,
    eventId
  );

  return mapEventRow(row);
}

export async function getAllEvents(env) {
  const rows = await dbAll(
    env,
    `
      SELECT *
      FROM events
      ORDER BY created_at DESC
    `
  );

  return rows.map(mapEventRow);
}

export async function eventExistsByLink(env, link) {
  if (!link) {
    return false;
  }

  const row = await dbGet(
    env,
    `
      SELECT 1 AS present
      FROM events
      WHERE link = ?
      LIMIT 1
    `,
    link
  );

  return Boolean(row);
}

export async function getEventByLink(env, link) {
  if (!link) {
    return null;
  }

  const row = await dbGet(
    env,
    `
      SELECT *
      FROM events
      WHERE link = ?
      LIMIT 1
    `,
    link
  );

  return mapEventRow(row);
}

export async function getEventsWithSnapshots(env) {
  const rows = await dbAll(
    env,
    `
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
    `
  );

  return rows.map((row) => ({
    eventId: row.event_id,
    title: row.title,
    direction: row.direction,
    marketTags: JSON.parse(row.market_tags || "[]"),
    affectedAssets: JSON.parse(row.affected_assets || "[]")
  }));
}

export async function updateEventFinalAnalysis(env, eventId, finalAnalysis) {
  await dbRun(
    env,
    `
      UPDATE events
      SET
        direction = ?,
        magnitude = ?,
        event_type = ?,
        timeframe = ?,
        confidence = ?
      WHERE event_id = ?
    `,
    finalAnalysis.final?.direction || "NEUTRAL",
    finalAnalysis.final?.magnitude || "LOW",
    finalAnalysis.final?.eventType || "OTHER",
    finalAnalysis.final?.timeframe || "MEDIUM_TERM",
    finalAnalysis.final?.finalConfidence || "LOW",
    eventId
  );
}
