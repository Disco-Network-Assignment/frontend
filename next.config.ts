import type { NextConfig } from "next";

/**
 * Static export: every route is prerendered to `out/` at build time and all data is fetched
 * in the browser from the FastAPI backend, so the app can be hosted anywhere that serves
 * files (Amplify, S3, Vercel static). No server-only features are used.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
