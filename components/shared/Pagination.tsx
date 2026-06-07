'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: {
  currentPage: number; totalPages: number; onPageChange: (p: number) => void; totalItems: number; itemsPerPage: number;
}) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{start}–{end}</span> / {totalItems} ta
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={15} />
        </button>
        {pages.map((page, i) => (
          <span key={page} className="flex items-center">
            {i > 0 && pages[i - 1] !== page - 1 && <span className="px-1 text-slate-400 text-xs">...</span>}
            <button onClick={() => onPageChange(page)}
              className={cn('w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all',
                page === currentPage ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50')}>
              {page}
            </button>
          </span>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
