"use client";

import { useEffect, useRef, useState } from "react";
import { BrandShell } from "@/components/BrandShell";
import { IPhoneFrame } from "@/components/IPhoneFrame";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatBubble, TypingBubble } from "@/components/ChatBubble";
import { InputBar, type ImageAttachment } from "@/components/InputBar";
import { useBoStore, type ChatMessage } from "@/lib/store";
import { streamChat, blobToBase64, type Attachment } from "@/lib/chatClient";

const ONBOARDING_SEED = {
  id: "seed-bo-greeting",
  from: "bo" as const,
  text: "hey!! welcome 👋 i'm Kai, your ai health coach. what's your name?",
  ts: Date.now(),
  _agent: "general" as const,
};

export default function Home() {
  const messages = useBoStore((s) => s.messages);
  const hasStarted = useBoStore((s) => s.hasStarted);
  const addMessage = useBoStore((s) => s.addMessage);
  const updateLastBoMessage = useBoStore((s) => s.updateLastBoMessage);
  const setProfile = useBoStore((s) => s.setProfile);
  const start = useBoStore((s) => s.start);
  const reset = useBoStore((s) => s.reset);

  const [sending, setSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
    if (!hasStarted) {
      const existing = useBoStore.getState().messages;
      if (existing.length === 0) {
        addMessage(ONBOARDING_SEED);
      }
      start();
    }
  }, [hasStarted, addMessage, start]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(
    text: string,
    attachment?: Attachment | null,
    imageDataUrl?: string
  ) {
    if (sending) return;
    setErrorBanner(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      from: "user",
      text,
      ts: Date.now(),
      imageDataUrl,
    };
    addMessage(userMsg);

    const boMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      from: "bo",
      text: "",
      ts: Date.now() + 1,
    };
    addMessage(boMsg);

    setSending(true);
    let receivedAnyText = false;
    try {
      const allMessages = [...useBoStore.getState().messages].slice(0, -1);
      let currentAgent: ChatMessage["_agent"] | undefined;

      await streamChat({
        messages: allMessages,
        profile: useBoStore.getState().profile,
        attachment: attachment ?? null,
        onEvent: (evt) => {
          if (evt.type === "route") {
            currentAgent = evt.route;
          } else if (evt.type === "text") {
            receivedAnyText = true;
            updateLastBoMessage(evt.chunk, currentAgent);
          } else if (evt.type === "profile") {
            setProfile(evt.patch);
          } else if (evt.type === "error") {
            setErrorBanner(evt.message);
            updateLastBoMessage(friendlyError(evt.message), currentAgent);
            receivedAnyText = true;
          }
        },
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "network error";
      setErrorBanner(msg);
      if (!receivedAnyText) {
        updateLastBoMessage(friendlyError(msg), undefined);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleSendFromInput(text: string, image?: ImageAttachment | null) {
    if (image) {
      await send(
        text,
        { kind: "image", mimeType: image.mimeType, base64: image.base64 },
        image.dataUrl
      );
    } else {
      await send(text);
    }
  }

  async function sendVoice(blob: Blob) {
    const base64 = await blobToBase64(blob);
    await send("🎤 voice note", {
      kind: "audio",
      mimeType: blob.type,
      base64,
    });
  }

  function handlePreset(text: string) {
    setInputValue(text);
  }

  // Show typing indicator while bo's last message is empty
  const lastMessage = messages[messages.length - 1];
  const showTyping =
    sending && lastMessage?.from === "bo" && lastMessage.text.length === 0;

  return (
    <BrandShell onPreset={handlePreset}>
      <div className="origin-center scale-[0.82] sm:scale-[0.92] md:scale-100">
        <IPhoneFrame>
          <div className="flex h-full flex-col bg-imsg-bg">
            <ChatHeader status={sending ? "typing…" : "Active now"} />

            <div
              ref={scrollRef}
              className="chat-scroll flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pt-3 pb-2"
            >
              {!hydrated ? null : (
                <>
                  <DateDivider />
                  {messages.map((m, i) => {
                    if (m.from === "bo" && m.text.length === 0) return null;
                    const prev = messages[i - 1];
                    const showTail = !prev || prev.from !== m.from;
                    return (
                      <div key={m.id} className={showTail ? "mt-2" : ""}>
                        <ChatBubble from={m.from} showTail={showTail}>
                          {m.imageDataUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.imageDataUrl}
                              alt="user upload"
                              className="mb-1.5 max-h-48 w-full rounded-[12px] object-cover"
                            />
                          )}
                          {renderText(m.text)}
                        </ChatBubble>
                      </div>
                    );
                  })}
                  {showTyping && (
                    <div className="mt-2">
                      <TypingBubble />
                    </div>
                  )}
                </>
              )}
            </div>

            {errorBanner && (
              <div className="mx-3 mb-1 rounded-lg bg-red-50 px-3 py-2 font-ios text-[12px] text-red-700">
                {errorBanner}
              </div>
            )}

            <InputBar
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendFromInput}
              onVoice={sendVoice}
              disabled={sending}
            />
          </div>
        </IPhoneFrame>
      </div>

      <button
        onClick={() => {
          if (confirm("Reset the demo? This wipes the chat and profile.")) {
            reset();
            location.reload();
          }
        }}
        className="fixed bottom-4 right-4 rounded-full border border-bo-line bg-bo-bg-2/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-bo-muted backdrop-blur transition hover:text-bo-ink"
        aria-label="reset demo"
      >
        reset demo
      </button>
    </BrandShell>
  );
}

function friendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("api key") || m.includes("api_key") || m.includes("permission")) {
    return "(your gemini api key isn't working — double-check .env.local and restart the dev server)";
  }
  if (m.includes("not found") || m.includes("404") || m.includes("model")) {
    return "(this gemini model isn't available on your key — set GEMINI_AGENT_MODEL=gemini-2.5-flash in .env.local and restart)";
  }
  if (m.includes("quota") || m.includes("rate") || m.includes("429")) {
    return "(rate limited by gemini — wait a few seconds and try again)";
  }
  if (m.includes("fetch failed") || m.includes("network")) {
    return "(can't reach gemini — check your internet connection)";
  }
  return `(error: ${raw.slice(0, 140)})`;
}

function DateDivider() {
  return (
    <div className="my-2 flex items-center justify-center gap-1.5 font-ios text-[11px] font-medium uppercase tracking-wide text-imsg-meta">
      <span>iMessage · today</span>
    </div>
  );
}

function renderText(text: string) {
  return text.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
