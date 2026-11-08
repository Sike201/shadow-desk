export type PrivyAppHealthIssue = {
  id: string;
  message: string;
  fix: string;
};

export type PrivyAppHealth = {
  ok: boolean;
  appName?: string;
  issues: PrivyAppHealthIssue[];
};

/** Derive fix steps from Privy app settings (server-side AppResponse shape). */
export function evaluatePrivyAppHealth(app: {
  name?: string;
  solana_wallet_auth?: boolean;
  external_wallets_for_signup_enabled?: boolean;
  email_auth?: boolean;
  wallet_auth?: boolean;
}): PrivyAppHealth {
  const issues: PrivyAppHealthIssue[] = [];

  if (!app.solana_wallet_auth) {
    issues.push({
      id: "solana_wallet_auth",
      message: "Solana wallet login is disabled for this Privy app.",
      fix: "Dashboard → Authentication → enable Solana wallet login.",
    });
  }

  if (!app.external_wallets_for_signup_enabled) {
    issues.push({
      id: "external_wallets_for_signup",
      message:
        "New users cannot sign up with Phantom/Solflare (external wallet signup is off).",
      fix: "Dashboard → Authentication → enable external wallets for signup (or allow wallet sign-up for new users).",
    });
  }

  const hasAnySignupPath =
    app.external_wallets_for_signup_enabled ||
    app.email_auth ||
    app.wallet_auth;

  if (!hasAnySignupPath) {
    issues.push({
      id: "no_signup_method",
      message: "No login method can create new Privy users for this app.",
      fix: "Enable email login and/or external wallet signup in the Privy dashboard.",
    });
  }

  return {
    ok: issues.length === 0,
    appName: app.name,
    issues,
  };
}
