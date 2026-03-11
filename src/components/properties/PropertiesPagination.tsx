"use client";
import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useTheme } from "@/providers/ThemeProvider";
import type { Pagination } from "@/types/properties.types";

interface PropertiesPaginationProps {
    pagination: Pagination;
    onPageChange: (page: number) => void;
}

export function PropertiesPagination({ pagination, onPageChange }: PropertiesPaginationProps) {
    const { currentTheme } = useTheme();
    const { page, limit, total, totalPages } = pagination;

    const pageNumbers = buildPageNumbers(page, totalPages);

    return (
        <div
            className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t mt-8"
            style={{ borderColor: currentTheme.borderColor }}
        >
            <div className="text-sm opacity-70" style={{ color: currentTheme.textColor }}>
                Showing <span className="font-bold">{total === 0 ? 0 : (page - 1) * limit + 1}</span> to{" "}
                <span className="font-bold">{Math.min(page * limit, total)}</span> of{" "}
                <span className="font-bold">{total}</span> entries
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                >
                    <MdChevronLeft size={20} />
                </button>

                {pageNumbers.map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => typeof pageNum === "number" ? onPageChange(pageNum) : undefined}
                        disabled={pageNum === "..."}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            page === pageNum ? "text-white shadow-md scale-105" : pageNum === "..." ? "cursor-default" : "hover:bg-black/5"
                        }`}
                        style={{
                            backgroundColor: page === pageNum ? currentTheme.primary : "transparent",
                            color: page === pageNum ? "#fff" : currentTheme.textColor,
                        }}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    style={{ borderColor: currentTheme.borderColor, color: currentTheme.headingColor }}
                >
                    <MdChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}

function buildPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];

    // Always show first page
    pages.push(1);

    // Calculate middle window
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    // Adjust start if end hits the boundary
    if (end === totalPages - 1) {
        start = Math.max(2, end - maxVisible + 1);
    }

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");

    // Always show last page
    pages.push(totalPages);

    return pages;
}