import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/product-category/:slug",
        destination: "/c/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
