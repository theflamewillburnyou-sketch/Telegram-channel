const {
  getLatestPublishedAt
} = require("../database/publishRepository");


/*
 * Human pacing:
 * one strong post at a time,
 * with breathing room between posts.
 */
const MIN_MINUTES_BETWEEN_POSTS =
  Number(
    process.env.TELEGRAM_MIN_MINUTES_BETWEEN_POSTS ||
    10
  );

const MAX_POSTS_PER_JOB =
  Number(
    process.env.TELEGRAM_MAX_POSTS_PER_JOB ||
    1
  );


function getMinGapMs() {
  return (
    Math.max(1, MIN_MINUTES_BETWEEN_POSTS) *
    60 *
    1000
  );
}


function getPacingStatus() {

  const latestPublishedAt =
    getLatestPublishedAt();

  if (!latestPublishedAt) {
    return {
      allowed: true,
      waitMs: 0,
      latestPublishedAt: null
    };
  }

  const lastTime =
    new Date(latestPublishedAt).getTime();

  if (!Number.isFinite(lastTime)) {
    return {
      allowed: true,
      waitMs: 0,
      latestPublishedAt
    };
  }

  const elapsed =
    Date.now() - lastTime;

  const gap =
    getMinGapMs();

  if (elapsed >= gap) {
    return {
      allowed: true,
      waitMs: 0,
      latestPublishedAt
    };
  }

  return {
    allowed: false,
    waitMs: gap - elapsed,
    latestPublishedAt
  };
}


function canPublishNow() {
  return getPacingStatus().allowed;
}


function sortByPublishPriority(events) {

  return [...events].sort((a, b) => {

    const scoreDiff =
      Number(b.priorityScore || 0) -
      Number(a.priorityScore || 0);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const aTime =
      new Date(
        a.createdAt || a.publishedAt || 0
      ).getTime();

    const bTime =
      new Date(
        b.createdAt || b.publishedAt || 0
      ).getTime();

    return bTime - aTime;
  });
}


module.exports = {
  MIN_MINUTES_BETWEEN_POSTS,
  MAX_POSTS_PER_JOB,
  getPacingStatus,
  canPublishNow,
  sortByPublishPriority
};
