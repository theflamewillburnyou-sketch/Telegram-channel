# Midnight Society — Product README

**Channel:** [@MidnightMarkets](https://t.me/MidnightMarkets)  
**Bot:** [@MidnightSocietyNewsBot](https://t.me/MidnightSocietyNewsBot)  
**Runtime:** Cloudflare Workers + D1 + Cron  
**Stack:** Free-first AI failover (Gemini → Groq → OpenRouter → Workers AI → rule fallback)

---

## What it is

Midnight Society is a curated Telegram market-intelligence channel. It is not another headline dump. The system filters news and market moves for **signal over noise**, posts major alerts to the channel, and optionally DMs members who set a market preference (stocks / crypto / commodities / all).

---

## How processing works (end to end)

```
RSS / market feeds
        │
        ▼
  News + Market jobs (cron every 30 min)
        │
        ▼
  Relevance · tags · assets · priority scoring
        │
        ▼
  AI analysis (only for higher-priority events)
        │
        ├─ Gemini (free tier)
        ├─ Groq (free tier)
        ├─ OpenRouter free models
        ├─ Cloudflare Workers AI (no key)
        └─ Rule fallback (always works)
        │
        ▼
  Publish gate (priority ≥ 8.5, freshness, pacing)
        │
        ├─ Channel post (everyone)
        └─ Bot DMs (preference-matched subscribers)
```

### 1) Ingest
- Cron pulls bounded free RSS sources and market price snapshots.
- Workers keep runs small (`CF_MAX_*` limits) so the system stays reliable on the free Cloudflare footprint.

### 2) Score & classify
- Local rules assign market tags (stocks / crypto / commodities), assets, direction, magnitude, and a **priority score**.
- Low-signal items never reach AI or Telegram.

### 3) AI analysis (when required)
- Higher-priority events go through the AI router.
- Each provider returns structured JSON (summary, why it matters, classification).
- If a provider rate-limits or fails, the next free provider runs.
- If every LLM fails, **rule fallback** still produces a usable analysis so publishing never hard-stops.

### 4) Publish
- Only major events (priority ≥ ~8.5) are eligible.
- Freshness + pacing (e.g. min minutes between posts) protect channel quality.
- Successful Telegram sends are written to D1 (`published_posts`) — ledger after send, never before.

### 5) Welcome & preferences
- Users **join the channel** for the public feed.
- Users **Start the bot** once for welcome + market choice (Telegram blocks cold DMs until Start).
- Preference filters **bot DMs only**; the channel remains the shared full feed.

---

## What users experience

| Surface | What they get |
|---------|----------------|
| Channel | Shared major alerts (stocks, crypto, commodities, macro) |
| Bot | Welcome, market preference, optional filtered DMs |
| Website (future) | Brand story + one-tap join CTA |

---

## Ops cheat sheet

```bash
# Deploy Worker
npx wrangler deploy

# Apply D1 migrations
npx wrangler d1 migrations apply midnightmarketnews --remote

# Secrets
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHANNEL_ID
npx wrangler secret put GOOGLE_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put OPENROUTER_API_KEY
```

Cron (UTC): news+market at `:00/:30`, publish at `:05/:35`, reactions at `:10/:40`, performance at `:15/:45`.

---

## Marketing & growth prompts

Use the complete prompts below as single paste-ready briefs (website builder, Cursor, Claude, Midjourney, Ideogram, Ads Manager creative tools, etc.).

---

### PROMPT 1 — Complete website + on-site image generation brief

```
You are a senior conversion strategist, CRO specialist, SEO lead, and brand designer.

Build a single high-converting landing page for “Midnight Society” — a Telegram market-intelligence channel that filters noise and posts only major market moves (stocks, crypto, commodities). Tone: calm authority, exclusive belonging, pride of clarity — never hype-trader scam energy.

PSYCHOLOGY TO USE
- Identity: “people who choose signal over noise”
- Belonging: join a quieter, sharper room
- Status: pride in being selective with attention
- Loss aversion: endless feeds waste time and edge
- Commitment: one clear action — Join on Telegram
- Trust: transparency about filtering + “not financial advice”

CRO RULES
- One job above the fold: join Telegram
- One primary CTA repeated 2–3 times max
- Remove competing links in hero
- Social proof placeholders (subscriber count, “major alerts only”, “AI-filtered”)
- Objection handling near CTA (free to join, Telegram required, curated not spam)
- Mobile-first; CTA thumb-reachable
- Page load: lightweight, no clutter cards in hero

SEO RULES
- Primary keywords: market news telegram, stock crypto commodities alerts, curated market signals, midnight society
- Title tag ≤ 60 chars, meta description ≤ 155 chars with CTA language
- H1 includes brand + benefit
- Semantic H2s: How it works / Who it’s for / What you get / FAQ
- FAQ schema-ready Q&As
- Internal anchor to CTA; alt text on images with keywords naturally
- Avoid keyword stuffing

PAGE STRUCTURE (exact)
1) Hero (full-bleed dark atmospheric visual): Brand “Midnight Society” as hero-level signal. One headline. One supporting sentence. One primary button: “Join the Channel on Telegram” → https://t.me/MidnightMarkets. Secondary text link: “Open the bot for preferences” → https://t.me/MidnightSocietyNewsBot
2) Problem: information overload
3) Solution: signal filter + major alerts only
4) How it works (3 steps): Join channel → optional Start bot → get curated alerts
5) Who it’s for (identity list)
6) Trust / disclaimer strip
7) Final CTA band
8) FAQ (SEO)

COPY CONSTRAINTS
- No purple-gradient SaaS clichés
- No emoji spam
- No fake urgency countdowns
- Brand first; headline never overpowers brand
- Visual direction: midnight navy/charcoal, soft gold accent, real atmosphere (city night / markets after hours), not abstract purple glow

DELIVERABLES
A) Full page copy (headline, subhead, sections, FAQ, SEO title + meta)
B) Wireframe description per section
C) Complete IMAGE GENERATION PROMPTS for the website (produce 5 prompts, each self-contained, 16:9 and 1:1 variants noted):
   1. Hero background — nocturnal financial district / quiet confidence
   2. “Signal vs noise” conceptual visual for problem section
   3. How-it-works strip illustration (3-step, minimal)
   4. Identity/audience lifestyle still (serious young professional, night desk, no face- obligatory)
   5. Open Graph / social share card 1200×630 for SEO/social previews
Each image prompt must include: subject, mood, lighting, color palette, composition, negative prompts (no logos, no unreadable fake text, no purple neon cliché, no crowded trading-floor chaos).

CTA TARGET
Primary button URL: https://t.me/MidnightMarkets
Bot URL: https://t.me/MidnightSocietyNewsBot

Output as production-ready copy + image prompts only — no filler.
```

---

### PROMPT 2 — Complete social ads + image generation brief (IG / FB / etc.)

```
You are a performance creative director specializing in Meta (Instagram + Facebook), LinkedIn, and TikTok ads for community/subscription products.

Create a full paid-social creative system for Midnight Society — a curated Telegram channel for major market alerts (stocks, crypto, commodities). Goal: maximize qualified Telegram joins (not vanity likes). Use human psychology + CRO principles in ad creative.

POSITIONING
“Signal over noise. Join the room that filters so you don’t have to.”
Identity-led. Pride. Clarity. Anti-spam. Anti-guru.

FUNNEL
Ad → Landing page OR direct Telegram join (https://t.me/MidnightMarkets)
Prefer: Ad → landing page → Telegram for trust; test direct Telegram for cost efficiency.

AUDIENCE ANGLES (write one primary hook per angle)
1) Overwhelmed retail traders drowning in Twitter/Telegram spam
2) Crypto-native users who want fewer, better alerts
3) Stock/macro learners who want “only when it matters”
4) Professionals who hate notification clutter but fear missing big moves
5) Ambition/identity: “I follow signal, not noise”

AD FORMATS TO PRODUCE
- 5 feed ad primary texts (Hook → Agitation → Identity → CTA), 125–200 words and a short 40–70 word cutdown each
- 5 headline options (≤40 chars) + 5 description options (≤80 chars)
- 3 Instagram Stories/Reels scripts (15–25s): visual + voiceover/text overlays + end card CTA
- 3 carousel outlines (3–5 cards): problem → filter → benefit → social proof → join
- Objection-handling comment replies (short)

COMPLIANCE
- No guaranteed returns, no “get rich”, no fake screenshots of profits
- Include soft disclaimer where needed: not financial advice
- No misleading urgency

IMAGE / CREATIVE GENERATION — ONE COMPLETE PROMPT SET
Generate 8 self-contained image prompts optimized for Meta ads (1080×1080 and 1080×1920 versions of each concept). Style: premium nocturnal editorial photography + restrained typography space (leave clean negative space for text overlay). Palette: charcoal, midnight blue, muted gold. Avoid purple neon, emoji, cluttered charts, celebrity faces, brand logos of other companies.

Concepts required:
1) “Noise vs signal” split composition
2) Single alert glowing on an otherwise dark phone lock screen
3) Empty desk at midnight with one focused chart glow
4) City skyline at 00:00 — calm power
5) Abstract filter metaphor (light through aperture / lens)
6) Identity portrait silhouette (anonymous, aspirational)
7) Before/after visual: chaotic feed vs clean alert
8) End-card style frame with large empty center for “Join Midnight Society”

For each prompt include: aspect ratios, lighting, camera, mood, negative prompts, and suggested on-image text overlay (≤6 words).

CTA LANGUAGE BANK
- Join Midnight Society
- Get signal, not noise
- Open the channel
- Start filtering your feed

Also output a 7-day testing plan: which 3 creatives to launch first, what to kill/scale, and success metrics (CPC to join, CTR, landing→join rate).
```

---

### PROMPT 3 — Audience targeting + free vs paid launch strategy

```
You are a growth strategist and monetization advisor for media/community products.

Advise Midnight Society (Telegram channel + preference bot for stocks/crypto/commodities market alerts) on:
1) Exact audience targeting for Meta Ads, Google, TikTok, Reddit, and organic Telegram discovery
2) Messaging pillars that convert each segment
3) Whether to launch paid immediately or start free — with a staged plan

CONTEXT
- Product today: free channel + optional bot preferences
- Differentiator: curated major alerts, AI-assisted filtering, anti-noise brand
- Constraint: trust is fragile in finance niches; over-monetizing early kills growth

DELIVER
A) Ideal customer profiles (4 ICPs) with demographics, psychographics, pains, triggers, where they hang out
B) Meta Ads interest/behavior stacks + exclusions (scam/gambling lookalikes)
C) Organic growth loops (pin, cross-promo, SEO landing, Twitter/X, LinkedIn, Reddit rules-aware posts)
D) Monetization ladder:
   - Phase 0: free growth (what KPIs before charging)
   - Phase 1: soft monetization (optional tips / affiliate / sponsorship — if any)
   - Phase 2: paid tier (what belongs behind paywall vs stays free)
E) Clear recommendation: launch free first OR paid from day one — pick one, justify with psychology + unit economics
F) 90-day subscriber growth plan with weekly targets and creative themes
G) Pricing hypotheses for a future paid tier (monthly/annual) and what unpaid users still receive so the free channel remains a marketing engine

Be decisive. No generic “it depends” without a recommended default path.
```

---

## Audience, free vs paid (executive recommendation)

**Default path: launch free first. Monetize after proof.**

| Stage | Action |
|-------|--------|
| 0–1k subs | Free channel only. Optimize welcome + bot preferences. Ads test small. |
| 1–5k | Keep free public feed. Add soft social proof. Measure join→bot Start rate. |
| 5k+ / clear engagement | Introduce paid tier (e.g. faster alerts, deeper briefings, exclusive horizons) while **channel stays free** as the top-of-funnel. |

**Why not paid from day one:** finance Telegram is low-trust. People join identity + value first; they pay after they feel proud to belong and see consistent signal. Charging before that raises CAC and scam associations.

**Who to target first**
1. Crypto-active 22–40 who hate spam groups  
2. Retail stock/macro learners who follow Fed/oil/geopolitics  
3. Busy professionals who want fewer notifications, higher quality  
4. English-speaking India + SEA + US evenings (your ops timezone advantage)

---

## Domain recommendations (cheap + on-brand)

Quick DNS probe (verify at purchase — not a legal availability guarantee). Prefer [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or Porkbun for low renewals. Host on **Cloudflare Pages** (free).

| Domain | DNS probe | Fit |
|--------|-----------|-----|
| **midnightmarketnews.com** | Likely available | Best SEO + brand clarity |
| **getmidnightsociety.com** | Likely available | Best CRO (“get” = join CTA) |
| **midnightsignal.news** | Likely available | Cheap thematic `.news` |
| **msociety.news** | Likely available | Short ads destination |
| **signalatmidnight.com** | Likely available | Memorable alternate |
| midnightsociety.news | Taken | Skip |
| midnightmarkets.com / themidnightmarkets.com | In use by others | Avoid brand collision |

**Recommended buy order:** `getmidnightsociety.com` (conversion) or `midnightmarketnews.com` (SEO) → fallback `midnightsignal.news`.

---

## Disclaimer

Midnight Society content is for information and education only — not financial advice. Always do your own research.
