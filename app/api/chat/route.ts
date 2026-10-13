import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { BUY_TOOL_DESCRIPTION, SHADOW_SYSTEM_PROMPT } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 60;

function getModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-2.0-flash");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }
  throw new Error(
    "No AI key configured. Set GOOGLE_GENERATIVE_AI_API_KEY (preferred) or OPENAI_API_KEY."
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (body.messages ?? []) as UIMessage[];

    const result = streamText({
      model: getModel(),
      system: SHADOW_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(3),
      tools: {
        executePrivateBuy: tool({
          description: BUY_TOOL_DESCRIPTION,
          inputSchema: z.object({
            mint: z
              .string()
              .describe("Solana mint address of the Pump.fun token"),
            solAmount: z
              .number()
              .positive()
              .describe("SOL amount to spend from private balance"),
          }),
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
