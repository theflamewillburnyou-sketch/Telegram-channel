const fs = require("fs");
const path = require("path");
function loadDotEnv() {
  const envPath = path.join(__dirname, "..", "..", ".env");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadDotEnv();
const token = process.env.TELEGRAM_BOT_TOKEN;
const channel = process.env.TELEGRAM_CHANNEL_ID;
(async () => {
  const me = await (await fetch(`https://api.telegram.org/bot${token}/getMe`)).json();
  const chat = await (
    await fetch(`https://api.telegram.org/bot${token}/getChat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: channel })
    })
  ).json();
  let member = null;
  let testPost = null;
  if (chat.ok && me.ok) {
    member = await (
      await fetch(`https://api.telegram.org/bot${token}/getChatMember`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chat.result.id, user_id: me.result.id })
      })
    ).json();
    const send = await (
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: channel,
          text: "✅ Final systems check — Midnight Society is live and posting."
        })
      })
    ).json();
    testPost = send.ok
      ? { ok: true, message_id: send.result.message_id }
      : { ok: false, description: send.description };
  }
  const webhook = await (
    await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
  ).json();
  console.log(
    JSON.stringify(
      {
        channelConfigured: channel,
        bot: me.ok ? me.result.username : me.description,
        channel: chat.ok
          ? { title: chat.result.title, username: chat.result.username }
          : { error: chat.description },
        botInChannel: member?.ok
          ? {
              status: member.result.status,
              can_post_messages: member.result.can_post_messages
            }
          : { error: member?.description || "n/a" },
        testPost,
        webhook: webhook.ok
          ? {
              url: webhook.result.url,
              pending: webhook.result.pending_update_count,
              last_error: webhook.result.last_error_message || null,
              allowed_updates: webhook.result.allowed_updates || null
            }
          : { error: webhook.description }
      },
      null,
      2
    )
  );
})().catch((e) => {
  console.error(JSON.stringify({ error: String(e.message || e) }));
  process.exit(1);
});
