/**
 * RSS source list for Worker news ingestion.
 * Re-exports shared free sources from src/news/rssSources.js
 */
import * as sourcesMod from "../../news/rssSources.js";

function pickExport(mod, name) {
  if (mod && mod[name] !== undefined) {
    return mod[name];
  }

  if (mod?.default && mod.default[name] !== undefined) {
    return mod.default[name];
  }

  throw new Error(`Missing export ${name}`);
}

export const NEWS_SOURCES = pickExport(sourcesMod, "NEWS_SOURCES");
