import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";

const tajawal = Tajawal({ 
  variable: "--font-tajawal", 
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Master Gym — Super Admin",
  description: "Master Gym super admin control panel",
  icons: { icon: "/icon.svg" },
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
