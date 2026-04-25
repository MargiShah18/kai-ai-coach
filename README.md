# Bo — A 2-hour clone of [trybo.ai](https://trybo.ai)

A working web demo of **Bo, the AI health coach** — built in 2 hours as a job application to [Brandon Turp](https://twitter.com/brandonturp).

Instead of just sending a resume, this is the resume.

> "An Apple × Nike level product for athletes and the health conscious." — Brandon Turp

---

## What it is

A pixel-faithful iMessage UI that talks to **Bo**, an AI health coach. Bo helps you plan meals, design workouts, log what you ate, and stays on you when you slip. Talk by typing or voice notes — it's modeled exactly on the iMessage screenshot from [trybo.ai](https://trybo.ai).

To the user, Bo is one persona. Under the hood, three specialist agents are quietly orchestrated by a router.

## The architecture (the part Brandon will care about)

```
                 ┌─────────────────────────┐
   user msg ──▶  │  Router                 │
                 │  Gemini 2.5 Flash       │
                 │  function-calling       │
                 │  ~400ms classification  │
                 └────────────┬────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
   │ Workout       │  │ Nutrition     │  │ General       │
   │ Gemini 3 Pro  │  │ Gemini 3 Pro  │  │ Gemini 3 Pro  │
   │ + workout     │  │ + meal plan   │  │ + saveProfile │
   │   plan        │  │ + meal log    │  │   (onboarding)│
   └───────────────┘  └───────────────┘  └───────────────┘
                              │
                              ▼
                  streamed reply (always "Bo")
```

**Why this design:**
- The user only ever sees **Bo**. No agent badges, no "routed to" pills — that would be a UX leak.
- Routing is a 50-token classification → use **Flash** (sub-second).
- Actual generation is reasoning-heavy → use **Gemini 3 Pro**.
- A persistent **user profile** (built during onboarding, stored in `localStorage`) is injected into every agent so every reply is personalized.
- Voice input goes through Gemini multimodally — no separate Whisper call.

## The persona

A single `lib/persona.ts` defines Bo's voice and is inherited by all agents — modeled on the **Stanley** AI growth coach (lowercase, casual, opinionated, one question at a time, narrates actions, sparse emojis). Each agent only adds a tiny **role-this-turn** addendum so the voice never breaks.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **`@google/genai`** — Gemini 3 Pro (agents) + Gemini 2.5 Flash (router)
- **Zustand** with `localStorage` persistence — chat state + user profile
- **MediaRecorder API** for voice notes
- **Vercel** (zero-config deploy)

```
app/
  api/chat/route.ts       — orchestrator: ndjson stream, calls router then agent
  page.tsx                — iPhone shell + chat loop
components/
  IPhoneFrame.tsx         — pixel-faithful iPhone 15 Pro mockup
  BrandShell.tsx          — premium dark wrapper around the phone
  ChatHeader.tsx          — iOS status bar + Bo contact strip
  ChatBubble.tsx          — iMessage bubble + tail + typing indicator
  InputBar.tsx            — text + suggestion chips + mic recorder
lib/
  persona.ts              — base voice rules + onboarding guidance
  store.ts                — Zustand state with localStorage middleware
  chatClient.ts           — streaming ndjson reader
  agents/
    router.ts             — Gemini 2.5 Flash, function-calling classifier
    general.ts            — Gemini 3 Pro + saveProfile tool (handles onboarding)
    workout.ts            — Gemini 3 Pro, workout designer
    nutrition.ts          — Gemini 3 Pro, meal planner / logger
```

## Run locally

```bash
npm install
cp .env.example .env.local
# add your GEMINI_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000 and start chatting.

Try the suggestion chips:
- *"give me a 30-min dumbbell workout"* → routes to workout
- *"plan my meals for tomorrow"* → routes to nutrition
- *"i'm feeling demotivated today"* → routes to general
- Or hit the mic and just talk

Reset the demo any time via the **reset demo** button (bottom right of the brand shell).

## Deploy

Push to GitHub, then deploy with one click on [Vercel](https://vercel.com/new). Add `GEMINI_API_KEY` as an environment variable in the Vercel project settings.

## What's intentionally NOT in this MVP

- No real macro/calorie database — Bo estimates from its own knowledge.
- No reminders/notifications — the Bo product would do this via SMS; we're web-only.
- No auth or multi-user — single-user demo, all state in `localStorage`.
- No photo-of-food logging — voice + text covers the input modalities; photo would be the next 30 minutes.

## Built by

[Margi Shah](https://github.com/) — software engineer at Warner Bros / HBO Max, building [Ghostfeed](https://ghostfeed.ai) on the side.

Pitched to Brandon at [@brandonturp](https://twitter.com/brandonturp). The job application starts here.
