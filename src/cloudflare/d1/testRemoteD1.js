/**
 * Phase 5 — temporary remote preview D1 integration test.
 * Uses D1 repositories only. Cleans up all test rows.
 */
import { dbGet, dbRun } from "./client.js";
import {
  getEvent,
  saveEvent,
  updateEventFinalAnalysis
} from "./eventRepository.js";
import {
  getLatestSnapshot,
  saveOutcome,
  saveSnapshot
} from "./marketRepository.js";
import { outcomeExists } from "./outcomeRepository.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectFailure(label, fn) {
  try {
    await fn();
    throw new Error(`${label}: expected failure but succeeded`);
  } catch (error) {
    if (String(error.message || error).startsWith(`${label}:`)) {
      throw error;
    }

    return String(error.message || error);
  }
}

async function cleanupRemoteTest(env, eventId, link) {
  await dbRun(env, `DELETE FROM published_reactions WHERE event_id = ?`, eventId);
  await dbRun(env, `DELETE FROM published_posts WHERE event_id = ?`, eventId);
  await dbRun(env, `DELETE FROM market_reactions WHERE event_id = ?`, eventId);
  await dbRun(env, `DELETE FROM event_predictions WHERE event_id = ?`, eventId);
  await dbRun(env, `DELETE FROM expected_vs_actual WHERE event_id = ?`, eventId);
  await dbRun(env, `DELETE FROM outcomes WHERE event_id = ?`, eventId);
  await dbRun(env, `DELETE FROM snapshots WHERE event_id = ?`, eventId);
  await dbRun(env, `DELETE FROM events WHERE event_id = ?`, eventId);

  if (link) {
    await dbRun(env, `DELETE FROM events WHERE link = ?`, link);
  }
}

export async function runRemoteD1IntegrationTest(env) {
  const stamp = Date.now();
  const eventId = `cloudflare-remote-test-${stamp}`;
  const link = `https://example.invalid/cloudflare-remote-test-${stamp}`;
  const steps = {
    connect: "PENDING",
    insert: "PENDING",
    read: "PENDING",
    update: "PENDING",
    dependent_snapshot: "PENDING",
    dependent_outcome: "PENDING",
    nonexistent_lookup: "PENDING",
    duplicate_event_id: "PENDING",
    duplicate_link: "PENDING",
    foreign_key: "PENDING",
    cleanup: "PENDING"
  };

  await cleanupRemoteTest(env, eventId, link);

  try {
    const connected = await dbGet(env, "SELECT 1 AS connected");
    assert(connected?.connected === 1, "SELECT 1 failed");
    steps.connect = "PASS";

    await saveEvent(env, {
      eventId,
      title: "Cloudflare remote preview D1 test",
      source: "phase5-remote-test",
      link,
      publishedAt: new Date().toISOString(),
      marketTags: ["remote-test"],
      affectedAssets: ["BRENT"],
      direction: "NEUTRAL",
      magnitude: "LOW",
      eventType: "OTHER",
      timeframe: "SHORT_TERM",
      confidence: "LOW",
      priorityScore: 1,
      priorityLevel: "LOW"
    });
    steps.insert = "PASS";

    const inserted = await getEvent(env, eventId);
    assert(inserted?.eventId === eventId, "read after insert failed");
    assert(inserted.marketTags[0] === "remote-test", "JSON marketTags failed");
    steps.read = "PASS";

    await updateEventFinalAnalysis(env, eventId, {
      final: {
        direction: "UP",
        magnitude: "MEDIUM",
        eventType: "OTHER",
        timeframe: "SHORT_TERM",
        finalConfidence: "MEDIUM"
      }
    });
    const updated = await getEvent(env, eventId);
    assert(updated?.direction === "UP", "update direction failed");
    assert(updated?.magnitude === "MEDIUM", "update magnitude failed");
    steps.update = "PASS";

    await saveSnapshot(env, eventId, {
      symbol: "BRENT",
      price: 81.25,
      currency: "USD",
      timestamp: new Date().toISOString()
    });
    const snapshot = await getLatestSnapshot(env, eventId, "BRENT");
    assert(snapshot?.price === 81.25, "dependent snapshot failed");
    steps.dependent_snapshot = "PASS";

    await saveOutcome(env, eventId, {
      symbol: "BRENT",
      horizon: "1H",
      initialPrice: 81.25,
      laterPrice: 81.5,
      percentageChange: 0.31,
      direction: "UP",
      initialTimestamp: new Date().toISOString(),
      laterTimestamp: new Date().toISOString()
    });
    assert(
      (await outcomeExists(env, eventId, "BRENT", "1H")) === true,
      "dependent outcome failed"
    );
    steps.dependent_outcome = "PASS";

    const missing = await getEvent(env, `cloudflare-remote-missing-${stamp}`);
    assert(missing === null, "nonexistent lookup should return null");
    steps.nonexistent_lookup = "PASS";

    const dupIdError = await expectFailure("duplicate_event_id", () =>
      saveEvent(env, {
        eventId,
        title: "dup id",
        source: "phase5-remote-test",
        link: `${link}-dup-id`,
        marketTags: [],
        affectedAssets: []
      })
    );
    assert(dupIdError.length > 0, "duplicate event_id did not error");
    steps.duplicate_event_id = "PASS";

    const dupLinkError = await expectFailure("duplicate_link", () =>
      saveEvent(env, {
        eventId: `${eventId}-b`,
        title: "dup link",
        source: "phase5-remote-test",
        link,
        marketTags: [],
        affectedAssets: []
      })
    );
    assert(dupLinkError.length > 0, "duplicate link did not error");
    steps.duplicate_link = "PASS";

    const fkError = await expectFailure("foreign_key", () =>
      saveSnapshot(env, `missing-parent-${stamp}`, {
        symbol: "BRENT",
        price: 1,
        currency: "USD",
        timestamp: new Date().toISOString()
      })
    );
    assert(fkError.length > 0, "foreign key did not error");
    steps.foreign_key = "PASS";

    await cleanupRemoteTest(env, eventId, link);
    await cleanupRemoteTest(env, `${eventId}-b`, `${link}-dup-id`);

    const afterCleanup = await getEvent(env, eventId);
    assert(afterCleanup === null, "cleanup left parent event behind");
    const leftoverSnapshot = await getLatestSnapshot(env, eventId, "BRENT");
    assert(!leftoverSnapshot, "cleanup left snapshot behind");
    assert(
      (await outcomeExists(env, eventId, "BRENT", "1H")) === false,
      "cleanup left outcome behind"
    );
    steps.cleanup = "PASS";

    return {
      status: "SUCCESS",
      database: "PREVIEW",
      eventId,
      steps
    };
  } catch (error) {
    try {
      await cleanupRemoteTest(env, eventId, link);
      await cleanupRemoteTest(env, `${eventId}-b`, `${link}-dup-id`);
    } catch (_cleanupError) {
      // Preserve original failure.
    }

    return {
      status: "ERROR",
      database: "PREVIEW",
      eventId,
      steps,
      message: String(error.message || error)
    };
  }
}
