/**
 * Centralized model config for the agents.
 * - AGENT_MODEL: the primary model used by all 3 specialist agents (workout, nutrition, general).
 *   Default: gemini-2.5-pro (GA, available on all keys, strong reasoning).
 *   To upgrade later: swap to "gemini-3-pro-preview" if your key has access.
 * - FALLBACK_MODEL: used if the primary model fails (e.g. 404, quota, region).
 * - ROUTER_MODEL: lightweight, sub-second classification model. Always Flash.
 */

export const AGENT_MODEL =
  process.env.GEMINI_AGENT_MODEL ?? "gemini-2.5-pro";

export const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.5-flash";

export const ROUTER_MODEL =
  process.env.GEMINI_ROUTER_MODEL ?? "gemini-2.5-flash";
