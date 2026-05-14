"use client";

import { ReactNode } from "react";
import { LocaleProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";
import { ToastProvider } from "./toast";
import { ConfirmProvider } from "./confirm-dialog";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
