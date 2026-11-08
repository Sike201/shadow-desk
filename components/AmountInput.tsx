"use client";

import type { SendToken } from "@/lib/constants";
import { TOKEN_META } from "@/lib/constants";

export function AmountInput({
  token,
  value,
  onChange,
  onMax,
  balanceLabel,
}: {
  token: SendToken;
  value: string;
  onChange: (v: string) => void;
  onMax: () => void;
  balanceLabel?: string;
}) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="readable font-medium text-violet-300">Amount</span>
        {balanceLabel ? (
          <button
            type="button"
            onClick={onMax}
            className="readable text-zinc-400 transition hover:text-white"
          >
            Balance: {balanceLabel}
          </button>
        ) : (
          <span className="readable text-zinc-500">{TOKEN_META[token].symbol}</span>
        )}
      </div>

      <div className="flex items-end gap-2 border-b border-white/20 pb-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="readable min-w-0 flex-1 bg-transparent font-sans text-3xl font-medium tracking-tight text-white outline-none placeholder:text-zinc-600 sm:text-4xl"
        />
        <button
          type="button"
          onClick={onMax}
          className="readable mb-1 shrink-0 text-xs font-semibold text-violet-300 transition hover:text-violet-200"
        >
          Max
        </button>
      </div>
    </div>
  );
}
