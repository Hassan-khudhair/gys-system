"use client";

import { ReactNode } from "react";
import { LocaleProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
