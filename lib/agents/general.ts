import {
  GoogleGenAI,
  Type,
  type Content,
  type Part,
  type FunctionCall,
} from "@google/genai";
import { BASE_PERSONA, profileBlock, onboardingAddendum } from "../persona";
import type { UserProfile } from "../store";
import { AGENT_MODEL, FALLBACK_MODEL } from "./config";

const GENERAL_ADDENDUM = `

ROLE THIS TURN — you're handling a general message: a greeting, motivation check, accountability nudge, small talk, or anything not specifically a workout or meal request. you're also the one who handles ONBOARDING.

if the user says they're tired, demotivated, struggling — be human. listen first, ask a follow-up before prescribing anything.
if the user is just saying hi or hasn't talked to you in a while — warm short reply, then gently steer to what they want to do today (workout? meals? check-in?).

if you're in onboarding and the user just gave you new profile info, call the saveProfile tool with whatever fields you learned. you MUST ALSO reply to the user with text in the same turn — never call a tool silently. acknowledge what they said, and ask the next onboarding question.`;

const SAVE_PROFILE_DECL = {
  name: "saveProfile",
  description:
    "Save new info about the user to their profile. Call this whenever you learn something new about them during onboarding or normal chat (their name, goal, activity level, dietary restrictions, equipment, or their why).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "user's first name" },
      goal: {
        type: Type.STRING,
        description:
          "main fitness/health goal (e.g. 'lose 15 lbs', 'build muscle', 'train for half marathon')",
      },
      activityLevel: {
        type: Type.STRING,
        description: "current activity level (sedentary / moderately active / very active)",
      },
      dietaryRestrictions: {
        type: Type.STRING,
        description: "allergies, vegetarian, foods they don't eat, etc.",
      },
      equipment: {
        type: Type.STRING,
        description: "equipment available (full gym / dumbbells only / bodyweight)",
      },
      why: {
        type: Type.STRING,
        description: "the real reason they want this",
      },
    },
  },
};

export async function streamGeneralReply(opts: {
  apiKey: string;
  history: Content[];
  profile: UserProfile;
  onText: (chunk: string) => void;
  onProfileUpdate?: (patch: Partial<UserProfile>) => void;
}) {
  const { apiKey, history, profile, onText, onProfileUpdate } = opts;
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction =
    BASE_PERSONA + profileBlock(profile) + onboardingAddendum(profile) + GENERAL_ADDENDUM;

  const tools = [{ functionDeclarations: [SAVE_PROFILE_DECL] }];

  const tryStream = async (model: string, contents: Content[]) =>
    ai.models.generateContentStream({
      model,
      contents,
      config: { systemInstruction, tools },
    });

  // Working copy of conversation history. We'll append model+function-response
  // turns if the model calls saveProfile.
  const conversation: Content[] = [...history];

  // Multi-turn loop: keep going as long as the model calls tools but emits no text.
  // Cap at 3 hops to be safe.
  let totalTextEmitted = false;
  for (let hop = 0; hop < 3; hop++) {
    let stream;
    try {
      stream = await tryStream(AGENT_MODEL, conversation);
    } catch (err) {
      console.warn(
        `general agent: ${AGENT_MODEL} failed, falling back to ${FALLBACK_MODEL}:`,
        err
      );
      stream = await tryStream(FALLBACK_MODEL, conversation);
    }

    let textThisHop = "";
    const functionCallsThisHop: FunctionCall[] = [];
    /**
     * Capture the model's raw response parts EXACTLY as they arrive. This is
     * critical for Gemini 3 — its thinking models attach a `thoughtSignature`
     * to functionCall parts, and that signature MUST be echoed back verbatim
     * in the next-turn history or the API returns 400 INVALID_ARGUMENT
     * ("Function call is missing a thought_signature in functionCall parts").
     */
    const modelTurnParts: Part[] = [];

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        textThisHop += text;
        totalTextEmitted = true;
        onText(text);
      }
      const chunkParts = chunk.candidates?.[0]?.content?.parts;
      if (chunkParts && chunkParts.length) {
        modelTurnParts.push(...chunkParts);
      }
      const calls = chunk.functionCalls;
      if (calls && calls.length) {
        for (const c of calls) functionCallsThisHop.push(c);
      }
    }

    // Apply any saveProfile calls to the user profile state.
    if (functionCallsThisHop.length && onProfileUpdate) {
      for (const call of functionCallsThisHop) {
        if (call.name === "saveProfile" && call.args) {
          onProfileUpdate(call.args as Partial<UserProfile>);
        }
      }
    }

    // If the model produced text this hop OR didn't call any tools, we're done.
    if (textThisHop.length > 0 || functionCallsThisHop.length === 0) {
      break;
    }

    // The model called a tool and produced no text. Echo the model turn back
    // VERBATIM (preserving thoughtSignature on function-call parts), then add a
    // function-response turn, and re-stream so the model can produce its reply.
    if (modelTurnParts.length === 0) {
      // Defensive fallback if the SDK didn't expose chunk parts for some reason.
      modelTurnParts.push(
        ...functionCallsThisHop.map<Part>((fc) => ({
          functionCall: { name: fc.name ?? "saveProfile", args: fc.args ?? {} },
        }))
      );
    }
    conversation.push({ role: "model", parts: modelTurnParts });

    const responseParts: Part[] = functionCallsThisHop.map((fc) => ({
      functionResponse: {
        name: fc.name ?? "saveProfile",
        response: { ok: true },
      },
    }));
    conversation.push({ role: "user", parts: responseParts });
  }

  // Last-resort safety net: if after all hops the model still produced no text,
  // emit a friendly fallback so the chat never goes silent.
  if (!totalTextEmitted) {
    const fallback = "got it — what else should i know?";
    onText(fallback);
  }
}
