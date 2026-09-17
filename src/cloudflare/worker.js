/**
 * Midnight Society — Cloudflare Worker entry.
 * Cron-driven jobs + minimal health. No public Telegram send route.
 */
import { getConfig, hasDedicatedTelegramTestDestination } from "./config.js";
import { dbGet } from "./d1/client.js";
import { runMaintenanceJob } from "./jobs/maintenanceJob.js";
import { runMarketJob, runReactionJob } from "./jobs/marketJob.js";
import { runNewsJob } from "./jobs/newsJob.js";
import { runPerformanceJob } from "./jobs/performanceJob.js";
import { runPublishJob } from "./jobs/publishJob.js";
import { logError, logInfo, logWarn } from "./logger.js";
import { getTelegramMe } from "./telegram/getMe.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({
        status: "SUCCESS",
        service: "midnight-society-worker"
      });
    }

    if (url.pathname === "/health/db") {
      try {
        const row = await dbGet(env, "SELECT 1 AS connected");
        return json({
          status: "SUCCESS",
          database: { connected: row?.connected ?? null }
        });
      } catch (error) {
        return json(
          {
            status: "ERROR",
            message: String(error.message || error)
          },
          500
        );
      }
    }

    // Auth-only Telegram check — does not send a channel message.
    if (url.pathname === "/health/telegram") {
      try {
        const me = await getTelegramMe(env);
        return json({
          status: "SUCCESS",
          telegram: {
            authenticated: true,
            botUsername: me.botUsername
          },
          testDestinationConfigured: hasDedicatedTelegramTestDestination(env)
        });
      } catch (error) {
        return json(
          {
            status: "ERROR",
            message: String(error.message || error)
          },
          500
        );
      }
    }

    return new Response("Midnight Society Cloudflare Worker is running.", {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  },

  async scheduled(event, env, ctx) {
    const cron = event.cron || "";
    logInfo("CRON_TRIGGER", { cron });

    // Default: disable production Telegram until test destination exists
    // or CF_ALLOW_PRODUCTION_TELEGRAM=true is explicitly set.
    const allowProductionTelegram =
      getConfig(env).telegramTestChannelId ||
      String(env.CF_ALLOW_PRODUCTION_TELEGRAM || "").toLowerCase() === "true";

    const telegramOptions = allowProductionTelegram
      ? {}
      : { disableTelegram: true };

    if (!allowProductionTelegram) {
      logWarn("TELEGRAM_SENDS_DISABLED", {
        reason: "no dedicated test destination / production send gate"
      });
    }

    ctx.waitUntil(
      (async () => {
        try {
          if (cron === "*/5 * * * *") {
            // Split heavy work across the same 5-minute tick by minute bucket.
            const minute = new Date(event.scheduledTime || Date.now()).getUTCMinutes();

            if (minute % 10 < 5) {
              await runNewsJob(env, {
                ...telegramOptions,
                maxNewEvents: getConfig(env).maxNewEventsPerRun,
                maxAiCalls: getConfig(env).maxAiCallsPerRun
              });
            } else {
              await runMarketJob(env, telegramOptions);
            }

            return;
          }

          if (cron === "1-59/5 * * * *") {
            await runPublishJob(env, telegramOptions);
            return;
          }

          if (cron === "2-59/5 * * * *") {
            await runReactionJob(env, telegramOptions);
            return;
          }

          if (cron === "*/30 * * * *") {
            await runPerformanceJob(env);
            return;
          }

          if (cron === "15 3 * * *") {
            await runMaintenanceJob(env);
            return;
          }

          // Fallback for unexpected cron expressions
          logWarn("CRON_UNMAPPED", { cron });
          await runNewsJob(env, {
            ...telegramOptions,
            dryRunPublish: true,
            disableTelegram: true
          });
        } catch (error) {
          logError("CRON_HANDLER_FAILURE", {
            cron,
            reason: String(error.message || error)
          });
        }
      })()
    );
  }
};
