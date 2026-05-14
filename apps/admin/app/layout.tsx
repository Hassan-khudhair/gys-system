import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import { PwaRegister } from "../components/pwa-register";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#030d10" },
    { media: "(prefers-color-scheme: light)", color: "#f0fbfc" },
  ],
};

export const metadata: Metadata = {
  title: {
    template: "%s — FitNex",
    default: "Admin Panel — FitNex",
  },
  description: "Gym management platform for fitness professionals.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitNex",
    startupImage: "/logo.png",
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full`} suppressHydrationWarning>
      <body className="h-full">
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
