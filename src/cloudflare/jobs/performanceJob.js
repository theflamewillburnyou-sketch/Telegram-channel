import * as calcMod from "../../performance/performanceCalculator.js";
import { getPerformanceRows } from "../d1/performanceRepository.js";
import { logError, logInfo } from "../logger.js";

function pickExport(mod, name) {
  if (mod && typeof mod[name] === "function") {
    return mod[name];
  }

  if (mod?.default && typeof mod.default[name] === "function") {
    return mod.default[name];
  }

  throw new Error(`Missing export ${name}`);
}

export async function runPerformanceJob(env) {
  logInfo("JOB_START", { job: "performance" });

  try {
    const rows = await getPerformanceRows(env, { limit: 500 });

    const calculatePerformance = pickExport(calcMod, "calculatePerformance");
    const calculatePerformanceByGroup = pickExport(
      calcMod,
      "calculatePerformanceByGroup"
    );
    const calculatePerformanceByAssetAndHorizon = pickExport(
      calcMod,
      "calculatePerformanceByAssetAndHorizon"
    );
    const calculateRollingPerformance = pickExport(
      calcMod,
      "calculateRollingPerformance"
    );

    const report = {
      overall: calculatePerformance(rows),
      byAsset: calculatePerformanceByGroup(rows, "symbol"),
      byEventType: calculatePerformanceByGroup(rows, "event_type"),
      byConfidence: calculatePerformanceByGroup(rows, "confidence"),
      byAssetAndHorizon: calculatePerformanceByAssetAndHorizon(rows),
      rolling: calculateRollingPerformance(rows),
      rowCount: rows.length
    };

    logInfo("JOB_SUCCESS", {
      job: "performance",
      rows: rows.length,
      overallAccuracy: report.overall?.accuracy
    });

    return { status: "SUCCESS", report };
  } catch (error) {
    logError("JOB_FAILURE", {
      job: "performance",
      reason: String(error.message || error)
    });

    return { status: "ERROR", reason: String(error.message || error) };
  }
}
