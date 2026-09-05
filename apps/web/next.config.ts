import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:3001";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@jw/shared"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
