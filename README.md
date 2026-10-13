# Shadow Desk

AI-powered private memecoin trading desk on Solana — wallet connect, Umbra-style private balances, Shadow agent chat, and a one-click private buy flow (mocked privacy + Pump for the demo).

## Quick start

```bash
cp .env.example .env.local
# Prefer GOOGLE_GENERATIVE_AI_API_KEY (Gemini Flash, free)
# or set OPENAI_API_KEY (uses gpt-4o-mini)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 14 App Router + TypeScript + Tailwind
- `@solana/wallet-adapter-react` (Phantom / Solflare)
- `@umbra-privacy/sdk` installed — demo uses mock privacy rail (`NEXT_PUBLIC_PRIVACY_MODE=mock`)
- Vercel AI SDK (`ai` + `@ai-sdk/react`) with Gemini Flash preferred, OpenAI mini fallback
- React Bits `Dither` background

## Demo flow

1. Connect Phantom or Solflare
2. Peek private SOL/USDC in the vault card
3. Chat: `Buy 0.05 SOL of this mint: <mint>`
4. Watch withdraw → fund burner → Pump buy → re-shield
5. New position land in the private book

## Env

| Key | Notes |
| --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Preferred (free Gemini Flash) |
| `OPENAI_API_KEY` | Fallback `gpt-4o-mini` only |
| `NEXT_PUBLIC_HELIUS_RPC_URL` | Solana RPC |
| `NEXT_PUBLIC_PRIVACY_MODE` | `mock` or `umbra` |

Never commit `.env.local`.
