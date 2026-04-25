import { NextRequest } from "next/server";
import type { Content } from "@google/genai";
import { classifyIntent } from "@/lib/agents/router";
import { streamGeneralReply } from "@/lib/agents/general";
import { streamWorkoutReply } from "@/lib/agents/workout";
import { streamNutritionReply } from "@/lib/agents/nutrition";
import type { UserProfile } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ClientMessage {
  from: "user" | "bo";
  text: string;
}

interface Attachment {
  kind: "audio" | "image";
  mimeType: string;
  base64: string;
}

interface RequestBody {
  messages: ClientMessage[];
  profile: UserProfile;
  attachment?: Attachment | null;
  /** legacy - older clients still sent {audio} */
  audio?: { mimeType: string; base64: string } | null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "GEMINI_API_KEY is not set on the server. Add it to .env.local and restart.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = (await req.json()) as RequestBody;
  const { messages, profile } = body;
  const attachment: Attachment | null =
    body.attachment ??
    (body.audio
      ? { kind: "audio", mimeType: body.audio.mimeType, base64: body.audio.base64 }
      : null);

  // Convert client message history into Gemini Content[]
  const history: Content[] = messages.map((m) => ({
    role: m.from === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  // If an attachment is present, append it as inlineData on the last user turn
  if (attachment && history.length > 0) {
    const last = history[history.length - 1];
    if (last.role === "user") {
      last.parts = [
        ...(last.parts ?? []),
        {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.base64,
          },
        },
      ];
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        // 1) classify — image attachments are nutrition by default (food photo)
        const route =
          attachment?.kind === "image"
            ? "nutrition"
            : await classifyIntent({ apiKey, history });
        send({ type: "route", route });

        // 2) dispatch
        const onText = (chunk: string) => send({ type: "text", chunk });
        const onProfileUpdate = (patch: Partial<UserProfile>) =>
          send({ type: "profile", patch });

        if (route === "workout") {
          await streamWorkoutReply({ apiKey, history, profile, onText });
        } else if (route === "nutrition") {
          await streamNutritionReply({ apiKey, history, profile, onText });
        } else {
          await streamGeneralReply({
            apiKey,
            history,
            profile,
            onText,
            onProfileUpdate,
          });
        }

        send({ type: "done" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "unknown server error";
        console.error("chat route error:", err);
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
