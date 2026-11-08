"use client";

import type { PrivyAppHealth } from "@/lib/privy-app-health";
import { useEffect, useState } from "react";

export function PrivyConfigBanner() {
  const [health, setHealth] = useState<PrivyAppHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/privy/config-health")
      .then((r) => r.json())
      .then((data: PrivyAppHealth & { skipped?: boolean }) => {
        if (cancelled || data.skipped) return;
        if (!data.ok) setHealth(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!health?.issues.length) return null;

  const appLabel = health.appName ? `"${health.appName}"` : "your Privy app";

  return (
    <div
      role="alert"
      className="border-b border-amber-500/30 bg-amber-950/80 px-4 py-3 text-sm text-amber-100"
    >
      <p className="font-medium">
        Wallet login is misconfigured in Privy ({appLabel}).
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-100/90">
        {health.issues.map((issue) => (
          <li key={issue.id}>
            {issue.message}{" "}
            <span className="text-amber-200/80">{issue.fix}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-200/70">
        Open{" "}
        <a
          href="https://dashboard.privy.io"
          className="underline hover:text-amber-50"
          target="_blank"
          rel="noreferrer"
        >
          dashboard.privy.io
        </a>{" "}
        → your app → Authentication. Until external wallet signup is enabled,
        Phantom login shows &quot;Account not found&quot; for new wallets.
      </p>
    </div>
  );
}
