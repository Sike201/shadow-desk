"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useSolanaConnection } from "@/components/SolanaConnectionProvider";
import { WalletButton } from "@/components/WalletButton";
import { useShadowWallet } from "@/hooks/useShadowWallet";
import { TokenSelector } from "@/components/TokenSelector";
import { AmountInput } from "@/components/AmountInput";
import { RecipientInput } from "@/components/RecipientInput";
import { PrivateSendToggle } from "@/components/PrivateSendToggle";
import {
  ProgressModal,
  type SendStep,
} from "@/components/ProgressModal";
import type { SendToken } from "@/lib/constants";
import {
  ESTIMATED_PRIVATE_FEE,
  ESTIMATED_PRIVATE_TIME,
  ESTIMATED_PUBLIC_FEE,
  ESTIMATED_PUBLIC_TIME,
} from "@/lib/constants";
import {
  createPrivacyClient,
  executePrivateSend,
  walletToSigner,
} from "@/lib/privacy-cash";
import {
  fetchSpendableBalance,
  formatAmount,
  parseAmount,
  sendPublicTransfer,
} from "@/lib/solana";

export default function Home() {
  const connection = useSolanaConnection();
  const wallet = useShadowWallet();

  const [token, setToken] = useState<SendToken>("SOL");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateSend, setPrivateSend] = useState(true);
  const [extraMix, setExtraMix] = useState(true);
  const [balanceRaw, setBalanceRaw] = useState<bigint>(0n);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<SendStep>("preparing");
  const [error, setError] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<{
    deposit?: string;
    main: string;
  } | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!wallet.publicKey) {
      setBalanceRaw(0n);
      return;
    }
    try {
      const bal = await fetchSpendableBalance(
        connection,
        wallet.publicKey,
        token
      );
      setBalanceRaw(bal);
    } catch {
      setBalanceRaw(0n);
    }
  }, [connection, wallet.publicKey, token]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const balanceLabel = useMemo(() => {
    if (!wallet.publicKey) return undefined;
    return `${formatAmount(balanceRaw, token)} ${token}`;
  }, [balanceRaw, token, wallet.publicKey]);

  const includeMixing =
    privateSend && extraMix && (token === "USDC" || token === "USDT");

  const feeLine = privateSend ? ESTIMATED_PRIVATE_FEE : ESTIMATED_PUBLIC_FEE;
  const timeLine = privateSend ? ESTIMATED_PRIVATE_TIME : ESTIMATED_PUBLIC_TIME;

  const onMax = () => {
    if (balanceRaw > 0n) setAmount(formatAmount(balanceRaw, token));
  };

  const validate = (): { recipientPk: PublicKey; amountRaw: bigint } => {
    if (!recipient.trim()) throw new Error("Enter a recipient address");
    const amountRaw = parseAmount(amount, token);
    if (amountRaw <= 0n) throw new Error("Enter an amount greater than zero");

    let recipientPk: PublicKey;
    try {
      recipientPk = new PublicKey(recipient);
    } catch {
      throw new Error("Invalid recipient address");
    }
    if (!wallet.publicKey) throw new Error("Connect your wallet first");
    if (recipientPk.equals(wallet.publicKey)) {
      throw new Error("Recipient must differ from your wallet");
    }
    if (amountRaw > balanceRaw) throw new Error("Insufficient balance");
    return { recipientPk, amountRaw };
  };

  const handleSend = async () => {
    setError(null);
    setSignatures(null);
    setModalOpen(true);
    setStep("preparing");
    setBusy(true);
    try {
      const { recipientPk, amountRaw } = validate();

      if (!privateSend) {
        setStep("sending");
        const sig = await sendPublicTransfer(
          connection,
          wallet.publicKey!,
          wallet.signTransaction,
          recipientPk,
          token,
          amountRaw
        );
        setSignatures({ main: sig });
        setStep("complete");
        await refreshBalance();
        return;
      }

      const signer = walletToSigner({
        publicKey: wallet.publicKey,
        signMessage: wallet.signMessage,
        signTransaction: wallet.signTransaction,
      });
      const client = createPrivacyClient(signer);

      const outcome = await executePrivateSend(
        client,
        token,
        amountRaw,
        recipientPk,
        includeMixing,
        (s) => setStep(s)
      );

      setSignatures({
        deposit: outcome.depositSignature,
        main: outcome.withdrawSignature,
      });
      setStep("complete");
      await refreshBalance();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setError(msg);
      setStep("error");
    } finally {
      setBusy(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setStep("preparing");
    setError(null);
  };

  const primaryLabel = privateSend ? "Send Privately" : "Send";

  return (
    <>
      <div className="relative flex min-h-[100dvh] flex-col font-sans">
        <header className="flex items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Image
              src="/talesfunlogo.png"
              alt="tales"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
              priority
            />
            <span className="text-sm font-semibold tracking-tight text-white">
              tales
            </span>
          </div>
          <WalletButton />
        </header>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-start px-5 pb-28 pt-[10vh] sm:max-w-md sm:px-6 sm:pt-[12vh]">
          <div className="mb-6 text-center sm:mb-7">
            <p className="readable text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/90">
              Shadow Send
            </p>
            <h1 className="readable mt-2 font-sans text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
              Incognito mode for your money.
            </h1>
            <p className="readable mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-300">
              Send SOL, USDC, or USDT on Solana with optional private shielding.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xs space-y-1 sm:max-w-sm">
            <TokenSelector value={token} onChange={setToken} />
            <AmountInput
              token={token}
              value={amount}
              onChange={setAmount}
              onMax={onMax}
              balanceLabel={balanceLabel}
            />
            <RecipientInput value={recipient} onChange={setRecipient} />
            <PrivateSendToggle
              enabled={privateSend}
              onChange={setPrivateSend}
              extraMix={extraMix}
              onExtraMixChange={setExtraMix}
              token={token}
            />

            <div className="readable flex justify-between gap-2 pt-4 text-xs text-zinc-400">
              <span className="truncate">Est. fee · {feeLine}</span>
              <span className="shrink-0">{timeLine}</span>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleSend}
              className="readable mt-3 w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Processing…" : primaryLabel}
            </button>

            {!wallet.publicKey ? (
              <p className="readable pt-3 text-center text-xs text-zinc-400">
                Connect a wallet with Privy to send
              </p>
            ) : null}
          </div>
        </main>
      </div>

      <ProgressModal
        open={modalOpen}
        step={step}
        includeMixing={includeMixing}
        error={error}
        signatures={signatures ?? undefined}
        onClose={closeModal}
      />
    </>
  );
}
