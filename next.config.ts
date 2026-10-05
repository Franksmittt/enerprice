import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The PDF route reads photos and the logo from disk at runtime, which file tracing can't detect.
  outputFileTracingIncludes: {
    "/portal/pricelist.pdf": ["./public/products/**", "./public/brand/**"],
  },
  experimental: {
    // Product photos are uploaded through a Server Action; phone photos are often 3–8 MB.
    serverActions: { bodySizeLimit: "15mb" },
  },
};

export default nextConfig;
