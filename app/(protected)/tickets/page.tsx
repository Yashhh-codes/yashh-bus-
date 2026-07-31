import React, { Suspense } from 'react';
import { TicketsClient } from '@/features/booking/components/tickets-client';

export default function TicketsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl animate-pulse h-96">
        <span className="text-sm font-semibold text-slate-400">Loading Tickets...</span>
      </div>
    }>
      <TicketsClient />
    </Suspense>
  );
}
export type { };
