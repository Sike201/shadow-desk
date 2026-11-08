import { PublicKey } from "@solana/web3.js";

export type SendToken = "SOL" | "USDC" | "USDT";

export const TOKEN_META: Record<
  SendToken,
  { label: string; mint: PublicKey | null; decimals: number; symbol: string }
> = {
  SOL: {
    label: "Solana",
    mint: null,
    decimals: 9,
    symbol: "SOL",
  },
  USDC: {
    label: "USD Coin",
    mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    decimals: 6,
    symbol: "USDC",
  },
  USDT: {
    label: "Tether",
    mint: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
    decimals: 6,
    symbol: "USDT",
  },
};

/** UI copy — actual fees come from the Privacy Cash relayer at runtime. */
export const ESTIMATED_PRIVATE_FEE = "~0.001 SOL relayer + pool fee";
export const ESTIMATED_PUBLIC_FEE = "~0.000005 SOL network";
export const ESTIMATED_PRIVATE_TIME = "1–3 min";
export const ESTIMATED_PUBLIC_TIME = "~30 sec";

export const EXTRA_MIX_DELAY_MS = 2_500;
