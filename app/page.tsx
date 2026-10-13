"use client";

import dynamic from "next/dynamic";
import { WalletButton } from "@/components/WalletButton";
import { PrivateBalance } from "@/components/PrivateBalance";
import { Positions } from "@/components/Positions";
import { Chat } from "@/components/Chat";

const Dither = dynamic(() => import("@/components/Dither"), { ssr: false });

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <Dither
          waveColor={[0.22, 1, 0.08]}
          backgroundColor={[0.02, 0.024, 0.02]}
          ditherMode="bayer"
          colorNum={4}
          pixelSize={2}
          waveSpeed={0.04}
          waveFrequency={3}
          waveAmplitude={0.28}
          mouseEffect="erase"
          mouseRadius={0.35}
          brightness={-0.05}
          contrast={1.15}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon/70">
              umbra × pump
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Shadow Desk
            </h1>
            <p className="mt-1 max-w-md text-sm text-zinc-500">
              AI-powered private memecoin desk. Size stays shielded. Fills look like ghosts.
            </p>
          </div>
          <WalletButton />
        </header>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[320px_1fr] lg:gap-5">
          <aside className="flex flex-col gap-4 lg:min-h-[70vh]">
            <PrivateBalance />
            <Positions />
          </aside>
          <div className="min-h-[520px] lg:min-h-0">
            <Chat />
          </div>
        </div>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          <span>demo rail · privacy mocked until umbra live</span>
          <span className="text-neon/50">not financial advice · obviously</span>
        </footer>
      </div>
    </main>
  );
}
