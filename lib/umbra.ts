import type { PrivateBalance, PrivatePosition } from "./types";

const STORAGE_KEY = "shadow-desk-state-v1";

export type ShadowState = {
  balance: PrivateBalance;
  positions: PrivatePosition[];
};

const DEFAULT_STATE: ShadowState = {
  balance: { sol: 12.48, usdc: 420.69, shielded: true },
  positions: [
    {
      id: "pos-1",
      mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      symbol: "BONK",
      amount: 1_240_000,
      entrySol: 0.08,
      currentValueSol: 0.112,
      pnlPct: 40,
      openedAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: "pos-2",
      mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
      symbol: "WIF",
      amount: 420,
      entrySol: 0.15,
      currentValueSol: 0.132,
      pnlPct: -12,
      openedAt: Date.now() - 1000 * 60 * 45,
    },
  ],
};

function readState(): ShadowState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as ShadowState;
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: ShadowState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getPrivateBalance(): PrivateBalance {
  return readState().balance;
}

export function getPrivatePositions(): PrivatePosition[] {
  return readState().positions;
}

export function subscribeShadowState(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("shadow-desk-update", listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("shadow-desk-update", listener);
  };
}

function bump() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("shadow-desk-update"));
  }
}

function shortSymbol(mint: string) {
  return mint.slice(0, 4).toUpperCase();
}

/**
 * Mock Umbra private buy pipeline.
 * Swap internals for real @umbra-privacy/sdk deposit/withdraw + pump buy later.
 */
export async function executePrivateBuy(
  mint: string,
  solAmount: number,
  onStep?: (label: string) => void
): Promise<{ ok: true; position: PrivatePosition } | { ok: false; error: string }> {
  if (!mint || mint.length < 32) {
    return { ok: false, error: "Invalid mint address" };
  }
  if (!(solAmount > 0)) {
    return { ok: false, error: "SOL amount must be > 0" };
  }

  const state = readState();
  if (solAmount > state.balance.sol) {
    return { ok: false, error: "Not enough private SOL in the vault" };
  }

  const steps = [
    { label: "Withdrawing from private balance…", ms: 900 },
    { label: "Funding ephemeral burner…", ms: 1100 },
    { label: "Buying on Pump…", ms: 1400 },
    { label: "Re-shielding tokens into Umbra…", ms: 1200 },
  ];

  for (const step of steps) {
    onStep?.(step.label);
    await new Promise((r) => setTimeout(r, step.ms));
  }

  const tokenAmount = Math.floor((solAmount / 0.000042) * (0.85 + Math.random() * 0.3));
  const drift = (Math.random() - 0.35) * 28;
  const currentValueSol = solAmount * (1 + drift / 100);

  const position: PrivatePosition = {
    id: `pos-${Date.now()}`,
    mint,
    symbol: shortSymbol(mint),
    amount: tokenAmount,
    entrySol: solAmount,
    currentValueSol,
    pnlPct: Number((((currentValueSol - solAmount) / solAmount) * 100).toFixed(2)),
    openedAt: Date.now(),
  };

  const next: ShadowState = {
    balance: {
      ...state.balance,
      sol: Number((state.balance.sol - solAmount).toFixed(4)),
      shielded: true,
    },
    positions: [position, ...state.positions],
  };
  writeState(next);
  bump();
  onStep?.("Private fill locked.");
  return { ok: true, position };
}

export function resetShadowDemo() {
  writeState(DEFAULT_STATE);
  bump();
}

/** Placeholder for future real Umbra client wiring */
export const umbraMode =
  process.env.NEXT_PUBLIC_PRIVACY_MODE === "umbra" ? "umbra" : "mock";
