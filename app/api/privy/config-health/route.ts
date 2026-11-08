import { evaluatePrivyAppHealth } from "@/lib/privy-app-health";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secret = process.env.PRIVY_APP_SECRET;

  if (!appId) {
    return NextResponse.json(
      { ok: false, issues: [{ id: "missing_app_id", message: "NEXT_PUBLIC_PRIVY_APP_ID is not set.", fix: "Add it to .env.local." }] },
      { status: 500 }
    );
  }

  if (!secret) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      issues: [],
    });
  }

  try {
    const auth = Buffer.from(`${appId}:${secret}`).toString("base64");
    const res = await fetch(`https://auth.privy.io/api/v1/apps/${appId}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "privy-app-id": appId,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          issues: [
            {
              id: "privy_api_error",
              message: "Could not load Privy app settings (check PRIVY_APP_SECRET).",
              fix: "Verify App ID and App Secret in dashboard.privy.io → App settings → Basics.",
            },
          ],
        },
        { status: 502 }
      );
    }

    const app = (await res.json()) as Record<string, unknown>;
    const health = evaluatePrivyAppHealth({
      name: app.name as string | undefined,
      solana_wallet_auth: app.solana_wallet_auth as boolean | undefined,
      external_wallets_for_signup_enabled:
        app.external_wallets_for_signup_enabled as boolean | undefined,
      email_auth: app.email_auth as boolean | undefined,
      wallet_auth: app.wallet_auth as boolean | undefined,
    });

    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        issues: [
          {
            id: "network_error",
            message: "Failed to reach Privy.",
            fix: "Check your network and try again.",
          },
        ],
      },
      { status: 502 }
    );
  }
}
