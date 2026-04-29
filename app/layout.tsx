import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Uni — פלטפורמת הלמידה של פרמדיקי מד\"א",
  description: "פלטפורמת למידה שיתופית לפרמדיקי ואנשי מד\"א",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Uni",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",          // iPhone notch / Dynamic Island support
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body
        className={`${heebo.variable} font-heebo antialiased bg-gray-950 text-gray-100`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {children}
      </body>
    </html>
  );
}
