"use client";

import { useLocale } from "../lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: Props) {
  const { locale } = useLocale();

  if (totalPages <= 1) return null;

  function pages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | "…")[] = [1];
    if (page > 3) result.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) result.push(i);
    if (page < totalPages - 2) result.push("…");
    result.push(totalPages);
    return result;
  }

  const navBtn = "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 text-muted hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1 px-5 py-3.5 border-t border-border/40">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className={navBtn}
      >
        {locale === "ar" ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {pages().map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-faint text-sm select-none">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 ${
              p === page
                ? "bg-primary text-white shadow-sm shadow-primary/30"
                : "text-muted hover:text-text hover:bg-surface-2"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className={navBtn}
      >
        {locale === "ar" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
