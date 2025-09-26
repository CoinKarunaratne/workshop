// src/components/app/jobs/pagination-bar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;            // 1-based
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: range + size */}
      <div className="flex items-center gap-3 text-sm">
        <div className="text-muted-foreground">
          {total ? <>Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of <span className="font-medium">{total}</span></> : "No results"}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(parseInt(v, 10))}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center justify-end gap-1">
        {/* Mobile: just Prev/Next + Page X of Y */}
        <div className="flex items-center gap-2 sm:hidden text-sm text-muted-foreground mr-2">
          Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
        </div>

        <Button variant="outline" size="sm" onClick={() => go(1)} disabled={page <= 1} className="hidden sm:inline-flex">
          « First
        </Button>
        <Button variant="outline" size="sm" onClick={() => go(page - 1)} disabled={page <= 1}>
          ‹ Prev
        </Button>

        {/* Desktop: numbered pages (simple window) */}
        <div className="hidden sm:flex items-center">
          {pageWindow(page, totalPages, 5).map((p, i) =>
            p === -1 ? (
              <span key={`el-${i}`} className="px-2 text-muted-foreground">…</span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className="mx-0.5"
                onClick={() => go(p)}
              >
                {p}
              </Button>
            )
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => go(page + 1)} disabled={page >= totalPages}>
          Next ›
        </Button>
        <Button variant="outline" size="sm" onClick={() => go(totalPages)} disabled={page >= totalPages} className="hidden sm:inline-flex">
          Last »
        </Button>
      </div>
    </div>
  );
}

function pageWindow(current: number, total: number, radius = 2): number[] {
  // returns an array with numbers and -1 as ellipsis markers
  const pages: number[] = [];
  const start = Math.max(1, current - radius);
  const end = Math.min(total, current + radius);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push(-1);
  }
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total) {
    if (end < total - 1) pages.push(-1);
    pages.push(total);
  }
  return pages;
}
