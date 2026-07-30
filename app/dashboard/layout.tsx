import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export const metadata = {
  title: 'Admin Dashboard - Bus Booking Portal',
  description: 'Bus booking portal administrator panel.',
};

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
