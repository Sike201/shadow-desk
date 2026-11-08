"use client";

import Aurora from "./Aurora";

export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-full overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#050508]" />
      <div className="absolute inset-0 h-full w-full">
        <Aurora
          colorStops={["#5227FF", "#7cff67", "#5227FF"]}
          amplitude={1}
          blend={0.5}
          height={0.32}
          speed={1}
          glow={0.45}
          brightness={1}
          layers={2}
          direction="bottom"
          mouseInteraction
          intro={false}
          opacity={1}
          style={{ width: "100%", height: "100%", position: "relative" }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/25 via-[#050508]/65 to-[#050508]/92" />
    </div>
  );
}
