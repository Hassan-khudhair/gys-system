import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["lib", "config"],

  async headers() {
    return [
      // Service worker must never come from HTTP cache so browsers always
      // byte-compare the new file and detect SW updates after every deploy.
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      // Manifest — app/manifest.ts always serves at /manifest.webmanifest per
      // Next.js App Router internals (normalizeMetadataRoute: /manifest → .webmanifest).
      // Static JSON files named manifest.json in app/ cause an internal redirect;
      // /manifest.webmanifest is the only path that works without a redirect.
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
