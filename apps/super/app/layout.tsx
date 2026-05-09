import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — FitNex",
    default: "Super Admin — FitNex",
  },
  description: "FitNex platform management and administration.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: "/logo.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#030d10" },
    { media: "(prefers-color-scheme: light)", color: "#f0fbfc" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full`} suppressHydrationWarning>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
