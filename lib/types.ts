export type PrivateBalance = {
  sol: number;
  usdc: number;
  shielded: boolean;
};

export type PrivatePosition = {
  id: string;
  mint: string;
  symbol: string;
  amount: number;
  entrySol: number;
  currentValueSol: number;
  pnlPct: number;
  openedAt: number;
};

export type BuyStep =
  | "idle"
  | "withdraw"
  | "fund"
  | "buy"
  | "reshield"
  | "done"
  | "error";

export type BuyProgress = {
  step: BuyStep;
  mint?: string;
  solAmount?: number;
  message?: string;
};
