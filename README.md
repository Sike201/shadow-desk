# Shadow Send

Minimal web app for **Private Send** on Solana — Solflare-style UX with [Privacy Cash](https://github.com/Privacy-Cash/privacy-cash) under the hood.

## Features

- Connect wallet (Phantom, Solflare, …)
- Send **SOL**, **USDC**, or **USDT**
- **Private Send** (default on) via Privacy Cash deposit → withdraw
- **Extra Mix** for stablecoins (separate deposit + timed mix + withdraw)
- Public transfer when Private Send is off
- Aurora gradient background (React Bits)

## Setup

```bash
npm install
cp .env.example .env.local
# Add Helius RPC URL + Privy App ID (and PRIVY_APP_SECRET for any server routes)
npm run dev
```

### Privy

Wallet connection uses [Privy](https://privy.io) (Solana-only: external wallets + embedded wallets).

1. Create an app at [dashboard.privy.io](https://dashboard.privy.io).
2. Under **Authentication**, enable **Solana wallet** login and **sign-up with external wallets** (Phantom/Solflare). If external signup is off, Privy shows *Account not found* for new wallets.
3. Optionally enable **Email** so users can create an account without an extension wallet.
4. Set `NEXT_PUBLIC_PRIVY_APP_ID` in `.env.local` and `PRIVY_APP_SECRET` (server-only, never commit).
5. Run `npm run privy:verify` to confirm dashboard settings match this app.

The client uses `@privy-io/react-auth` with Phantom/Solflare via `toSolanaWalletConnectors()`.

### Circuit files (required for private send)

The SDK loads Groth16 artifacts from your app at:

- `public/circuit/transaction2.wasm`
- `public/circuit/transaction2.zkey`

Download or build them from the [Privacy Cash](https://github.com/Privacy-Cash/privacy-cash) repository (see their SDK installation docs). These files are large and are not committed to this repo.

### Backend

Point `NEXT_PUBLIC_PRIVACY_CASH_BACKEND_URL` at a running Privacy Cash backend (default: `https://api3.privacycash.org`).

## Scripts

- `npm run dev` — development server
- `npm run dev:clean` — clear `.next` and start dev (use if styles/assets 404)
- `npm run build` — production build

## Project layout

- `app/page.tsx` — main send screen
- `components/` — wallet, form, progress modal, Aurora
- `lib/privacy-cash.ts` — Privacy Cash client + flows
- `lib/solana.ts` — balances and public transfers
