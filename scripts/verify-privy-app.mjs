#!/usr/bin/env node
/**
 * Validates Privy dashboard settings required for Phantom / external wallet signup.
 * Loads .env.local from project root.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(envPath);

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const secret = process.env.PRIVY_APP_SECRET;

if (!appId || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET in .env.local"
  );
  process.exit(1);
}

const auth = Buffer.from(`${appId}:${secret}`).toString("base64");
const res = await fetch(`https://auth.privy.io/api/v1/apps/${appId}`, {
  headers: {
    Authorization: `Basic ${auth}`,
    "privy-app-id": appId,
  },
});

if (!res.ok) {
  console.error("Privy API error:", res.status, await res.text());
  process.exit(1);
}

const app = await res.json();
let failed = false;

console.log(`Privy app: ${app.name} (${app.id})\n`);

if (!app.solana_wallet_auth) {
  failed = true;
  console.error("✗ solana_wallet_auth is OFF — enable Solana wallet login.");
}

if (!app.external_wallets_for_signup_enabled) {
  failed = true;
  console.error(
    "✗ external_wallets_for_signup_enabled is OFF — new Phantom users get “Account not found”."
  );
  console.error(
    "  Fix: dashboard.privy.io → your app → Authentication → allow sign-up with external wallets."
  );
}

if (!app.email_auth && !app.external_wallets_for_signup_enabled) {
  failed = true;
  console.error("✗ No signup path: email auth is also OFF.");
}

if (!failed) {
  console.log("✓ Privy app settings allow new wallet sign-ups.");
  process.exit(0);
}

process.exit(1);
