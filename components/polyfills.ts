"use client";

import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = window as any;
  if (!g.Buffer) g.Buffer = Buffer;
}
