import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/dashboard/table';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: TableColumn[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  onSort?: (key: string) => void;
  sortField?: string | null;
  sortDirection?: 'asc' | 'desc';
}

export function DataTable<T>({
  columns,
  data,
  renderRow,
  renderMobileCard,
  onSort,
  sortField,
}: DataTableProps<T>) {
  return (
    <>
      {/* Mobile card list — only shown below md breakpoint */}
      {renderMobileCard && (
        <div className="block md:hidden divide-y divide-slate-100">
          {data.map((item, idx) => renderMobileCard(item, idx))}
        </div>
      )}

      {/* Desktop/tablet table — only shown at md+ */}
      <div className={cn("w-full overflow-x-auto", renderMobileCard ? "hidden md:block" : "block")}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSorted = sortField === col.key;
                return (
                  <TableHead
                    key={col.key}
                    className={cn("whitespace-nowrap", col.className)}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="flex items-center space-x-1.5 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
                      >
                        <span>{col.label}</span>
                        <ArrowUpDown className={cn(
                          "h-3 w-3 transition-colors",
                          isSorted ? 'text-indigo-600' : 'text-slate-400'
                        )} />
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => renderRow(item, idx))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
