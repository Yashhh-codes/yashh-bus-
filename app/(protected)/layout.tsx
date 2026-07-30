'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { NavigationBar } from '@/components/navigation-bar';
import { Loader2, Bus } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl animate-pulse">
            <Bus className="h-10 w-10 text-white animate-bounce" />
          </div>
          <div className="flex items-center space-x-2 text-indigo-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-bold tracking-wider uppercase">Loading Travel Booking...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-20 md:pb-0">
      <NavigationBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
