import { PREFERENCES } from "../d1/subscriberRepository.js";

/**
 * Short welcome copy — identity, belonging, and pride.
 */
export function buildWelcomeMessage(firstName) {
  const name = firstName ? String(firstName).trim() : "";
  const greeting = name ? `Welcome, ${escapeHtml(name)}.` : "Welcome.";

  return (
    `${greeting}\n\n` +
    `You didn’t just join another feed.\n` +
    `You stepped into a room where only the moves that matter make it through.\n\n` +
    `<b>Midnight Society</b> is built for people who want signal over noise — ` +
    `the kind of clarity that makes you feel ahead, not overwhelmed.\n\n` +
    `You’re in the right place.`
  );
}

export function buildPreferencePromptMessage() {
  return (
    `One last step — make this yours.\n\n` +
    `Which market should we watch for you?\n` +
    `You’ll only get major alerts for what you choose.`
  );
}

export function buildPreferenceSavedMessage(preference) {
  const labels = {
    [PREFERENCES.STOCKS]: "Stock market",
    [PREFERENCES.CRYPTO]: "Crypto",
    [PREFERENCES.COMMODITIES]: "Commodities",
    [PREFERENCES.ALL]: "All markets"
  };

  const label = labels[preference] || preference;

  return (
    `Locked in: <b>${escapeHtml(label)}</b>.\n\n` +
    `From here, Midnight Society will focus your alerts on that lane.\n` +
    `You can change this anytime with /markets.`
  );
}

export function buildMarketPreferenceKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📈 Stock market", callback_data: "pref:stocks" },
        { text: "₿ Crypto", callback_data: "pref:crypto" }
      ],
      [
        { text: "🛢 Commodities", callback_data: "pref:commodities" },
        { text: "🌐 All", callback_data: "pref:all" }
      ]
    ]
  };
}

/**
 * Map event tags → preference buckets.
 */
export function getEventMarketBuckets(event) {
  const tags = (event?.marketTags || []).map((tag) =>
    String(tag).toLowerCase()
  );

  const buckets = new Set();

  if (
    tags.some((tag) =>
      [
        "stockmarket",
        "usstocks",
        "indiastocks",
        "europestocks",
        "macro",
        "bonds",
        "globalmarkets"
      ].includes(tag)
    )
  ) {
    buckets.add(PREFERENCES.STOCKS);
  }

  if (tags.some((tag) => ["crypto", "cryptomarket"].includes(tag))) {
    buckets.add(PREFERENCES.CRYPTO);
  }

  if (
    tags.some((tag) =>
      ["oil", "energy", "gold", "copper", "commoditiesmarket"].includes(tag)
    )
  ) {
    buckets.add(PREFERENCES.COMMODITIES);
  }

  // Fallback: try title keywords if tags missing
  if (buckets.size === 0) {
    const title = String(event?.title || "").toLowerCase();

    if (
      /bitcoin|ethereum|crypto|btc|eth|solana|stablecoin/.test(title)
    ) {
      buckets.add(PREFERENCES.CRYPTO);
    } else if (
      /oil|brent|wti|opec|gold|silver|copper|natural gas|lng/.test(title)
    ) {
      buckets.add(PREFERENCES.COMMODITIES);
    } else {
      buckets.add(PREFERENCES.STOCKS);
    }
  }

  return [...buckets];
}

export function preferenceMatchesEvent(preference, event) {
  const pref = String(preference || PREFERENCES.ALL).toLowerCase();

  if (pref === PREFERENCES.ALL) {
    return true;
  }

  const buckets = getEventMarketBuckets(event);
  return buckets.includes(pref);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
