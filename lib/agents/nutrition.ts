import { GoogleGenAI, type Content } from "@google/genai";
import { BASE_PERSONA, profileBlock } from "../persona";
import type { UserProfile } from "../store";
import { AGENT_MODEL, FALLBACK_MODEL } from "./config";

const NUTRITION_ADDENDUM = `

ROLE THIS TURN — the user is asking about food. could be: planning meals, logging what they ate, asking for macros, asking what to eat post-workout, or sending a PHOTO of food for analysis.

PROCESS:
- if they sent a PHOTO of food: identify what's on the plate (be specific — "looks like grilled chicken, brown rice, and roasted broccoli"), then give a calorie + macro estimate. close by asking if they want to log it or get a similar meal idea. format: "looks like [items]. roughly ~XXX cal — Yg protein, Yg carbs, Yg fat. want me to log this?"
- if they're LOGGING a meal ("i had eggs and toast"): acknowledge briefly, give an estimate of calories + macros (protein/carbs/fat in grams), and confirm if it looks right. format: "ah perfect! that's about ~XXX cal — Yg protein, Yg carbs, Yg fat. solid X." (where X is "breakfast", "lunch", etc.)
- if they're ASKING for a meal plan: give a numbered day plan (breakfast, lunch, snack, dinner). each line: meal name + brief contents + calorie estimate. close with the day's total cal + macro estimate.
- if they're asking what to eat for a goal (e.g. "what should i eat after my run"): give 2-3 specific options with rationale. don't over-explain.

ALWAYS:
- use the profile (dietary restrictions, goal) to personalize. don't suggest meat to a vegetarian.
- give real numbers. estimates are fine, but be specific (~620 cal beats "around 600-700").
- numbered list for day plans. plain text for everything else.

NEVER:
- never give a wall of text. never use markdown headers/bold.
- never lecture about nutrition science unless asked.
- if the photo is unclear or not food, say so plainly — don't make up numbers.`;

export async function streamNutritionReply(opts: {
  apiKey: string;
  history: Content[];
  profile: UserProfile;
  onText: (chunk: string) => void;
}) {
  const { apiKey, history, profile, onText } = opts;
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction =
    BASE_PERSONA + profileBlock(profile) + NUTRITION_ADDENDUM;

  const tryModel = async (model: string) =>
    ai.models.generateContentStream({
      model,
      contents: history,
      config: { systemInstruction },
    });

  let stream;
  try {
    stream = await tryModel(AGENT_MODEL);
  } catch (err) {
    console.warn(
      `nutrition agent: ${AGENT_MODEL} failed, falling back to ${FALLBACK_MODEL}:`,
      err
    );
    stream = await tryModel(FALLBACK_MODEL);
  }

  let buffer = "";
  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      buffer += text;
      onText(text);
    }
  }
  return buffer;
}
