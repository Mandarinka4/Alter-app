import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev DB) ships WASM; keep it out of the server bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
