"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { buildPrivyConfig } from "@/lib/privy-config";
import { SolanaConnectionProvider } from "@/components/SolanaConnectionProvider";
import { useMemo } from "react";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
  const config = useMemo(() => buildPrivyConfig(), []);

  return (
    <PrivyProvider appId={appId} config={config}>
      <SolanaConnectionProvider>{children}</SolanaConnectionProvider>
    </PrivyProvider>
  );
}
