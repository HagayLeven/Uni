import type { NextConfig } from "next";

const SUPABASE_HOST = "jbyggtqoikwzzipxdere.supabase.co";

const CSP = [
  "default-src 'self'",
  // Next.js requires unsafe-inline for its runtime scripts + Tailwind inline styles
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  // Supabase REST + Realtime WebSocket + Google OAuth avatar
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://*.supabase.co wss://*.supabase.co https://accounts.google.com`,
  // Images: self, data URIs, S3, Google avatars
  "img-src 'self' data: blob: https://*.amazonaws.com https://lh3.googleusercontent.com",
  // Fonts: self only
  "font-src 'self'",
  // No plugins
  "object-src 'none'",
  // No iframes from external sources
  "frame-src 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  // PDF window uses document.write — allow blank pop-up
  "child-src 'self' blob:",
  // Restrict form submissions
  "form-action 'self'",
  // Prevent base-tag hijacking
  "base-uri 'self'",
  // Upgrade insecure requests
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ── Core security headers ──────────────────────────────────────
          { key: "X-Frame-Options",             value: "DENY" },
          { key: "X-Content-Type-Options",       value: "nosniff" },
          { key: "X-DNS-Prefetch-Control",       value: "on" },

          // ── HSTS — enforces HTTPS, required for A+ ─────────────────────
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // ── Referrer ───────────────────────────────────────────────────
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // ── Permissions Policy — disable unused browser features ───────
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "interest-cohort=()",
              "payment=()",
              "usb=()",
              "bluetooth=()",
              "accelerometer=()",
              "gyroscope=()",
              "magnetometer=()",
            ].join(", "),
          },

          // ── Cross-Origin policies ──────────────────────────────────────
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },

          // ── Content Security Policy ────────────────────────────────────
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
