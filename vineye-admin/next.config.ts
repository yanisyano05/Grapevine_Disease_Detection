import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.0.2.2", "192.168.*.*"],
  turbopack: {
    root: ".",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
