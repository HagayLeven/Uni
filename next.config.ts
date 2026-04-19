import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from S3 and avatars
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
    ],
  },
  // Expose the API URL to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
};

export default nextConfig;
