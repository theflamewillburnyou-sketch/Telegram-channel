const RSS_TIMEOUT_MS = 10000;

function decodeXmlEntities(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .trim();
}

function stripHtml(text) {
  return decodeXmlEntities(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block, tagNames) {
  const names = Array.isArray(tagNames) ? tagNames : [tagNames];

  for (const tag of names) {
    const re = new RegExp(
      `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
      "i"
    );
    const match = block.match(re);

    if (match) {
      return decodeXmlEntities(match[1]);
    }
  }

  return "";
}

function extractLink(block) {
  const tagged = extractTag(block, ["link", "id"]);

  if (tagged && /^https?:\/\//i.test(tagged)) {
    return tagged.trim();
  }

  const hrefMatch = block.match(
    /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i
  );

  if (hrefMatch) {
    return hrefMatch[1].trim();
  }

  if (tagged) {
    return tagged.trim();
  }

  return "";
}

function extractItems(xml) {
  const itemBlocks = [];
  const itemRe = /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = itemRe.exec(xml)) !== null) {
    itemBlocks.push(match[2]);
  }

  return itemBlocks.map((block) => {
    const title = extractTag(block, "title");
    const link = extractLink(block);
    const content =
      extractTag(block, [
        "content:encoded",
        "content",
        "description",
        "summary"
      ]) || "";
    const contentSnippet = stripHtml(content);
    const pubDate =
      extractTag(block, [
        "pubDate",
        "published",
        "updated",
        "dc:date"
      ]) || null;
    const creator =
      extractTag(block, ["dc:creator", "author", "creator"]) ||
      undefined;

    return {
      title,
      link,
      content,
      contentSnippet,
      pubDate,
      creator
    };
  });
}

function extractChannelTitle(xml) {
  const channelMatch = xml.match(
    /<channel(?:\s[^>]*)?>[\s\S]*?<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i
  );

  if (channelMatch) {
    return decodeXmlEntities(channelMatch[1]);
  }

  const feedMatch = xml.match(
    /<feed(?:\s[^>]*)?>[\s\S]*?<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i
  );

  if (feedMatch) {
    return decodeXmlEntities(feedMatch[1]);
  }

  return "";
}

/**
 * Worker-safe RSS fetch without rss-parser.
 * Returns { items } shaped like rss-parser feed items.
 */
export async function safeFetchRss(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    RSS_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();

    if (!xml || !xml.trim()) {
      throw new Error("Empty RSS response");
    }

    const items = extractItems(xml);
    const channelTitle =
      options.sourceName ||
      extractChannelTitle(xml) ||
      "";

    if (channelTitle) {
      for (const item of items) {
        if (!item.source) {
          item.source = channelTitle;
        }
      }
    }

    return { items, title: channelTitle };
  } finally {
    clearTimeout(timeout);
  }
}
