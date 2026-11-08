"use client";

import { useCallback, useMemo } from "react";
import { useConnectWallet, usePrivy, useUser } from "@privy-io/react-auth";
import {
  useSignMessage,
  useSignTransaction,
  useWallets,
  type ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

const PREFERRED_WALLET_NAMES = [
  "phantom",
  "solflare",
  "backpack",
  "privy",
] as const;

function walletName(w: ConnectedStandardSolanaWallet): string {
  return (w.standardWallet?.name ?? "").toLowerCase();
}

function isLikelySolanaSigner(w: ConnectedStandardSolanaWallet): boolean {
  const name = walletName(w);
  if (name.includes("metamask")) return false;
  if (name.includes("jupiter") && name.includes("wallet")) return false;
  return true;
}

function pickWallet(
  wallets: ConnectedStandardSolanaWallet[]
): ConnectedStandardSolanaWallet | null {
  if (wallets.length === 0) return null;
  if (wallets.length === 1) return wallets[0];

  for (const preferred of PREFERRED_WALLET_NAMES) {
    const match = wallets.find((w) => walletName(w).includes(preferred));
    if (match) return match;
  }

  const signers = wallets.filter(isLikelySolanaSigner);
  return signers[0] ?? wallets[0];
}

function linkedSolanaAddress(
  linkedAccounts: { type: string; chainType?: string; address?: string }[]
): string | null {
  for (const account of linkedAccounts) {
    if (account.type !== "wallet") continue;
    if (account.chainType !== "solana") continue;
    if (account.address) return account.address;
  }
  return null;
}

export function useShadowWallet() {
  const { ready: privyReady, authenticated, login, logout } = usePrivy();
  const { user } = useUser();
  const { connectWallet } = useConnectWallet();
  const { ready: walletsReady, wallets } = useWallets();
  const { signMessage: privySignMessage } = useSignMessage();
  const { signTransaction: privySignTransaction } = useSignTransaction();

  const wallet = useMemo(() => pickWallet(wallets), [wallets]);

  const linkedAddress = useMemo(
    () => linkedSolanaAddress(user?.linkedAccounts ?? []),
    [user?.linkedAccounts]
  );

  const addressForDisplay = wallet?.address ?? linkedAddress;

  const publicKey = useMemo(() => {
    if (!addressForDisplay) return null;
    try {
      return new PublicKey(addressForDisplay);
    } catch {
      return null;
    }
  }, [addressForDisplay]);

  const ready = privyReady && walletsReady;
  const needsWalletSession = authenticated && !wallet;

  const solanaLoginOptions = useMemo(
    () => ({
      disableSignup: false,
      walletChainType: "solana-only" as const,
      loginMethods: ["wallet", "email"] as Array<"wallet" | "email">,
    }),
    []
  );

  const connect = useCallback(() => {
    if (!authenticated) {
      login(solanaLoginOptions);
      return;
    }
    connectWallet({ walletChainType: "solana-only" });
  }, [authenticated, connectWallet, login, solanaLoginOptions]);

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!wallet) {
        throw new Error(
          needsWalletSession
            ? "Select your Solana wallet again to sign (Phantom, Solflare, etc.)"
            : "Connect your wallet first"
        );
      }
      const { signature } = await privySignMessage({ message, wallet });
      return signature;
    },
    [needsWalletSession, privySignMessage, wallet]
  );

  const signTransaction = useCallback(
    async <T extends Transaction | VersionedTransaction>(
      tx: T
    ): Promise<T> => {
      if (!wallet) {
        throw new Error(
          needsWalletSession
            ? "Select your Solana wallet again to sign (Phantom, Solflare, etc.)"
            : "Connect your wallet first"
        );
      }

      const bytes =
        tx instanceof VersionedTransaction
          ? tx.serialize()
          : tx.serialize({ requireAllSignatures: false });

      const { signedTransaction } = await privySignTransaction({
        transaction: bytes,
        wallet,
        chain: "solana:mainnet",
      });

      if (tx instanceof VersionedTransaction) {
        return VersionedTransaction.deserialize(
          signedTransaction
        ) as T;
      }
      return Transaction.from(signedTransaction) as T;
    },
    [needsWalletSession, privySignTransaction, wallet]
  );

  return {
    ready,
    authenticated,
    publicKey,
    wallet,
    walletAddress: addressForDisplay,
    needsWalletSession,
    login,
    connect,
    logout,
    signMessage,
    signTransaction,
  };
}
