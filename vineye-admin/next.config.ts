import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.0.2.2", "192.168.*.*"],
  turbopack: {
    root: ".",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // onnxruntime-node + sharp = native binaries: keep as Node require(), do not bundle.
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  // Embed the ONNX model in the serverless trace for the predict route.
  outputFileTracingIncludes: {
    "/api/mobile/predict": ["./lib/ml/grapevine_v1.onnx"],
  },
};

export default nextConfig;
