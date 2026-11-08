import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hasherDist = path.join(
  __dirname,
  "node_modules/@lightprotocol/hasher.rs/dist"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist", "privacy-cash-sdk", "@privy-io/react-auth"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "light_wasm_hasher_bg.wasm": path.join(
        hasherDist,
        "light_wasm_hasher_bg.wasm"
      ),
      "hasher_wasm_simd_bg.wasm": path.join(
        hasherDist,
        "hasher_wasm_simd_bg.wasm"
      ),
    };
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
