import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50">
      <span className="text-xs text-slate-400 font-semibold">
        Page {currentPage} of {totalPages || 1} ({totalItems} items total)
      </span>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          <span>Prev</span>
        </button>
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
}
