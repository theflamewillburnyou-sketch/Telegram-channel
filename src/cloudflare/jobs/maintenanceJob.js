import { dbRun } from "../d1/client.js";
import { logInfo, logWarn } from "../logger.js";

/**
 * Safe maintenance: expire AI cooldowns and trim nothing permanent.
 * Does NOT delete events/predictions/outcomes/reactions needed for horizons.
 */
export async function runMaintenanceJob(env) {
  logInfo("JOB_START", { job: "maintenance" });

  try {
    await dbRun(
      env,
      `
        UPDATE ai_provider_state
        SET
          status = 'AVAILABLE',
          cooldown_until = NULL,
          updated_at = ?
        WHERE status = 'COOLDOWN'
          AND cooldown_until IS NOT NULL
          AND cooldown_until <= ?
      `,
      new Date().toISOString(),
      new Date().toISOString()
    );

    logInfo("JOB_SUCCESS", { job: "maintenance" });
    return { status: "SUCCESS" };
  } catch (error) {
    logWarn("JOB_PARTIAL_FAILURE", {
      job: "maintenance",
      reason: String(error.message || error)
    });

    return { status: "ERROR", reason: String(error.message || error) };
  }
}
