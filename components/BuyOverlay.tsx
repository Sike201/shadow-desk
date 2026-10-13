"use client";

import { Loader2 } from "lucide-react";

export function BuyOverlay({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-6 backdrop-blur-[2px] sm:items-center">
      <div className="pointer-events-auto w-full max-w-md border border-neon/40 bg-[#0a0c0a]/95 p-5 shadow-[0_0_40px_rgba(57,255,20,0.12)]">
        <div className="mb-3 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-neon" />
          <p className="text-xs uppercase tracking-[0.24em] text-neon">
            Private execution
          </p>
        </div>
        <p className="font-mono text-sm text-zinc-200">{label}</p>
        <div className="mt-4 h-1 w-full overflow-hidden bg-zinc-900">
          <div className="h-full w-1/2 animate-pulse bg-neon/80" />
        </div>
      </div>
    </div>
  );
}
