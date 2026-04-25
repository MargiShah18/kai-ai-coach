import { GoogleGenAI, Type, FunctionCallingConfigMode, type Content } from "@google/genai";
import { ROUTER_MODEL } from "./config";

export type Route = "workout" | "nutrition" | "general";

const ROUTER_INSTRUCTION = `you are an internal classifier. you do not chat with the user. you read the user's most recent message in the context of recent history and decide which specialist should handle the reply.

OPTIONS:
- "workout"  — user wants a workout designed, asked about exercises, sets/reps, training frequency, recovery, mobility, soreness, gym programming, or specifically wants a fitness plan.
- "nutrition" — user wants meal planning, recipes, asked about food/calories/macros, is logging what they ate, asked what to eat, hydration, supplements.
- "general"  — anything else: greetings, small talk, motivation, accountability check-ins, life updates, profile/onboarding answers (their name, goal, equipment, diet preferences), or vague messages.

DEFAULT: if uncertain, choose "general".

EXAMPLES:
- "give me a 30 min dumbbell workout" → workout
- "i'm sore from yesterday what should i do" → workout
- "what should i eat for breakfast" → nutrition
- "i had a bagel and coffee" → nutrition
- "plan my meals for tomorrow" → nutrition
- "hey" → general
- "i'm feeling demotivated" → general
- "my name is margi" → general
- "lose 15 lbs" → general (this is profile info during onboarding)
- "dumbbells only" → general (this is profile info during onboarding)

OUTPUT — call the route function exactly once. do NOT output text.`;

export async function classifyIntent(opts: {
  apiKey: string;
  history: Content[];
}): Promise<Route> {
  const { apiKey, history } = opts;
  const ai = new GoogleGenAI({ apiKey });

  const tools = [
    {
      functionDeclarations: [
        {
          name: "route",
          description: "route this message to the correct specialist",
          parameters: {
            type: Type.OBJECT,
            properties: {
              destination: {
                type: Type.STRING,
                enum: ["workout", "nutrition", "general"],
                description: "which specialist should handle this",
              },
            },
            required: ["destination"],
          },
        },
      ],
    },
  ];

  // Use only the last 6 messages for routing — keep it fast & cheap
  const trimmed = history.slice(-6);

  try {
    const res = await ai.models.generateContent({
      model: ROUTER_MODEL,
      contents: trimmed,
      config: {
        systemInstruction: ROUTER_INSTRUCTION,
        tools,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: ["route"],
          },
        },
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const calls = res.functionCalls;
    if (calls && calls.length > 0) {
      const dest = (calls[0].args as { destination?: Route })?.destination;
      if (dest === "workout" || dest === "nutrition" || dest === "general") {
        return dest;
      }
    }
  } catch (err) {
    console.error("router error, falling back to general:", err);
  }
  return "general";
}
