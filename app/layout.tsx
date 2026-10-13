import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import { Toaster } from "sonner";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Shadow Desk",
  description: "AI-powered private memecoin trading desk on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${mono.variable} font-sans antialiased`}
      >
        <WalletProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  "border border-neon/30 bg-black/90 font-mono text-xs text-zinc-100",
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
