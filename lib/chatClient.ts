import type { ChatMessage, UserProfile } from "./store";

export type StreamEvent =
  | { type: "route"; route: "workout" | "nutrition" | "general" }
  | { type: "text"; chunk: string }
  | { type: "profile"; patch: Partial<UserProfile> }
  | { type: "done" }
  | { type: "error"; message: string };

export type Attachment = {
  kind: "audio" | "image";
  mimeType: string;
  base64: string;
};

export interface SendOptions {
  messages: ChatMessage[];
  profile: UserProfile;
  attachment?: Attachment | null;
  onEvent: (e: StreamEvent) => void;
  signal?: AbortSignal;
}

export async function streamChat(opts: SendOptions): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: opts.messages.map((m) => ({ from: m.from, text: m.text })),
      profile: opts.profile,
      attachment: opts.attachment ?? null,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    let errMsg = `request failed: ${res.status}`;
    try {
      const j = await res.json();
      if (j.error) errMsg = j.error;
    } catch {}
    opts.onEvent({ type: "error", message: errMsg });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      try {
        const evt = JSON.parse(line) as StreamEvent;
        opts.onEvent(evt);
      } catch (err) {
        console.error("stream parse error", err, line);
      }
    }
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
