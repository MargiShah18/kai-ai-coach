/**
 * Centralized model config for the agents.
 * - AGENT_MODEL: the primary model used by all 3 specialist agents (workout, nutrition, general).
 * - FALLBACK_MODEL: used if the primary model fails (e.g. 404, quota, region).
 * - ROUTER_MODEL: lightweight, sub-second classification model.
 *
 * All three default to gemini-3-flash-preview for speed + cost. Override via env if needed.
 */

export const AGENT_MODEL =
  process.env.GEMINI_AGENT_MODEL ?? "gemini-3-flash-preview";

export const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ?? "gemini-3-flash-preview";

export const ROUTER_MODEL =
  process.env.GEMINI_ROUTER_MODEL ?? "gemini-3-flash-preview";
