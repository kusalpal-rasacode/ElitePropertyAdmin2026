"use client";
import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  /** Label used in the "Showing X to Y of Z …" text. Defaults to "entries" */
  entryLabel?: string;
  /** Whether to show the summary text on the left. Defaults to true */
  showSummary?: boolean;
}

/**
 * Usage:
 * ```tsx
 * <Pagination
 *   pagination={{ page, limit, total, totalPages }}
 *   onPageChange={handleSetPage}
 * />
 * ```
 */
export function Pagination({
  pagination,
  onPageChange,
  entryLabel = "entries",
  showSummary = true,
}: PaginationProps) {
  const { currentTheme } = useTheme();
  const { page, limit, total, totalPages } = pagination;

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div
      className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t mt-8"
      style={{ borderColor: currentTheme.borderColor }}
    >
      {showSummary && (
        <div className="text-sm opacity-70" style={{ color: currentTheme.textColor }}>
          Showing{" "}
          <span className="font-bold">{total === 0 ? 0 : (page - 1) * limit + 1}</span> to{" "}
          <span className="font-bold">{Math.min(page * limit, total)}</span> of{" "}
          <span className="font-bold">{total}</span> {entryLabel}
        </div>
      )}

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
          aria-label="Previous page"
        >
          <MdChevronLeft size={20} />
        </button>

        {pageNumbers.map((pageNum, idx) =>
          pageNum === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center select-none"
              style={{ color: currentTheme.textColor }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="2" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="14" cy="8" r="1.5" />
              </svg>
            </span>
          ) : (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                page === pageNum
                  ? "text-white shadow-md"
                  : "hover:bg-black/5"
              }`}
              style={{
                backgroundColor: page === pageNum ? currentTheme.primary : "transparent",
                color: page === pageNum ? "#fff" : currentTheme.textColor,
              }}
              aria-current={page === pageNum ? "page" : undefined}
            >
              {pageNum}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
          aria-label="Next page"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds the page number array with ellipsis gaps.
 *
 * Strategy: always show first, last, current, and up to 1 sibling on each side.
 * Everything else collapses into "...".
 *
 * Examples (current = 5, total = 20):
 *   [1, "...", 4, 5, 6, "...", 20]
 *
 * Examples (current = 1, total = 20):
 *   [1, 2, 3, "...", 20]
 *
 * Examples (current = 20, total = 20):
 *   [1, "...", 18, 19, 20]
 */
export function buildPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "...")[] {
  // Show all pages when the total is small enough to fit comfortably
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Window: current ± 1 sibling
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  // First page always visible
  pages.push(1);

  // Left ellipsis if there's a gap after page 1
  if (windowStart > 2) {
    pages.push("...");
  }

  // Middle window
  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  // Right ellipsis if there's a gap before the last page
  if (windowEnd < totalPages - 1) {
    pages.push("...");
  }

  // Last page always visible
  pages.push(totalPages);

  return pages;
}