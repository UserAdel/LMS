import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "marshal-lms-yt-video-subscribe-adel.t3.storageapi.dev",
        port: "",
        protocol: "https",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
