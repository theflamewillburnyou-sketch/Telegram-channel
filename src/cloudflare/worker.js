/**
 * Midnight Society — Cloudflare Worker entry.
 * Cron-driven jobs + Telegram webhook for welcome/preferences.
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
import {
  handleTelegramUpdate,
  verifyTelegramWebhookSecret
} from "./telegram/webhookHandler.js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

export default {
  async fetch(request, env, ctx) {
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

    // Telegram webhook — welcome + market preference
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      const allowed = await verifyTelegramWebhookSecret(request, env);

      if (!allowed) {
        return json({ status: "UNAUTHORIZED" }, 401);
      }

      let update;

      try {
        update = await request.json();
      } catch (_error) {
        return json({ status: "BAD_REQUEST" }, 400);
      }

      ctx.waitUntil(
        handleTelegramUpdate(env, update).catch((error) => {
          logError("WEBHOOK_ASYNC_FAILURE", {
            reason: String(error.message || error)
          });
        })
      );

      // Acknowledge quickly so Telegram does not retry
      return json({ status: "OK" });
    }

    return new Response("Midnight Society Cloudflare Worker is running.", {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  },

  async scheduled(event, env, ctx) {
    const cron = event.cron || "";
    logInfo("CRON_TRIGGER", { cron });

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
          if (cron === "0,30 * * * *") {
            const minute = new Date(
              event.scheduledTime || Date.now()
            ).getUTCMinutes();

            // :00 news, :30 market — every 30 minutes
            if (minute < 15) {
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

          if (cron === "5,35 * * * *") {
            await runPublishJob(env, telegramOptions);
            return;
          }

          if (cron === "10,40 * * * *") {
            await runReactionJob(env, telegramOptions);
            return;
          }

          if (cron === "15,45 * * * *") {
            await runPerformanceJob(env);
            return;
          }

          if (cron === "15 3 * * *") {
            await runMaintenanceJob(env);
            return;
          }

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
