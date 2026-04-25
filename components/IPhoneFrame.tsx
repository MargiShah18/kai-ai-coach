"use client";

import { ReactNode } from "react";

interface IPhoneFrameProps {
  children: ReactNode;
}

/**
 * Pixel-faithful iPhone 15 Pro mockup with Dynamic Island.
 * Matte titanium frame, hardware buttons rendered via box-shadow tricks.
 */
export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="relative">
      {/* hardware buttons */}
      <div className="pointer-events-none absolute -left-[3px] top-[110px] h-8 w-[3px] rounded-l-sm bg-[#1a1a1c]" />
      <div className="pointer-events-none absolute -left-[3px] top-[170px] h-14 w-[3px] rounded-l-sm bg-[#1a1a1c]" />
      <div className="pointer-events-none absolute -left-[3px] top-[240px] h-14 w-[3px] rounded-l-sm bg-[#1a1a1c]" />
      <div className="pointer-events-none absolute -right-[3px] top-[150px] h-20 w-[3px] rounded-r-sm bg-[#1a1a1c]" />

      {/* outer titanium frame */}
      <div
        className="relative rounded-[54px] p-[3px]"
        style={{
          background:
            "linear-gradient(150deg, #4a4845 0%, #2d2c29 22%, #1a1917 50%, #2d2c29 78%, #4a4845 100%)",
          boxShadow:
            "0 50px 90px -20px rgba(0,0,0,0.7), 0 20px 40px -15px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* glass bezel */}
        <div
          className="rounded-[51px] p-[7px]"
          style={{
            background:
              "linear-gradient(140deg, #0d0d0e, #050505 40%, #0a0a0b 60%, #1a1a1b)",
          }}
        >
          {/* screen */}
          <div className="relative h-[700px] w-[345px] overflow-hidden rounded-[44px] bg-white">
            {/* dynamic island */}
            <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-[28px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
