/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — the whole app is client-side (state lives in
  // localStorage), so it ships as plain static files to Cloudflare Pages.
  // `next build` writes the site to ./out.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
