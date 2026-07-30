import React from 'react';
import { SearchClientPage } from '@/features/search/components/search-client-page';

interface SearchPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    passengers?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const from = params.from || 'Hinjewadi';
  const to = params.to || 'Kothrud';
  const date = params.date || new Date().toISOString().split('T')[0];
  const passengers = Number(params.passengers) || 1;

  return (
    <SearchClientPage 
      from={from} 
      to={to} 
      date={date} 
      passengers={passengers} 
    />
  );
}
export type { };
