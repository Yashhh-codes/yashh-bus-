import React from 'react';
import { SeatSelectionClient } from '@/features/booking/components/seat-selection-client';

interface SeatsPageProps {
  params: Promise<{
    scheduleId: string;
  }>;
  searchParams: Promise<{
    passengers?: string;
  }>;
}

export default async function SeatsPage({ params, searchParams }: SeatsPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const scheduleId = resolvedParams.scheduleId;
  const passengers = Number(resolvedSearch.passengers) || 1;

  return (
    <SeatSelectionClient 
      scheduleId={scheduleId} 
      passengers={passengers} 
    />
  );
}
export type { };
