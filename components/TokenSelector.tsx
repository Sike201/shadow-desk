"use client";

import type { SendToken } from "@/lib/constants";
import { TOKEN_META } from "@/lib/constants";

const ORDER: SendToken[] = ["SOL", "USDC", "USDT"];

export function TokenSelector({
  value,
  onChange,
}: {
  value: SendToken;
  onChange: (t: SendToken) => void;
}) {
  return (
    <div className="flex justify-center gap-8 border-b border-white/15">
      {ORDER.map((token) => {
        const active = value === token;
        return (
          <button
            key={token}
            type="button"
            onClick={() => onChange(token)}
            className={`readable -mb-px border-b-2 pb-2 text-xs font-medium transition sm:text-sm ${
              active
                ? "border-violet-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {TOKEN_META[token].symbol}
          </button>
        );
      })}
    </div>
  );
}
