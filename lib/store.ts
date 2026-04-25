"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name?: string;
  goal?: string;
  activityLevel?: string;
  dietaryRestrictions?: string;
  equipment?: string;
  why?: string;
  weight?: string;
  height?: string;
}

export interface ChatMessage {
  id: string;
  from: "user" | "bo";
  text: string;
  ts: number;
  /** internal-only: which agent generated this. Never shown in UI. Used for the dev panel only. */
  _agent?: "general" | "workout" | "nutrition" | "router";
  /** optional inline image attachment (data URL) for user messages */
  imageDataUrl?: string;
}

interface BoState {
  messages: ChatMessage[];
  profile: UserProfile;
  hasStarted: boolean;
  addMessage: (msg: ChatMessage) => void;
  updateLastBoMessage: (textChunk: string, agent?: ChatMessage["_agent"]) => void;
  setProfile: (patch: Partial<UserProfile>) => void;
  start: () => void;
  reset: () => void;
}

export const useBoStore = create<BoState>()(
  persist(
    (set) => ({
      messages: [],
      profile: {},
      hasStarted: false,

      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),

      updateLastBoMessage: (chunk, agent) =>
        set((s) => {
          const msgs = [...s.messages];
          const last = msgs[msgs.length - 1];
          if (last && last.from === "bo") {
            msgs[msgs.length - 1] = {
              ...last,
              text: last.text + chunk,
              _agent: agent ?? last._agent,
            };
          }
          return { messages: msgs };
        }),

      setProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),

      start: () => set({ hasStarted: true }),

      reset: () => set({ messages: [], profile: {}, hasStarted: false }),
    }),
    {
      name: "kai-state-v2",
      partialize: (s) => ({
        messages: s.messages,
        profile: s.profile,
        hasStarted: s.hasStarted,
      }),
    }
  )
);
