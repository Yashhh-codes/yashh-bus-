import { redirect } from 'next/navigation';

interface SummaryPageProps {
  params: Promise<{
    scheduleId: string;
  }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const resolvedParams = await params;
  redirect(`/booking/${resolvedParams.scheduleId}/seats`);
}
export type { };

