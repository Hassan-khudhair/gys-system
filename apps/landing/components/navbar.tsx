"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const REGISTER_URL = process.env.NEXT_PUBLIC_ADMIN_REGISTER_URL ?? "#";
const LOGIN_URL    = process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL    ?? "#";

export function Navbar() {
  const { t, locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const NAV_LINKS = [
    { label: t("nav_features"), href: "#features" },
    { label: t("nav_how"),      href: "#how" },
    { label: t("nav_register"), href: REGISTER_URL },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#05050f]/90 backdrop-blur-2xl border-b border-white/6 py-3 shadow-2xl"
          : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-md shadow-indigo-500/20 shrink-0 transition-all group-hover:scale-105">
            <Image src="/logo.png" alt="Mr. Gym" width={36} height={36} className="object-contain w-full h-full" />
          </div>
          <span className="text-sm font-bold tracking-wide text-white">
            Mr.<span className="text-indigo-400">Gym</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href}
              className="text-sm text-slate-400 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="text-xs font-bold cursor-pointer text-slate-400 hover:text-white w-8 h-8 rounded-lg border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center"
          >
            {locale === "en" ? "ع" : "EN"}
          </button>

          {/* Admin Login */}
          <a href={LOGIN_URL}
            className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
            {t("nav_login")}
          </a>

          {/* Register */}
          <a href={REGISTER_URL}
            className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-px">
            {t("nav_register_btn")} 
            {locale === "en" ? (
                <ArrowRight className="w-4 h-4 inline-block ms-1" />
            ) : (
                <ArrowLeft className="w-4 h-4 inline-block ms-1" />
            )}
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="text-xs font-bold cursor-pointer text-slate-400 hover:text-white w-8 h-8 rounded-lg border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center"
          >
            {locale === "en" ? "ع" : "EN"}
          </button>
          <button onClick={() => setOpen((o) => !o)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute inset-x-0 top-full bg-[#05050f]/96 backdrop-blur-2xl border-b border-white/6 px-6 py-4 space-y-1 shadow-2xl">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block text-sm text-slate-400 hover:text-white py-2.5 border-b border-white/5 transition-colors">
              {l.label}
            </a>
          ))}
          <a href={LOGIN_URL} onClick={() => setOpen(false)}
            className="block text-sm text-slate-400 hover:text-white py-2.5 border-b border-white/5 transition-colors">
            {t("nav_login")}
          </a>
          <a href={REGISTER_URL}
            className="block text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-center mt-3 transition-colors">
            {t("nav_register_btn")} 
            <ArrowLeft className="w-4 h-4 inline-block ms-1" />
            <ArrowRight className="w-4 h-4 inline-block ms-1" />
          </a>
        </div>
      )}
    </header>
  );
}
