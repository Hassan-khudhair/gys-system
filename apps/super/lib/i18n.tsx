"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "ar" | "en";
import AR from "../locales/ar.json";
import EN from "../locales/en.json";

const ar = AR as typeof EN; // just to satisfy the type checker, since we only use keys from EN in the code. The actual values come from the JSON files.

const en: typeof ar = EN;

type T = typeof ar;
const translations = { ar, en };

interface LocaleCtx {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: keyof T) => string;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<LocaleCtx>({
  locale: "ar", dir: "rtl",
  t: (k) => k as string,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved === "ar" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("locale", locale);
  }, [locale]);

  const t = (key: keyof T) => translations[locale][key] as string;

  return (
    <Ctx.Provider value={{ locale, dir: locale === "ar" ? "rtl" : "ltr", t, setLocale: setLocaleState }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocale() {
  return useContext(Ctx);
}
