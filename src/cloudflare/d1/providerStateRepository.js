import { dbGet, dbRun } from "./client.js";

export const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

function mapRow(row) {
  if (!row) {
    return {
      status: "AVAILABLE",
      failureCount: 0,
      cooldownUntil: 0,
      lastErrorType: null
    };
  }

  return {
    status: row.status,
    failureCount: row.failure_count || 0,
    cooldownUntil: row.cooldown_until
      ? new Date(row.cooldown_until).getTime()
      : 0,
    lastErrorType: row.last_error_type || null
  };
}

export async function getProviderState(env, provider) {
  const row = await dbGet(
    env,
    `
      SELECT *
      FROM ai_provider_state
      WHERE provider = ?
      LIMIT 1
    `,
    provider
  );

  return mapRow(row);
}

export async function isProviderAvailable(env, provider) {
  const state = await getProviderState(env, provider);

  if (state.status === "COOLDOWN" && Date.now() >= state.cooldownUntil) {
    await markProviderSuccess(env, provider);
    return true;
  }

  return state.status === "AVAILABLE";
}

export async function markProviderSuccess(env, provider) {
  await dbRun(
    env,
    `
      INSERT INTO ai_provider_state (
        provider,
        status,
        failure_count,
        cooldown_until,
        last_error_type,
        updated_at
      )
      VALUES (?, 'AVAILABLE', 0, NULL, NULL, ?)
      ON CONFLICT(provider) DO UPDATE SET
        status = 'AVAILABLE',
        failure_count = 0,
        cooldown_until = NULL,
        last_error_type = NULL,
        updated_at = excluded.updated_at
    `,
    provider,
    new Date().toISOString()
  );
}

export async function markProviderCooldown(env, provider, options = {}) {
  const cooldownMs = options.cooldownMs || DEFAULT_COOLDOWN_MS;
  const cooldownUntil = new Date(Date.now() + cooldownMs).toISOString();
  const existing = await getProviderState(env, provider);
  const failureCount = (existing.failureCount || 0) + 1;

  await dbRun(
    env,
    `
      INSERT INTO ai_provider_state (
        provider,
        status,
        failure_count,
        cooldown_until,
        last_error_type,
        updated_at
      )
      VALUES (?, 'COOLDOWN', ?, ?, ?, ?)
      ON CONFLICT(provider) DO UPDATE SET
        status = 'COOLDOWN',
        failure_count = excluded.failure_count,
        cooldown_until = excluded.cooldown_until,
        last_error_type = excluded.last_error_type,
        updated_at = excluded.updated_at
    `,
    provider,
    failureCount,
    cooldownUntil,
    options.errorType || null,
    new Date().toISOString()
  );

  return {
    status: "COOLDOWN",
    failureCount,
    cooldownUntil: Date.now() + cooldownMs,
    lastErrorType: options.errorType || null
  };
}
