"use client";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";

type RentPaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function RentPagination({ page, limit, total, totalPages, onPageChange }: RentPaginationProps) {
  const { currentTheme } = useTheme();

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    let p = i + 1;
    if (totalPages > 5 && page > 3) p = page - 2 + i;
    return p <= totalPages ? p : null;
  }).filter(Boolean) as number[];

  return (
    <div
      className="flex items-center justify-between pt-6 border-t"
      style={{ borderColor: currentTheme.borderColor }}
    >
      <p className="text-sm font-medium opacity-70" style={{ color: currentTheme.textColor }}>
        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
        >
          <MdChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1 px-2">
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: page === p ? currentTheme.primary : "transparent",
                color: page === p ? "#fff" : currentTheme.textColor,
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}