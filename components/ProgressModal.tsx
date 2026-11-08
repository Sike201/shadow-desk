"use client";

export type SendStep =
  | "preparing"
  | "depositing"
  | "mixing"
  | "sending"
  | "complete"
  | "error";

function buildOrder(includeMixing: boolean): SendStep[] {
  return includeMixing
    ? ["preparing", "depositing", "mixing", "sending", "complete"]
    : ["preparing", "depositing", "sending", "complete"];
}

const LABELS: Record<SendStep, string> = {
  preparing: "Preparing…",
  depositing: "Depositing / Shielding…",
  mixing: "Mixing stablecoin…",
  sending: "Sending privately…",
  complete: "Complete ✓",
  error: "Error",
};

export function ProgressModal({
  open,
  step,
  includeMixing,
  error,
  signatures,
  onClose,
}: {
  open: boolean;
  step: SendStep;
  includeMixing: boolean;
  error?: string | null;
  signatures?: { deposit?: string; main: string };
  onClose: () => void;
}) {
  if (!open) return null;

  const order = buildOrder(includeMixing);
  const currentIdx =
    step === "complete"
      ? order.length
      : step === "error"
        ? -1
        : Math.max(0, order.indexOf(step));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#121218]/95 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-semibold text-white">
          {step === "error"
            ? "Something went wrong"
            : step === "complete"
              ? "Sent"
              : "Processing"}
        </h2>

        {error ? (
          <p className="mt-3 text-sm text-red-400/90">{error}</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {order.map((id, idx) => {
              const done = step === "complete" || currentIdx > idx;
              const current = step !== "complete" && currentIdx === idx;
              const pending = !done && !current;

              return (
                <li key={id} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-emerald-500/20 text-emerald-400"
                        : current
                          ? "bg-violet-500/25 text-violet-300 animate-pulse"
                          : "bg-white/5 text-zinc-600"
                    }`}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <span
                    className={`text-sm ${
                      pending ? "text-zinc-600" : "text-zinc-200"
                    }`}
                  >
                    {LABELS[id]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {signatures && step === "complete" ? (
          <div className="mt-5 space-y-2 rounded-xl bg-black/40 p-3 font-mono text-[10px] text-zinc-500">
            {signatures.deposit ? (
              <p className="break-all">
                Deposit:{" "}
                <a
                  className="text-violet-400 hover:underline"
                  href={`https://solscan.io/tx/${signatures.deposit}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {signatures.deposit.slice(0, 16)}…
                </a>
              </p>
            ) : null}
            <p className="break-all">
              {signatures.deposit ? "Withdraw" : "Tx"}:{" "}
              <a
                className="text-violet-400 hover:underline"
                href={`https://solscan.io/tx/${signatures.main}`}
                target="_blank"
                rel="noreferrer"
              >
                {signatures.main.slice(0, 16)}…
              </a>
            </p>
          </div>
        ) : null}

        {(step === "complete" || step === "error") && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            {step === "error" ? "Dismiss" : "Done"}
          </button>
        )}
      </div>
    </div>
  );
}
