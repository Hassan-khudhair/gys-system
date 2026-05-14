"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

interface Pending {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface ConfirmCtx {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<ConfirmCtx>({ confirm: async () => false });

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve });
    });
  }, []);

  function handleConfirm() {
    setLoading(true);
    pending?.resolve(true);
    setLoading(false);
    setPending(null);
  }

  function handleCancel() {
    pending?.resolve(false);
    setPending(null);
  }

  return (
    <Ctx.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className={`h-0.75 w-full ${
              pending.options.variant === "danger" ? "bg-danger" : "bg-primary"
            }`} />
            <div className="p-6">
              <h3 className="text-sm font-semibold text-text mb-1.5">{pending.options.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-5">{pending.options.message}</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors"
                >
                  {pending.options.cancelLabel ?? "إلغاء"}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                    pending.options.variant === "danger"
                      ? "bg-danger hover:bg-danger/90"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {pending.options.confirmLabel ?? "تأكيد"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useConfirm() {
  return useContext(Ctx);
}
