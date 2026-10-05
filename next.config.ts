import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Product photos are uploaded through a Server Action; phone photos are often 3–8 MB.
    serverActions: { bodySizeLimit: "15mb" },
  },
};

export default nextConfig;
