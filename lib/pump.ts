/**
 * Placeholder Pump.fun buy.
 * Accept mint + SOL amount; later plug community Pump SDK or pumpdev.io Lightning API.
 */
export async function buyOnPump(mint: string, solAmount: number): Promise<{
  signature: string;
  mint: string;
  solAmount: number;
}> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    signature: `mock_${mint.slice(0, 8)}_${Date.now()}`,
    mint,
    solAmount,
  };
}
