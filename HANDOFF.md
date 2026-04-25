# Final 15 minutes — handoff to you

The app is built, typechecked, and the production build passes. You just need to:
1. Add your Gemini key
2. Push to GitHub
3. Deploy to Vercel
4. Record the Loom
5. Send the DM

Total time: ~15 minutes.

---

## Step 1 — add your Gemini key (30 seconds)

```bash
cd /Users/margishah/trybo-mvp
cp .env.example .env.local
# open .env.local and paste your Gemini API key:
#   GEMINI_API_KEY=your_actual_key_here
```

Get a key at: https://aistudio.google.com/apikey

## Step 2 — run it locally to verify (1 minute)

```bash
npm run dev
```

Open http://localhost:3000.

You should see:
- Dark brand wrapper with "Bo" wordmark + "Visit trybo.ai" CTA
- iPhone 15 Pro mockup in the center with iMessage UI
- First message from Bo: *"hey!! welcome 👋 i'm bo, your ai health coach. what's your name?"*

Test before recording:
1. Type your name, answer a couple onboarding questions
2. After onboarding, suggestion chips appear above the input
3. Tap *"give me a 30-min dumbbell workout"* → should stream a numbered workout
4. Tap *"plan my meals for tomorrow"* → should stream a meal plan
5. Hit the mic button, say *"i'm feeling demotivated today"* → voice should transcribe and reply warmly

If anything fails, check the dev console + the terminal running `next dev` for errors.

## Step 3 — push to GitHub (2 minutes)

```bash
cd /Users/margishah/trybo-mvp
git init
git add .
git commit -m "feat: bo — ai health coach mvp"
gh repo create bo-ai-coach --public --source=. --remote=origin --push
```

If you don't have `gh` CLI: create a new public repo manually at https://github.com/new called `bo-ai-coach`, then:

```bash
git remote add origin https://github.com/<your-username>/bo-ai-coach.git
git branch -M main
git push -u origin main
```

## Step 4 — deploy to Vercel (3 minutes)

Easiest path:

1. Go to https://vercel.com/new
2. Import the `bo-ai-coach` repo you just pushed
3. Framework preset: Next.js (auto-detected)
4. **Add environment variable**: `GEMINI_API_KEY` = your key
5. Click Deploy

You'll get a URL like `bo-ai-coach.vercel.app`. Test the same flow there.

## Step 5 — record the Loom (5 minutes)

Use https://loom.com — free, fast.

**Setup:**
- Window: just your Vercel URL (full screen the browser tab)
- Webcam: bottom-right bubble, on
- Mic: on
- Resolution: 1080p

**Script (60–90 seconds — DON'T go over):**

> **(0:00–0:10, webcam on, casual)**
> Hey Brandon — instead of just sending a resume, I spent the last two hours building a working version of Bo. Quick demo.

> **(0:10, screen share, fresh page load — hit "reset demo" first if needed)**
> So this is Bo. Onboarding is the first conversation.

> **(0:15)** Type your name, hit send. Bo asks the next question.

> **(0:25)** Skip ahead — tell it your goal in one message.

> **(0:35)** Click the **"give me a 30-min dumbbell workout"** suggestion chip. Watch the workout stream in numbered.

> **(0:50)** Click the **"plan my meals for tomorrow"** suggestion. Watch the day plan stream.

> **(1:05)** Hit the mic, say *"i'm feeling tired today"*, send. Bo responds warmly — different tone than workout/nutrition.

> **(1:15, webcam back on — this is the architecture reveal)**
> From the user's side, it's just one persona — Bo. Under the hood there's a Gemini 2.5 Flash router that quietly hands each message to one of three specialist agents on Gemini 3 Pro: workouts, nutrition, or general. The user profile from onboarding is injected into every agent so it's actually personalized.

> **(1:25, close)**
> Next.js, Vercel, repo's public. I'd love 15 minutes to talk about what I'd ship first on the real product. Resume attached.

Hit stop. Loom auto-uploads. Copy the link.

## Step 6 — send the DM (1 minute)

```
Hey Brandon — appreciate the quick reply, resume attached.

But honestly, the better signal is this: I spent the last 2 hours
building a working version of Bo so you can see how I ship.

Live demo: <vercel-url>
60s walkthrough: <loom-url>
Code: <github-url>

It's a real multi-agent architecture — Gemini Flash router quietly
handing each message to a specialist agent on Gemini 3 Pro
(workouts, nutrition, or general). Voice input + onboarding that
actually personalizes the responses.

Try the suggestion chips or hit the mic. Would love 15 minutes
to talk about what I'd build first on the real product.

— Margi
```

Also attach your resume PDF.

---

## Troubleshooting

**"GEMINI_API_KEY is not set"** → you forgot to add it to Vercel env vars OR you didn't restart `npm run dev` after adding it locally.

**Mic button does nothing on Safari** → permissions; try Chrome for the demo.

**Workout/meal reply is slow (5-8s)** → Gemini 3 Pro is reasoning-heavy. The typing indicator covers it. If you want it faster for the demo, change `gemini-3-pro-preview` → `gemini-2.5-flash` in `lib/agents/workout.ts` and `lib/agents/nutrition.ts`. (Less impressive replies but ~1s response.)

**Routing misfires** → look at `lib/agents/router.ts` — add a couple more few-shot examples for the case you saw misroute.
