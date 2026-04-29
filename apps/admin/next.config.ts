import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["lib", "config"],
};

export default nextConfig;
