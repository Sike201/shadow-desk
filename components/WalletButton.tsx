"use client";

import { useShadowWallet } from "@/hooks/useShadowWallet";

function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const {
    ready,
    authenticated,
    walletAddress,
    needsWalletSession,
    connect,
    logout,
  } = useShadowWallet();

  if (!ready) {
    return (
      <span className="text-xs text-zinc-500" aria-live="polite">
        Loading…
      </span>
    );
  }

  if (!authenticated || !walletAddress) {
    return (
      <button
        type="button"
        onClick={connect}
        className="rounded-full bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-500 sm:text-sm"
      >
        Connect wallet
      </button>
    );
  }

  if (needsWalletSession) {
    return (
      <button
        type="button"
        onClick={connect}
        className="rounded-full bg-amber-600/90 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-500 sm:text-sm"
        title={walletAddress}
      >
        Enable {shortAddress(walletAddress)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/5 sm:text-sm"
      title={walletAddress}
    >
      {shortAddress(walletAddress)}
    </button>
  );
}
