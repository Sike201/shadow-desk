"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  return (
    <WalletMultiButton className="!h-10 !rounded-none !border !border-neon/40 !bg-black/70 !px-4 !font-mono !text-xs !uppercase !tracking-[0.18em] !text-neon hover:!bg-neon/10" />
  );
}
