/**
 * Local D1 repository smoke/constraint tests.
 * Invoked from Worker route /test/d1-repositories against --local D1 only.
 */
import {
  eventExistsByLink,
  getEvent,
  getEventByLink,
  saveEvent
} from "./eventRepository.js";

import {
  getEventSnapshots,
  getLatestSnapshot,
  outcomeExists as marketOutcomeExists,
  saveOutcome as marketSaveOutcome,
  saveSnapshot
} from "./marketRepository.js";

import {
  getExpectedVsActual,
  outcomeExists,
  saveExpectedVsActual,
  saveOutcome
} from "./outcomeRepository.js";

import {
  getPrediction,
  predictionExists,
  savePrediction
} from "./predictionRepository.js";

import {
  getPublishedPost,
  isPublished,
  savePublishedPost
} from "./publishRepository.js";

import {
  isReactionPublished,
  savePublishedReaction
} from "./reactionPublishRepository.js";

import {
  getMarketReaction,
  reactionExists,
  saveMarketReaction
} from "./reactionRepository.js";

import { dbRun } from "./client.js";

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

async function cleanupTestRows(env, eventId, link) {
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

export async function runD1RepositoryTests(env) {
  const stamp = Date.now();
  const eventId = `cloudflare-d1-test-${stamp}`;
  const link = `https://example.invalid/cloudflare-d1-test-${stamp}`;
  const steps = [];

  await cleanupTestRows(env, eventId, link);

  try {
    await saveEvent(env, {
      eventId,
      title: "Cloudflare D1 repository test event",
      source: "phase4-test",
      link,
      publishedAt: new Date().toISOString(),
      marketTags: ["oil", "test"],
      affectedAssets: ["BRENT"],
      direction: "UP",
      magnitude: "MEDIUM",
      eventType: "OTHER",
      timeframe: "SHORT_TERM",
      confidence: "MEDIUM",
      priorityScore: 9,
      priorityLevel: "HIGH"
    });
    steps.push({ step: "insert_event", status: "PASS" });

    const loaded = await getEvent(env, eventId);
    assert(loaded, "event not found after insert");
    assert(loaded.eventId === eventId, "camelCase eventId mismatch");
    assert(loaded.marketTags[0] === "oil", "marketTags JSON parse failed");
    assert(loaded.affectedAssets[0] === "BRENT", "affectedAssets JSON parse failed");
    assert(loaded.publishedAt, "publishedAt missing");
    assert(loaded.createdAt, "createdAt missing");
    steps.push({ step: "read_event_camelCase", status: "PASS" });

    assert(await eventExistsByLink(env, link) === true, "eventExistsByLink failed");
    assert((await getEventByLink(env, link))?.eventId === eventId, "getEventByLink failed");
    steps.push({ step: "link_lookup", status: "PASS" });

    await saveSnapshot(env, eventId, {
      symbol: "BRENT",
      price: 80.5,
      currency: "USD",
      timestamp: new Date().toISOString()
    });
    const snapshot = await getLatestSnapshot(env, eventId, "BRENT");
    assert(snapshot?.price === 80.5, "snapshot price mismatch");
    assert(snapshot.event_id === eventId, "snapshot snake_case event_id missing");
    assert((await getEventSnapshots(env, eventId)).length === 1, "getEventSnapshots failed");
    steps.push({ step: "snapshot_roundtrip", status: "PASS" });

    await saveOutcome(env, {
      eventId,
      symbol: "BRENT",
      horizon: "1H",
      initialPrice: 80.5,
      laterPrice: 81.2,
      percentageChange: 0.87,
      direction: "UP",
      initialTimestamp: new Date().toISOString(),
      laterTimestamp: new Date().toISOString()
    });
    assert(await outcomeExists(env, eventId, "BRENT", "1H") === true, "outcomeExists failed");
    assert(
      (await marketOutcomeExists(env, eventId, "BRENT", "1H")) === true,
      "market outcomeExists failed"
    );
    steps.push({ step: "outcome_roundtrip", status: "PASS" });

    await saveExpectedVsActual(
      env,
      eventId,
      {
        symbol: "BRENT",
        expected: "UP",
        actual: "UP",
        percentageChange: 0.87,
        threshold: 0.3,
        result: "CONFIRMED"
      },
      "1H"
    );
    const eva = await getExpectedVsActual(env, eventId, "BRENT", "1H");
    assert(eva?.result === "CONFIRMED", "expected_vs_actual read failed");
    steps.push({ step: "expected_vs_actual_roundtrip", status: "PASS" });

    await savePrediction(env, eventId, {
      final: {
        direction: "UP",
        magnitude: "MEDIUM",
        eventType: "OTHER",
        timeframe: "SHORT_TERM",
        finalConfidence: "MEDIUM"
      }
    });
    assert(await predictionExists(env, eventId) === true, "predictionExists failed");
    const prediction = await getPrediction(env, eventId);
    assert(prediction?.direction === "UP", "prediction read failed");
    assert(prediction.event_id === eventId, "prediction snake_case event_id missing");
    steps.push({ step: "prediction_roundtrip", status: "PASS" });

    await saveMarketReaction(env, {
      eventId,
      horizon: "1H",
      expectedDirection: "UP",
      totalAssets: 1,
      confirmed: 1,
      divergences: 0,
      neutral: 0,
      overall: "CONFIRMED"
    });
    assert(await reactionExists(env, eventId, "1H") === true, "reactionExists failed");
    const reaction = await getMarketReaction(env, eventId, "1H");
    assert(reaction?.overall === "CONFIRMED", "reaction overall mismatch");
    assert(reaction.confirmingAssets.includes("BRENT"), "confirmingAssets mapping failed");
    steps.push({ step: "reaction_roundtrip", status: "PASS" });

    await savePublishedPost(env, eventId, 1001);
    assert(await isPublished(env, eventId) === true, "isPublished failed");
    assert((await getPublishedPost(env, eventId))?.telegram_message_id === 1001, "published post read failed");
    steps.push({ step: "published_post_roundtrip", status: "PASS" });

    const duplicatePostError = await expectFailure("duplicate published_posts", () =>
      savePublishedPost(env, eventId, 1002)
    );
    assert(duplicatePostError.length > 0, "duplicate published_posts did not error");
    steps.push({
      step: "published_post_duplicate_detection",
      status: "PASS",
      error: duplicatePostError
    });

    await savePublishedReaction(env, eventId, "1H", 2001);
    assert(
      (await isReactionPublished(env, eventId, "1H")) === true,
      "isReactionPublished failed"
    );
    const duplicateReactionError = await expectFailure("duplicate published_reactions", () =>
      savePublishedReaction(env, eventId, "1H", 2002)
    );
    assert(duplicateReactionError.length > 0, "duplicate published_reactions did not error");
    steps.push({
      step: "published_reaction_duplicate_detection",
      status: "PASS",
      error: duplicateReactionError
    });

    const fkError = await expectFailure("foreign_key_snapshots", () =>
      saveSnapshot(env, `missing-event-${stamp}`, {
        symbol: "BRENT",
        price: 1,
        currency: "USD",
        timestamp: new Date().toISOString()
      })
    );
    steps.push({ step: "foreign_key_reject", status: "PASS", error: fkError });

    const uniqueEventIdError = await expectFailure("unique_event_id", () =>
      saveEvent(env, {
        eventId,
        title: "dup event id",
        source: "phase4-test",
        link: `${link}-other`,
        marketTags: [],
        affectedAssets: []
      })
    );
    steps.push({ step: "unique_event_id", status: "PASS", error: uniqueEventIdError });

    const uniqueLinkError = await expectFailure("unique_link", () =>
      saveEvent(env, {
        eventId: `${eventId}-b`,
        title: "dup link",
        source: "phase4-test",
        link,
        marketTags: [],
        affectedAssets: []
      })
    );
    steps.push({ step: "unique_link", status: "PASS", error: uniqueLinkError });

    const uniqueOutcomeError = await expectFailure("unique_outcomes", () =>
      saveOutcome(env, {
        eventId,
        symbol: "BRENT",
        horizon: "1H",
        initialPrice: 1,
        laterPrice: 2,
        percentageChange: 100,
        direction: "UP",
        initialTimestamp: new Date().toISOString(),
        laterTimestamp: new Date().toISOString()
      })
    );
    steps.push({ step: "unique_outcomes", status: "PASS", error: uniqueOutcomeError });

    const uniqueEvaError = await expectFailure("unique_expected_vs_actual", () =>
      saveExpectedVsActual(
        env,
        eventId,
        {
          symbol: "BRENT",
          expected: "UP",
          actual: "DOWN",
          percentageChange: -1,
          threshold: 0.3,
          result: "DIVERGENCE"
        },
        "1H"
      )
    );
    steps.push({
      step: "unique_expected_vs_actual",
      status: "PASS",
      error: uniqueEvaError
    });

    const uniquePredictionError = await expectFailure("unique_prediction", () =>
      savePrediction(env, eventId, {
        final: {
          direction: "DOWN",
          magnitude: "LOW",
          eventType: "OTHER",
          timeframe: "SHORT_TERM",
          finalConfidence: "LOW"
        }
      })
    );
    steps.push({
      step: "unique_event_predictions",
      status: "PASS",
      error: uniquePredictionError
    });

    const uniqueReactionError = await expectFailure("unique_market_reactions", () =>
      saveMarketReaction(env, {
        eventId,
        horizon: "1H",
        expectedDirection: "UP",
        totalAssets: 1,
        confirmed: 0,
        divergences: 1,
        neutral: 0,
        overall: "DIVERGENCE"
      })
    );
    steps.push({
      step: "unique_market_reactions",
      status: "PASS",
      error: uniqueReactionError
    });

    await saveEvent(env, {
      eventId: `${eventId}-nullable`,
      title: "nullable fields test",
      source: null,
      link: `${link}-nullable`,
      publishedAt: null,
      marketTags: [],
      affectedAssets: [],
      direction: null,
      magnitude: null,
      eventType: null,
      timeframe: null,
      confidence: null
    });
    const nullable = await getEvent(env, `${eventId}-nullable`);
    assert(Array.isArray(nullable.marketTags), "empty marketTags should parse to []");
    assert(Array.isArray(nullable.affectedAssets), "empty affectedAssets should parse to []");
    steps.push({ step: "null_optional_json_fields", status: "PASS" });

    // marketSaveOutcome shape (eventId, outcome) still works for second horizon
    await marketSaveOutcome(env, eventId, {
      symbol: "WTI",
      horizon: "1D",
      initialPrice: 70,
      laterPrice: 71,
      percentageChange: 1.4,
      direction: "UP",
      initialTimestamp: new Date().toISOString(),
      laterTimestamp: new Date().toISOString()
    });
    steps.push({ step: "market_saveOutcome_shape", status: "PASS" });

    return {
      status: "SUCCESS",
      eventId,
      steps
    };
  } finally {
    await cleanupTestRows(env, eventId, link);
    await cleanupTestRows(env, `${eventId}-nullable`, `${link}-nullable`);
    await cleanupTestRows(env, `${eventId}-b`, `${link}-other`);
  }
}
