import type { PrivyClientConfig } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

function solanaRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL ??
    "https://api.mainnet-beta.solana.com"
  );
}

function solanaWsUrl(httpsUrl: string): string {
  if (httpsUrl.startsWith("https://")) {
    return `wss://${httpsUrl.slice("https://".length)}`;
  }
  return "wss://api.mainnet-beta.solana.com";
}

export function buildPrivyConfig(): PrivyClientConfig {
  const rpc = solanaRpcUrl();
  const ws = solanaWsUrl(rpc);

  return {
    appearance: {
      theme: "dark",
      walletChainType: "solana-only",
      showWalletLoginFirst: true,
      walletList: [
        "phantom",
        "solflare",
        "backpack",
        "jupiter",
        "detected_solana_wallets",
      ],
    },
    loginMethods: ["wallet", "email"],
    embeddedWallets: {
      solana: {
        createOnLogin: "users-without-wallets",
      },
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors({ shouldAutoConnect: true }),
      },
    },
    solana: {
      rpcs: {
        "solana:mainnet": {
          rpc: createSolanaRpc(rpc),
          rpcSubscriptions: createSolanaRpcSubscriptions(ws),
        },
      },
    },
  };
}
