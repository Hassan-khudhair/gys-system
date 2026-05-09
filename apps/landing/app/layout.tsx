import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitNex — منصة إدارة الصالات الرياضية",
  description:
    "إدارة الأعضاء والاشتراكات والإيرادات في مكان واحد. مبنية للصالات الرياضية العراقية.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.className}>
      <body className="bg-[#040d10] text-slate-100 antialiased overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
