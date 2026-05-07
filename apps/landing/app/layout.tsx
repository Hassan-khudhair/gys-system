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
  title: "Mr. Gym — منصة إدارة الصالات الرياضية",
  description:
    "إدارة الأعضاء والاشتراكات والإيرادات في مكان واحد. مبنية للصالات الرياضية العراقية.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.className}>
      <body className="bg-[#05050f] text-slate-100 antialiased overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
