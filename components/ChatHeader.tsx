"use client";

interface ChatHeaderProps {
  status?: string;
}

export function ChatHeader({ status = "Active now" }: ChatHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-2xl"
      style={{ background: "var(--color-imsg-header-bg)" }}
    >
      {/* iOS status bar */}
      <div className="flex h-[40px] items-center justify-between px-6 pt-1 font-ios text-[14px] font-semibold text-imsg-text">
        <span className="tabular-nums">9:41</span>
        <span className="flex items-center gap-1">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </span>
      </div>

      {/* contact strip */}
      <div className="flex flex-col items-center gap-0.5 pb-1.5 pt-0.5">
        <div className="relative">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold text-bo-bg"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, #e7ff66, #c5ff1f 60%, #a3e000)",
            }}
          >
            K
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-[#34c759] pulse-ring" />
        </div>
        <div className="flex items-center gap-1.5 font-ios text-[11px] font-medium text-[#3c3c43]">
          <span className="text-[13px] font-semibold text-imsg-text">Kai</span>
          <span className="text-[10px]">›</span>
        </div>
        <span className="font-ios text-[10px] font-medium uppercase tracking-wider text-[#34c759]">
          {status}
        </span>
      </div>

      <div className="h-px bg-black/5" />
    </header>
  );
}

function SignalIcon() {
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor">
      <rect x="0" y="7" width="3" height="4" rx="0.7" />
      <rect x="5" y="5" width="3" height="6" rx="0.7" />
      <rect x="10" y="2.5" width="3" height="8.5" rx="0.7" />
      <rect x="15" y="0" width="3" height="11" rx="0.7" />
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <path d="M8.5 0C5.27 0 2.34 1.21 0 3.21l1.46 1.43A10.42 10.42 0 0 1 8.5 2.04c2.65 0 5.07.99 7.04 2.62L17 3.22A12.45 12.45 0 0 0 8.5 0Zm0 4.08a8.36 8.36 0 0 0-5.51 2.07l1.45 1.43A6.3 6.3 0 0 1 8.5 6.12c1.6 0 3.06.6 4.18 1.58l1.46-1.43A8.36 8.36 0 0 0 8.5 4.08Zm0 4.08a4.27 4.27 0 0 0-2.83 1.07L8.5 12l2.83-2.78A4.28 4.28 0 0 0 8.5 8.16Z" />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="22"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <rect x="2" y="2" width="19" height="9" rx="1.5" fill="currentColor" />
      <path
        d="M24 4v5a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 24 4Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}
