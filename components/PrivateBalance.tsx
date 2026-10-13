"use client";

import { useEffect, useState } from "react";
import { EyeOff, Shield } from "lucide-react";
import { getPrivateBalance, subscribeShadowState, umbraMode } from "@/lib/umbra";
import type { PrivateBalance as Balance } from "@/lib/types";

export function PrivateBalance() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    const sync = () => setBalance(getPrivateBalance());
    sync();
    return subscribeShadowState(sync);
  }, []);

  return (
    <section className="panel relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-neon/10 blur-2xl" />
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-neon" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Private Balance
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500 hover:text-neon"
        >
          <EyeOff className="h-3 w-3" />
          {revealed ? "cloak" : "peek"}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">SOL</p>
          <p className="font-mono text-3xl font-semibold text-neon tabular-nums">
            {balance && revealed ? balance.sol.toFixed(4) : "••••••"}
          </p>
        </div>
        <div className="flex items-end justify-between border-t border-white/5 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">USDC</p>
            <p className="font-mono text-xl text-zinc-100 tabular-nums">
              {balance && revealed ? balance.usdc.toFixed(2) : "••••"}
            </p>
          </div>
          <span className="rounded-sm border border-neon/30 bg-neon/5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-neon">
            {balance?.shielded ? "shielded" : "exposed"} · {umbraMode}
          </span>
        </div>
      </div>
    </section>
  );
}
