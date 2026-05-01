import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All site images are stored locally under /public/images/.
    // Add remote patterns here only if a specific external domain is required.
    remotePatterns: [],
  },
};

export default nextConfig;
