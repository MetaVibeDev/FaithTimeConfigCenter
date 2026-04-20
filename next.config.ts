import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/user/:path*",
        destination: "https://faithtime-mob.metavibe-api.com/user/:path*",
        // destination: "http://localhost:5000/user/:path*",
      },
      {
        source: "/api/notification/:path*",
        destination:
          "https://faithtime-mob.metavibe-api.com/notification/:path*",
        // "http://localhost:5000/notification/:path*",
      },
      {
        source: "/api/auth/:path*",
        destination: "https://faithtime-mob.metavibe-api.com/auth/:path*",
        // destination: "http://localhost:5000/auth/:path*",
      },
      {
        source: "/api/assets/:path*",
        destination: "https://faithtime-mob.metavibe-api.com/assets/:path*",
        // destination: "http://localhost:5000/assets/:path*",
      },
    ];
  },
};

export default nextConfig;
