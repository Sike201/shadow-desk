"use client";

import type { SendToken } from "@/lib/constants";

export function PrivateSendToggle({
  enabled,
  onChange,
  extraMix,
  onExtraMixChange,
  token,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  extraMix: boolean;
  onExtraMixChange: (v: boolean) => void;
  token: SendToken;
}) {
  const showExtraMix =
    enabled && (token === "USDC" || token === "USDT");

  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="readable text-sm font-medium text-white">
            Private Send
          </p>
          <p className="readable mt-0.5 text-xs text-zinc-400">
            Unlinkable transfer via Privacy Cash
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onChange(!enabled)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            enabled ? "bg-violet-500" : "bg-zinc-600"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {showExtraMix ? (
        <label className="readable flex cursor-pointer items-start gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={extraMix}
            onChange={(e) => onExtraMixChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-500 bg-transparent accent-violet-500"
          />
          <span>
            <span className="font-medium text-zinc-200">Extra Mix</span>{" "}
            (recommended for stablecoins)
          </span>
        </label>
      ) : null}
    </div>
  );
}
