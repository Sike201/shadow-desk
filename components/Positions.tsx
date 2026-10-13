"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { getPrivatePositions, subscribeShadowState } from "@/lib/umbra";
import type { PrivatePosition } from "@/lib/types";

function shorten(mint: string) {
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export function Positions() {
  const [positions, setPositions] = useState<PrivatePosition[]>([]);

  useEffect(() => {
    const sync = () => setPositions(getPrivatePositions());
    sync();
    return subscribeShadowState(sync);
  }, []);

  return (
    <section className="panel flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-neon" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Private Positions
        </h2>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {positions.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No shadow bags yet. Whisper a mint to Shadow.
          </p>
        ) : (
          positions.map((p) => {
            const up = p.pnlPct >= 0;
            return (
              <article
                key={p.id}
                className="border border-white/5 bg-black/40 px-3 py-3 transition hover:border-neon/25"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-zinc-100">{p.symbol}</span>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      up ? "text-neon" : "text-rose-400"
                    }`}
                  >
                    {up ? "+" : ""}
                    {p.pnlPct.toFixed(2)}%
                  </span>
                </div>
                <p className="mb-2 font-mono text-[10px] text-zinc-500">
                  {shorten(p.mint)}
                </p>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-zinc-400">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                      size
                    </p>
                    <p className="tabular-nums text-zinc-200">
                      {p.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                      entry
                    </p>
                    <p className="tabular-nums text-zinc-200">
                      {p.entrySol.toFixed(3)}◎
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                      mark
                    </p>
                    <p className="tabular-nums text-zinc-200">
                      {p.currentValueSol.toFixed(3)}◎
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
