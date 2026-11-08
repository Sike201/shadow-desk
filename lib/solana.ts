import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import type { SendToken } from "./constants";
import { TOKEN_META } from "./constants";

export function getConnection(): Connection {
  const url =
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL ??
    "https://api.mainnet-beta.solana.com";
  return new Connection(url, "confirmed");
}

export function parseAmount(raw: string, token: SendToken): bigint {
  const trimmed = raw.trim();
  if (!trimmed || !/^\d*\.?\d+$/.test(trimmed)) {
    throw new Error("Enter a valid amount");
  }
  const { decimals } = TOKEN_META[token];
  const [whole, frac = ""] = trimmed.split(".");
  if (frac.length > decimals) {
    throw new Error(`Max ${decimals} decimal places for ${token}`);
  }
  const padded = frac.padEnd(decimals, "0");
  const combined = `${whole || "0"}${padded}`.replace(/^0+(?=\d)/, "");
  return BigInt(combined || "0");
}

export function formatAmount(raw: bigint, token: SendToken): string {
  const { decimals } = TOKEN_META[token];
  const s = raw.toString().padStart(decimals + 1, "0");
  const whole = s.slice(0, -decimals) || "0";
  const frac = s.slice(-decimals).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}

export async function fetchSpendableBalance(
  connection: Connection,
  owner: PublicKey,
  token: SendToken
): Promise<bigint> {
  if (token === "SOL") {
    const lamports = await connection.getBalance(owner);
    const reserve = 5_000_000n;
    const bal = BigInt(lamports);
    return bal > reserve ? bal - reserve : 0n;
  }
  const mint = TOKEN_META[token].mint!;
  const ata = getAssociatedTokenAddressSync(mint, owner);
  try {
    const acc = await connection.getTokenAccountBalance(ata);
    return BigInt(acc.value.amount);
  } catch {
    return 0n;
  }
}

export async function sendPublicTransfer(
  connection: Connection,
  payer: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  recipient: PublicKey,
  token: SendToken,
  amountRaw: bigint
): Promise<string> {
  if (amountRaw <= 0n) throw new Error("Amount must be greater than zero");

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: payer,
    blockhash,
    lastValidBlockHeight,
  });

  if (token === "SOL") {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: recipient,
        lamports: Number(amountRaw),
      })
    );
  } else {
    const mint = TOKEN_META[token].mint!;
    await getMint(connection, mint);
    const source = getAssociatedTokenAddressSync(mint, payer);
    const dest = getAssociatedTokenAddressSync(mint, recipient);
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        dest,
        recipient,
        mint
      ),
      createTransferInstruction(source, dest, payer, amountRaw)
    );
  }

  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
  });
  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed"
  );
  return sig;
}

export function lamportsToSol(lamports: bigint): string {
  return (Number(lamports) / LAMPORTS_PER_SOL).toFixed(4);
}
