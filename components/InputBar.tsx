"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";

export interface ImageAttachment {
  dataUrl: string;
  mimeType: string;
  base64: string;
  name: string;
}

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string, image?: ImageAttachment | null) => void;
  onVoice: (audioBlob: Blob, durationSec: number) => void;
  disabled?: boolean;
}

export function InputBar({
  value,
  onChange,
  onSend,
  onVoice,
  disabled,
}: InputBarProps) {
  const [recording, setRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [pendingImage, setPendingImage] = useState<ImageAttachment | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
  }, [value]);

  function handleSend() {
    const trimmed = value.trim();
    // Allow sending even with no text if there's an image attached
    if (!trimmed && !pendingImage) return;
    if (disabled) return;
    onSend(trimmed || "what's in this photo?", pendingImage);
    onChange("");
    setPendingImage(null);
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function openFilePicker() {
    if (disabled) return;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("please pick an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("image too large — keep it under 8 MB");
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    const base64 = dataUrl.split(",")[1] ?? "";
    setPendingImage({
      dataUrl,
      mimeType: file.type,
      base64,
      name: file.name,
    });
    // Pre-focus the input so the user can type a question alongside the photo
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function startRecording() {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const dur = (Date.now() - startTimeRef.current) / 1000;
        stream.getTracks().forEach((t) => t.stop());
        if (blob.size > 1000 && dur > 0.4) {
          onVoice(blob, dur);
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      startTimeRef.current = Date.now();
      setRecording(true);
      setRecordingMs(0);
      intervalRef.current = setInterval(() => {
        setRecordingMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch (err) {
      console.error("mic permission denied", err);
      alert("mic access needed for voice notes");
    }
  }

  function stopRecording(send: boolean) {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!send) {
      chunksRef.current = [];
    }
    mr.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const hasContent = value.trim().length > 0 || !!pendingImage;

  return (
    <div className="relative bg-[var(--color-imsg-header-bg)] backdrop-blur-2xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* image preview row (above input) */}
      {pendingImage && !recording && (
        <div className="px-3 pt-2">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage.dataUrl}
              alt="preview"
              className="h-16 w-16 rounded-xl border border-black/10 object-cover shadow-sm"
            />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-white shadow"
              aria-label="remove image"
            >
              <XIcon />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 pb-5 pt-2">
        {!recording ? (
          <>
            <button
              onClick={openFilePicker}
              disabled={disabled}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9e9eb] text-imsg-text transition active:scale-90 disabled:opacity-40"
              aria-label="upload photo"
              title="upload food photo"
            >
              <PlusIcon />
            </button>
            <div className="flex flex-1 items-end rounded-[20px] border border-black/10 bg-white">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKey}
                disabled={disabled}
                rows={1}
                placeholder={pendingImage ? "ask about this photo…" : "iMessage"}
                className="max-h-[100px] flex-1 resize-none bg-transparent px-3 py-1.5 font-ios text-[16px] leading-[1.28] text-imsg-text placeholder-[#8a8a8e] outline-none"
              />
              {hasContent ? (
                <button
                  onClick={handleSend}
                  disabled={disabled}
                  className="m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-imsg-blue)] text-white transition active:scale-90 disabled:opacity-40"
                  aria-label="send"
                >
                  <ArrowUpIcon />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={disabled}
                  className="m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-imsg-text transition active:scale-90 disabled:opacity-40"
                  aria-label="record voice note"
                >
                  <MicIcon />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex w-full items-center gap-2 rounded-[20px] border border-black/10 bg-white p-1">
            <button
              onClick={() => stopRecording(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9e9eb] text-imsg-text transition active:scale-90"
              aria-label="cancel"
            >
              <XIcon />
            </button>
            <div className="flex flex-1 items-center gap-2 px-2 font-ios text-[13px] text-imsg-text">
              <span className="block h-2 w-2 rounded-full bg-red-500 mic-recording" />
              <span className="tabular-nums text-[#8a8a8e]">
                {fmt(recordingMs)}
              </span>
              <Waveform ms={recordingMs} />
            </div>
            <button
              onClick={() => stopRecording(true)}
              className="m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-imsg-blue)] text-white transition active:scale-90"
              aria-label="send voice"
            >
              <ArrowUpIcon />
            </button>
          </div>
        )}
      </div>

      {/* iOS home indicator */}
      <div className="flex justify-center pb-1.5">
        <span className="block h-[5px] w-[134px] rounded-full bg-imsg-text" />
      </div>
    </div>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5v11M1.5 7h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 12V2M2 7l5-5 5 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="5.5"
        y="1.5"
        width="5"
        height="9"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 7v0a5 5 0 0 0 10 0v0M8 12.5V14.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 2l8 8M10 2l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Waveform({ ms }: { ms: number }) {
  const bars = 18;
  return (
    <div className="flex h-5 flex-1 items-center gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 4 + Math.abs(Math.sin((ms / 120 + i) * 0.7)) * 14;
        return (
          <span
            key={i}
            className="block w-[2px] rounded-full bg-[var(--color-imsg-blue)]"
            style={{ height: `${h}px`, opacity: 0.5 + (h / 20) * 0.5 }}
          />
        );
      })}
    </div>
  );
}
