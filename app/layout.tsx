import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AuroraBackground } from "@/components/AuroraBackground";
import { PrivyConfigBanner } from "@/components/PrivyConfigBanner";
import { WalletProvider } from "@/components/WalletProvider";
import "@/components/polyfills";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shadow Send",
  description: "Solflare-style private send on Solana powered by Privacy Cash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSans.className}`}
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.className} relative min-h-[100dvh] bg-transparent text-zinc-100 antialiased`}
      >
        <AuroraBackground />
        <WalletProvider>
          <div className={`${GeistSans.className} relative z-10 min-h-[100dvh]`}>
            <PrivyConfigBanner />
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
