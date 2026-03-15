"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    pageSize?: number;
}

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const start = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
    const end = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            {/* Info */}
            {totalItems !== undefined && (
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                    {start}–{end} / {totalItems} kayıt
                </span>
            )}

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* First */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="İlk sayfa"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Prev */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Önceki"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {getVisiblePages().map((page, i) =>
                    page === "..." ? (
                        <span key={`dot-${i}`} className="px-1 text-white/20 text-xs">…</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`min-w-[32px] h-8 rounded-md text-xs font-bold transition-all ${
                                currentPage === page
                                    ? "bg-danger text-white shadow-lg shadow-danger/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Sonraki"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Son sayfa"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
