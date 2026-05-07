"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

export type Locale = "en" | "ar";
type Keys = keyof typeof en;

const DICT: Record<Locale, typeof en> = { en, ar };

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: Keys) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<LocaleCtx>({
  locale: "ar",
  setLocale: () => {},
  t: (k) => k as string,
  dir: "rtl",
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  function setLocale(l: Locale) {
    setLocaleState(l);
  }

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, dir]);

  const t = (key: Keys): string =>
    (DICT[locale] as Record<string, string>)[key] ??
    (DICT.en as Record<string, string>)[key] ??
    key;

  return <Ctx.Provider value={{ locale, setLocale, t, dir }}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx);
}
