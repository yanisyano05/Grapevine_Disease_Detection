import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
