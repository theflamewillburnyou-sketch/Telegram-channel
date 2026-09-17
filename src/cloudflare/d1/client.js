/**
 * Thin async helpers around Cloudflare D1 env.DB.
 * Pattern: every repository function receives `env` first.
 * No global connection — Worker always passes env.
 */

function getDb(env) {
  if (!env || !env.DB) {
    throw new Error("D1 binding env.DB is missing");
  }

  return env.DB;
}

function prepared(env, sql, params = []) {
  const statement = getDb(env).prepare(sql);

  if (!params.length) {
    return statement;
  }

  return statement.bind(...params);
}

export async function dbRun(env, sql, ...params) {
  return prepared(env, sql, params).run();
}

export async function dbGet(env, sql, ...params) {
  return prepared(env, sql, params).first();
}

export async function dbAll(env, sql, ...params) {
  const result = await prepared(env, sql, params).all();
  return result.results || [];
}

export async function dbQuery(env, sql, ...params) {
  return prepared(env, sql, params).all();
}
