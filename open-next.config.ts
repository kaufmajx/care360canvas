import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext Cloudflare adapter config. Defaults are fine for this app:
// no ISR/on-demand revalidation, so the in-memory cache is sufficient.
// To add a persistent cache later, wire an R2/KV incrementalCache here.
export default defineCloudflareConfig();
