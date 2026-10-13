import { clusterApiUrl } from "@solana/web3.js";

export function getRpcEndpoint() {
  return (
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL ||
    clusterApiUrl(
      (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "devnet" | "mainnet-beta" | "testnet") ||
        "devnet"
    )
  );
}
