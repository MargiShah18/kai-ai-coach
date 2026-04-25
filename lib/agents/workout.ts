import { GoogleGenAI, type Content } from "@google/genai";
import { BASE_PERSONA, profileBlock } from "../persona";
import type { UserProfile } from "../store";
import { AGENT_MODEL, FALLBACK_MODEL } from "./config";

const WORKOUT_ADDENDUM = `

ROLE THIS TURN — the user wants a workout. design one for them.

PROCESS:
1. infer from the user's message + profile: how long (default 30 min), what equipment (use profile), focus (full body / push / pull / legs / cardio).
2. if you don't know their equipment yet, ask ONE question to clarify before writing the workout.
3. output the workout as a numbered list. format:
   1. exercise name — sets × reps (or time)
4. include a finisher at the end if it makes sense.
5. close with one short coaching line (rest periods, intent, what to swap if too hard).
6. ask if they want to swap anything before they start.

NEVER:
- never give 10+ exercise lists. 4-7 is the sweet spot for 30 min.
- never use markdown headers, bold, or italics. just plain text + numbered list.`;

export async function streamWorkoutReply(opts: {
  apiKey: string;
  history: Content[];
  profile: UserProfile;
  onText: (chunk: string) => void;
}) {
  const { apiKey, history, profile, onText } = opts;
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction =
    BASE_PERSONA + profileBlock(profile) + WORKOUT_ADDENDUM;

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
      `workout agent: ${AGENT_MODEL} failed, falling back to ${FALLBACK_MODEL}:`,
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
