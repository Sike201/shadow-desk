"use client";

import { Connection } from "@solana/web3.js";
import { createContext, useContext, useMemo } from "react";

const ConnectionContext = createContext<Connection | null>(null);

export function SolanaConnectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const connection = useMemo(
    () =>
      new Connection(
        process.env.NEXT_PUBLIC_HELIUS_RPC_URL ??
          "https://api.mainnet-beta.solana.com",
        "confirmed"
      ),
    []
  );

  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useSolanaConnection(): Connection {
  const connection = useContext(ConnectionContext);
  if (!connection) {
    throw new Error("SolanaConnectionProvider is missing");
  }
  return connection;
}
