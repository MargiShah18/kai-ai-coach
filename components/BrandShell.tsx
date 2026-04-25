"use client";

import { ReactNode } from "react";

const PRESETS: { label: string; text: string }[] = [
  {
    label: "design a workout",
    text: "design me a 35-minute full-body dumbbell workout for tomorrow morning. I have 15lb and 25lb dumbbells and a pull-up bar at home. focus on hypertrophy, keep rest under 60s.",
  },
  {
    label: "plan a day of meals",
    text: "plan tomorrow's meals for me — aiming for ~2,200 cal, 180g protein, vegetarian, no nuts. give me breakfast, lunch, a snack, and dinner with rough macros for each.",
  },
  {
    label: "log what I just ate",
    text: "I just had 3 scrambled eggs, 2 slices of sourdough toast with butter, half an avocado, and a black coffee. how does that look macro-wise for breakfast?",
  },
  {
    label: "I'm not feeling it today",
    text: "I've been exhausted all week and skipped my last 2 workouts. I'm sleeping fine but feel mentally drained. should I push through and train today, or take another rest day?",
  },
  {
    label: "weekly check-in",
    text: "it's sunday — give me a quick check-in on how this week went. ask me about training, eating, sleep, and how I'm feeling, one at a time.",
  },
];

const FEATURES: { title: string; icon: ReactNode }[] = [
  { title: "personalized workouts", icon: <DumbbellIcon /> },
  { title: "meal plans & macro tracking", icon: <PlateIcon /> },
  { title: "voice notes", icon: <MicIcon /> },
  { title: "photo-based calorie tracking", icon: <CameraIcon /> },
  { title: "no apps. no forms.", icon: <ChatIcon /> },
];

interface BrandShellProps {
  children: ReactNode;
  onPreset?: (text: string) => void;
}

export function BrandShell({ children, onPreset }: BrandShellProps) {
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      {/* top brand strip */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2.5">
          <KaiMark />
          <span className="font-display text-[24px] leading-none text-bo-ink">
            Kai
          </span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-bo-line px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-bo-muted md:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-bo-accent" />
          private beta
        </span>
      </header>

      {/* hero: left copy · phone · right presets */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-4 pb-4">
        <div className="grid w-full max-w-[1180px] grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
          {/* LEFT — brand story */}
          <aside className="hidden flex-col items-end text-right lg:flex">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-bo-line bg-bo-bg-2/40 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bo-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-bo-accent shadow-[0_0_8px_rgba(214,255,61,0.7)]" />
              your coach, on text
            </span>

            <h1 className="font-display text-[52px] leading-[0.95] tracking-tight text-bo-ink xl:text-[64px]">
              health that
              <br />
              <em className="not-italic text-bo-accent">listens back.</em>
            </h1>

            <p className="mt-5 max-w-[360px] font-sans text-[14.5px] leading-[1.55] text-bo-muted">
              Kai is an AI coach you can text like a friend. plan workouts,
              track macros, snap a photo of your plate, or just say you&rsquo;re
              tired&nbsp;— and get a real reply, not a chatbot script.
            </p>

            <ul className="mt-7 flex max-w-[360px] flex-col items-end gap-2.5">
              {FEATURES.map((f) => (
                <li
                  key={f.title}
                  className="flex items-center justify-end gap-3"
                >
                  <p className="font-sans text-[14px] font-medium leading-tight text-bo-ink">
                    {f.title}
                  </p>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-bo-line bg-bo-bg-2/60 text-bo-accent shadow-inner">
                    {f.icon}
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          {/* CENTER — phone */}
          <div className="relative justify-self-center">{children}</div>

          {/* RIGHT — preset rail */}
          <aside className="hidden flex-col lg:flex">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bo-muted">
                try a prompt
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-bo-line to-transparent" />
            </div>
            <p className="mb-5 font-display text-[20px] leading-tight text-bo-ink">
              tap one to drop it in the chat&nbsp;
              <span className="text-bo-muted">— edit, then send.</span>
            </p>

            <div className="flex flex-col items-start gap-2.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onPreset?.(p.text)}
                  className="group block max-w-full text-left transition active:scale-[0.985]"
                  title={p.text}
                >
                  <span className="relative inline-flex items-center gap-1 rounded-[20px] rounded-bl-[6px] bg-[var(--color-imsg-blue)] px-4 py-2.5 font-ios text-[14.5px] font-medium leading-[1.3] text-white shadow-[0_4px_16px_-6px_rgba(0,122,255,0.6)] transition-all duration-200 group-hover:-translate-y-[1px] group-hover:shadow-[0_8px_24px_-6px_rgba(0,122,255,0.7)] group-hover:brightness-[1.06]">
                    {p.label}
                    <ArrowIcon className="ml-0.5 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function KaiMark() {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-bo-bg"
      style={{
        background:
          "radial-gradient(120% 120% at 30% 20%, #e7ff66, #c5ff1f 60%, #a3e000)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 2v10M3 7l5-5M3 7l5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ── feature icons ── (1.5px stroke, 16px box, currentColor) */

function DumbbellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 6v4M5 5v6M11 5v6M13 6v4M5.5 8h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PlateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect
        x="6"
        y="2"
        width="4"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 5.5a1.5 1.5 0 0 1 1.5-1.5h1l1-1.5h4l1 1.5h1A1.5 1.5 0 0 1 13.5 5.5v6A1.5 1.5 0 0 1 12 13H4a1.5 1.5 0 0 1-1.5-1.5v-6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 4.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7l-3 2.5v-2.5h-.5a1 1 0 0 1-1-1v-6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      className={className}
    >
      <path
        d="M2 5.5h7M6 2.5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
