"use client";

export function RecipientInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5 pt-1">
      <label className="readable text-xs font-medium text-zinc-400">
        Recipient
      </label>
      <input
        type="text"
        spellCheck={false}
        autoComplete="off"
        placeholder="Wallet address"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        className="readable w-full border-b border-white/20 bg-transparent py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/80"
      />
    </div>
  );
}
