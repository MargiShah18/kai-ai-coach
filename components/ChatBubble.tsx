"use client";

import { ReactNode } from "react";

interface ChatBubbleProps {
  from: "user" | "kai";
  children: ReactNode;
  showTail?: boolean;
  timestamp?: string;
}

export function ChatBubble({
  from,
  children,
  showTail = true,
  timestamp,
}: ChatBubbleProps) {
  const isUser = from === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} bubble-in`}
    >
      <div
        className={`relative max-w-[78%] px-3.5 py-2 font-ios text-[16px] leading-[1.28] ${
          isUser
            ? "bg-[var(--color-imsg-blue)] text-white"
            : "bg-[var(--color-imsg-gray)] text-imsg-text"
        }`}
        style={{
          // All corners rounded normally EXCEPT the corner that the tail attaches to,
          // which is squared off so the SVG tail blends in seamlessly.
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomLeftRadius: !isUser && showTail ? 0 : 18,
          borderBottomRightRadius: isUser && showTail ? 0 : 18,
        }}
      >
        <div className="whitespace-pre-wrap break-words">{children}</div>
        {timestamp && (
          <span className="mt-1 block text-right text-[10px] opacity-60">
            {timestamp}
          </span>
        )}
        {showTail && <Tail isUser={isUser} />}
      </div>
    </div>
  );
}

/**
 * Inline SVG tail. Sits flush against the bubble's squared-off bottom corner
 * and curves outward to form an iMessage "scoop". Same fill color as the bubble
 * so it reads as one continuous shape.
 *
 * Path explanation (right tail):
 *   M0 0       — start at top-left (which is touching the bubble's bottom-right corner)
 *   V8         — straight vertical line down 8px (this hugs the bubble's right edge)
 *   C0 13 4 16 11 16  — cubic bezier curving outward and down to the tip
 *   H0 Z       — straight back to start, closing the shape at the bubble's bottom edge
 */
function Tail({ isUser }: { isUser: boolean }) {
  const color = isUser
    ? "var(--color-imsg-blue)"
    : "var(--color-imsg-gray)";

  if (isUser) {
    return (
      <svg
        aria-hidden
        width="11"
        height="16"
        viewBox="0 0 11 16"
        className="pointer-events-none absolute bottom-0 -right-[6px]"
        style={{ display: "block", overflow: "visible" }}
      >
        <path
          d="M0 0 V10 C0 13.5 2.5 16 6 16 H11 C7 14.5 5 12 5 8 V0 Z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      width="11"
      height="16"
      viewBox="0 0 11 16"
      className="pointer-events-none absolute bottom-0 -left-[6px]"
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d="M11 0 V10 C11 13.5 8.5 16 5 16 H0 C4 14.5 6 12 6 8 V0 Z"
        fill={color}
      />
    </svg>
  );
}

export function TypingBubble() {
  return (
    <div className="flex justify-start bubble-in">
      <div
        className="relative bg-[var(--color-imsg-gray)] px-4 py-3"
        style={{
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomRightRadius: 18,
          borderBottomLeftRadius: 0,
        }}
      >
        <div className="flex items-center gap-1">
          <span className="typing-dot h-2 w-2 rounded-full bg-[#8a8a8e]" />
          <span className="typing-dot h-2 w-2 rounded-full bg-[#8a8a8e]" />
          <span className="typing-dot h-2 w-2 rounded-full bg-[#8a8a8e]" />
        </div>
        <Tail isUser={false} />
      </div>
    </div>
  );
}
