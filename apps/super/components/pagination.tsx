"use client";

import { useLocale } from "../lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;

  const { locale } = useLocale();
  function pages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | "…")[] = [1];
    if (page > 3) result.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) result.push(i);
    if (page < totalPages - 2) result.push("…");
    result.push(totalPages);
    return result;
  }

  const btnBase = "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors";

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className={`${btnBase} text-muted hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {locale === "ar" ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {pages().map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-faint text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`${btnBase} ${p === page ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-text"}`}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className={`${btnBase} text-muted hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {locale === "ar" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
