/**
 * D1 REST shim — same surface as env.DB in Workers (prepare/bind/run/first/all).
 * Used by GitHub Actions so jobs run off Cloudflare Free CPU limits.
 */
export function createRemoteD1(options) {
  const accountId = options.accountId;
  const databaseId = options.databaseId;
  const apiToken = options.apiToken;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      "Remote D1 requires accountId, databaseId, and apiToken"
    );
  }

  const endpoint =
    `https://api.cloudflare.com/client/v4/accounts/${accountId}` +
    `/d1/database/${databaseId}/query`;

  async function query(sql, params = []) {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sql,
        params
      })
    });

    const payload = await response.json();

    if (!response.ok || payload.success === false) {
      const errMsg =
        payload?.errors?.[0]?.message ||
        payload?.messages?.[0]?.message ||
        `D1 HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const result = Array.isArray(payload.result)
      ? payload.result[0]
      : payload.result;

    return {
      success: true,
      results: result?.results || [],
      meta: result?.meta || {}
    };
  }

  return {
    prepare(sql) {
      return {
        _sql: sql,
        _params: [],
        bind(...params) {
          this._params = params;
          return this;
        },
        async run() {
          return query(this._sql, this._params);
        },
        async first() {
          const out = await query(this._sql, this._params);
          return out.results[0] || null;
        },
        async all() {
          return query(this._sql, this._params);
        }
      };
    }
  };
}
