const {
  db,
  initializeDatabase
} = require("../database/database");

initializeDatabase();

const eventId = `reaction-test-${Date.now()}`;

const initialTimestamp =
  new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

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
    @created_at
  )
`);

statement.run({
  event_id: eventId,
  title: "TEST — Brent market reaction integration",
  source: "TEST",
  link: `https://example.com/${eventId}`,
  published_at: initialTimestamp,
  market_tags: JSON.stringify(["oil"]),
  affected_assets: JSON.stringify(["BRENT"]),
  direction: "BULLISH",
  magnitude: "HIGH",
  event_type: "SUPPLY_SHOCK",
  timeframe: "IMMEDIATE",
  confidence: "HIGH",
  created_at: new Date().toISOString()
});

const snapshotStatement = db.prepare(`
  INSERT INTO snapshots (
    event_id,
    symbol,
    price,
    currency,
    timestamp
  )
  VALUES (
    @event_id,
    @symbol,
    @price,
    @currency,
    @timestamp
  )
`);

snapshotStatement.run({
  event_id: eventId,
  symbol: "BRENT",
  price: 100,
  currency: "USD",
  timestamp: initialTimestamp
});

console.log("Test event created:");
console.log(eventId);

console.log("\nInitial snapshot:");
console.log({
  symbol: "BRENT",
  price: 100,
  timestamp: initialTimestamp
});
