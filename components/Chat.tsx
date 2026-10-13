"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { Send, Terminal } from "lucide-react";
import { toast } from "sonner";
import { executePrivateBuy } from "@/lib/umbra";
import { BuyOverlay } from "./BuyOverlay";

function getText(message: UIMessage) {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

const SUGGESTIONS = [
  "Buy 0.05 SOL of this mint: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "What's my private position?",
  "Suggest a private snipe on the next good launch",
];

export function Chat() {
  const [input, setInput] = useState("");
  const [buyBusy, setBuyBusy] = useState(false);
  const [buyLabel, setBuyLabel] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const buyLock = useRef(false);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const runBuy = useCallback(async (mint: string, solAmount: number) => {
    if (buyLock.current) {
      return { ok: false as const, error: "Buy already in flight" };
    }
    buyLock.current = true;
    setBuyBusy(true);
    setBuyLabel("Initializing private path…");
    try {
      const result = await executePrivateBuy(mint, solAmount, (label) =>
        setBuyLabel(label)
      );
      if (result.ok) {
        toast.success(`Shadow fill · ${result.position.symbol}`, {
          description: `${solAmount} SOL re-shielded privately`,
        });
        return { ok: true as const, position: result.position };
      }
      toast.error(result.error);
      return { ok: false as const, error: result.error };
    } finally {
      buyLock.current = false;
      setBuyBusy(false);
      setBuyLabel("");
    }
  }, []);

  const { messages, sendMessage, status, addToolOutput, error } = useChat({
    transport,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName !== "executePrivateBuy") return;
      if (toolCall.dynamic) return;

      const inputArgs = toolCall.input as { mint?: string; solAmount?: number };
      const mint = String(inputArgs.mint ?? "");
      const solAmount = Number(inputArgs.solAmount ?? 0);
      const result = await runBuy(mint, solAmount);

      addToolOutput({
        tool: "executePrivateBuy",
        toolCallId: toolCall.toolCallId,
        output: result,
      });
    },
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming" || buyBusy;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <>
      <BuyOverlay active={buyBusy} label={buyLabel} />
      <section className="panel flex h-full min-h-[420px] flex-col lg:min-h-0">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-neon" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Shadow Agent
              </h2>
              <p className="text-[10px] text-zinc-600">private co-pilot · Umbra rail</p>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-neon/80">
            {busy ? "live" : "armed"}
          </span>
        </div>

        <div ref={scrollerRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                Connect a wallet. Keep size in the vault. Tell me what to snipe —
                I&apos;ll route it through the private path.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => setInput(s)}
                    className="border border-white/10 bg-black/30 px-2 py-1.5 text-left text-[11px] text-zinc-400 transition hover:border-neon/40 hover:text-neon"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = getText(m);
            const toolParts = m.parts.filter((p) =>
              p.type.startsWith("tool-")
            );
            return (
              <div
                key={m.id}
                className={`max-w-[92%] px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto border border-neon/20 bg-neon/5 text-zinc-100"
                    : "border border-white/5 bg-black/50 text-zinc-300"
                }`}
              >
                <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                  {m.role === "user" ? "you" : "shadow"}
                </p>
                {text ? <p className="whitespace-pre-wrap">{text}</p> : null}
                {toolParts.map((part, i) => {
                  const name =
                    "toolName" in part
                      ? String((part as { toolName?: string }).toolName)
                      : part.type.replace("tool-", "");
                  return (
                    <p
                      key={`${m.id}-tool-${i}`}
                      className="mt-2 font-mono text-[11px] text-neon/80"
                    >
                      ▸ tool · {name}
                    </p>
                  );
                })}
              </div>
            );
          })}

          {error && (
            <p className="border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error.message}
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex gap-2 border-t border-white/5 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="buy 0.05 SOL of <mint> privately…"
            className="min-w-0 flex-1 border border-white/10 bg-black/60 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-neon/40"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex items-center justify-center border border-neon/50 bg-neon/10 px-3 text-neon transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </>
  );
}
