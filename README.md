# Kai

A small AI health coach that lives inside an iMessage interface. Text it, send a voice note, or upload a photo of your meal — it'll plan workouts, estimate macros, and keep tabs on you.

## Architecture

```mermaid
flowchart LR
    User["👤 User<br/>iMessage UI"]

    subgraph API ["/api/chat — NDJSON stream"]
        direction TB
        Router["🧭 Router<br/>Gemini 3 Flash<br/>function-calling classifier"]

        subgraph Agents ["Specialist agents · Gemini 3 Flash"]
            direction LR
            Workout["💪 Workout<br/>plans + programming"]
            Nutrition["🥗 Nutrition<br/>meals · macros · photos"]
            General["💬 General<br/>onboarding · check-ins<br/>+ saveProfile tool"]
        end
    end

    Profile[("📝 User profile<br/>localStorage")]

    User -->|text| Router
    User -->|voice note| Router
    User -.->|"photo (skip router)"| Nutrition
    Router -->|workout intent| Workout
    Router -->|nutrition intent| Nutrition
    Router -->|other| General

    Profile -. injected into prompt .-> Workout
    Profile -. injected into prompt .-> Nutrition
    Profile -. injected into prompt .-> General
    General -.->|saveProfile call| Profile

    Workout ==>|streamed reply| User
    Nutrition ==>|streamed reply| User
    General ==>|streamed reply| User
```

A lightweight router classifies each message and hands it off to one of three specialist agents. The user only ever sees a single coach (Kai) — the routing is invisible. Profile context is built up over time and injected into every prompt.

## Run

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY
npm run dev
```

## Stack

Next.js 16 · TypeScript · Tailwind v4 · `@google/genai` (Gemini 3 Flash) · Zustand · MediaRecorder API
