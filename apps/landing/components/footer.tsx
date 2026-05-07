"use client";

import Image from "next/image";
import { useLocale } from "@/lib/i18n";

const REGISTER_URL = process.env.NEXT_PUBLIC_ADMIN_REGISTER_URL ?? "#";
const LOGIN_URL    = process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL    ?? "#";

export function Footer() {
  const { t } = useLocale();

  const LINKS = {
    [t("footer_product")]: [
      { label: t("footer_features"),  href: "#features" },
      { label: t("footer_how"),       href: "#how" },
      { label: t("footer_register"),  href: REGISTER_URL },
    ],
    [t("footer_access")]: [
      { label: t("footer_admin_login"), href: LOGIN_URL },
      { label: t("footer_super_admin"), href: "#" },
    ],
  };

  return (
    <footer className="relative border-t border-white/6 bg-[#03030c]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <a href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
              <Image src="/logo.png" alt="Mr. Gym" width={36} height={36} className="object-contain w-full h-full" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">
              Mr.<span className="text-indigo-400">Gym</span>
            </span>
          </a>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
            {t("footer_tagline")}
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, items]) => (
          <div key={heading}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              {heading}
            </p>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.label}>
                  <a href={item.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} Mr. Gym. {t("footer_copyright")}</span>
          <span className="flex items-center gap-1.5">
            {t("footer_love")} <span className="text-red-500">♥</span> {t("footer_love2")}
          </span>
        </div>
      </div>
    </footer>
  );
}
