"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 inset-e-4 z-200 flex flex-col gap-2 w-full max-w-xs pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto flex overflow-hidden rounded-xl border border-border shadow-lg shadow-black/20 bg-surface"
          >
            <div className={`w-1 shrink-0 ${item.type === "success" ? "bg-success" : "bg-danger"}`} />
            <div className="flex items-start gap-3 px-4 py-3 flex-1">
              {item.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              )}
              <p className="text-sm flex-1 leading-snug text-text">{item.message}</p>
              <button
                onClick={() => dismiss(item.id)}
                className="text-muted hover:text-text transition-colors shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
