import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import {
  PrivacyCashClient,
  fetchMerkleProof,
  setBackendUrl,
  type Signer,
  type WithdrawResult,
} from "privacy-cash-sdk";
import type { SendToken } from "./constants";
import { EXTRA_MIX_DELAY_MS, TOKEN_META } from "./constants";

let backendConfigured = false;

export function configurePrivacyCashBackend(): void {
  if (backendConfigured) return;
  const url =
    process.env.NEXT_PUBLIC_PRIVACY_CASH_BACKEND_URL ??
    "https://api3.privacycash.org";
  setBackendUrl(url.replace(/\/$/, ""));
  backendConfigured = true;
}

export function walletToSigner(wallet: {
  publicKey: PublicKey | null;
  signMessage?: (msg: Uint8Array) => Promise<Uint8Array>;
  signTransaction?: (
    tx: VersionedTransaction
  ) => Promise<VersionedTransaction>;
}): Signer {
  if (!wallet.publicKey) throw new Error("Connect your wallet");
  if (!wallet.signMessage || !wallet.signTransaction) {
    throw new Error("Wallet must support signMessage and signTransaction");
  }
  return {
    publicKey: wallet.publicKey,
    signMessage: wallet.signMessage.bind(wallet),
    signTransaction: wallet.signTransaction.bind(wallet),
  };
}

export type ProgressCallback = (
  step: "preparing" | "depositing" | "mixing" | "sending"
) => void;

export interface PrivateSendOutcome {
  depositSignature?: string;
  withdrawSignature: string;
  result: WithdrawResult;
}

function mintForToken(token: SendToken): PublicKey {
  const mint = TOKEN_META[token].mint;
  if (!mint) throw new Error("SOL uses sendPrivateSOL");
  return mint;
}

export async function executePrivateSend(
  client: PrivacyCashClient,
  token: SendToken,
  amountRaw: bigint,
  recipient: PublicKey,
  extraMix: boolean,
  onProgress?: ProgressCallback
): Promise<PrivateSendOutcome> {
  configurePrivacyCashBackend();
  onProgress?.("preparing");
  await client.init();
  await client.unlock();

  const recipientStr = recipient.toBase58();
  const amount =
    token === "SOL" ? Number(amountRaw) : amountRaw.toString();

  if (!extraMix || token === "SOL") {
    onProgress?.("depositing");
    onProgress?.("sending");
    if (token === "SOL") {
      const result = await client.sendPrivateSOL(
        Number(amountRaw),
        recipientStr,
        { relay: true }
      );
      return { withdrawSignature: result.signature, result };
    }
    const mint = mintForToken(token);
    const result = await client.sendPrivateSPL(
      mint,
      amount,
      recipientStr,
      { relay: true }
    );
    return { withdrawSignature: result.signature, result };
  }

  const mint = mintForToken(token);
  const treeKey = mint.toBase58();
  onProgress?.("depositing");
  const dep = await client.depositSPL(mint, amount);
  await client.syncNotes(treeKey, true).catch(() => undefined);
  await waitForMerkleProof(treeKey, dep.leafIndex);

  onProgress?.("mixing");
  await sleep(EXTRA_MIX_DELAY_MS);
  await client.syncNotes(treeKey, true).catch(() => undefined);

  onProgress?.("sending");
  const result = await client.withdrawSPL(mint, amount, recipientStr, {
    relay: true,
  });
  return {
    depositSignature: dep.signature,
    withdrawSignature: result.signature,
    result,
  };
}

async function waitForMerkleProof(
  treeKey: string,
  leafIndex: number,
  timeoutMs = 30_000
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetchMerkleProof(treeKey, leafIndex);
      return;
    } catch {
      await sleep(1_000);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function createPrivacyClient(signer: Signer): PrivacyCashClient {
  configurePrivacyCashBackend();
  return new PrivacyCashClient(signer);
}
