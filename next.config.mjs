/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

// Cloudflare Workers (OpenNext) — enables getCloudflareContext() during
// `next dev` so the app behaves the same locally as on Workers.
// This is a no-op for the regular Node build/runtime.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
