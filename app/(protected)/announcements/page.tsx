'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone, AlertTriangle, AlertCircle, Info, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  category: 'warning' | 'info' | 'maintenance';
  content: string;
  createdAt: string;
  isActive: boolean;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Swargate Highway Repairs in Progress',
    category: 'warning',
    content: 'Minor highway repair work is starting near Swargate. Please expect possible delays of 10-15 minutes on Mumbai-Pune Expressway routes (Hinjewadi/Viman Nagar lines).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isActive: true,
  },
  {
    id: 'a2',
    title: 'New Luxury Coach Added to Fleet',
    category: 'info',
    content: 'We have registered ND-3972, a state-of-the-art Super Luxury coach, on the Swargate-Kothrud route. Book seats today to enjoy onboard entertainment screens and complimentary refreshments.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isActive: true,
  },
  {
    id: 'a3',
    title: 'System Server Maintenance Update',
    category: 'maintenance',
    content: 'Our payment checkout integrations will undergo quick security maintenance on Sunday, August 2nd between 02:00 AM and 04:00 AM LKR time. Seat selections and cancellations will be briefly offline.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isActive: true,
  }
];

export default function AnnouncementsPage() {
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      try {
        const ref = collection(db, 'announcements');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const results: Announcement[] = [];
        snap.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        return results.length > 0 ? results : MOCK_ANNOUNCEMENTS;
      } catch (err) {
        console.error('Error fetching announcements:', err);
        return MOCK_ANNOUNCEMENTS;
      }
    }
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center">
          <Megaphone className="h-7 w-7 mr-3 text-indigo-600 animate-bounce" style={{ animationDuration: '3s' }} />
          Notice Board
        </h1>
        <p className="text-slate-500">Stay updated on schedule changes, expressway details, and route repairs.</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          [1, 2].map((k) => (
            <Card key={k} className="p-6 border-slate-200 bg-white">
              <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
              <Skeleton className="h-4 w-1/2 rounded-md mb-4" />
              <Skeleton className="h-16 w-full rounded-md" />
            </Card>
          ))
        ) : (
          announcements.map((ann) => {
            const isWarning = ann.category === 'warning';
            const isMaintenance = ann.category === 'maintenance';
            const CategoryIcon = isWarning ? AlertTriangle : isMaintenance ? AlertCircle : Info;

            return (
              <Card 
                key={ann.id}
                className={`border-l-4 bg-white shadow-xs overflow-hidden transition-all hover:shadow-md ${
                  isWarning 
                    ? 'border-l-amber-500 border-slate-200' 
                    : isMaintenance 
                    ? 'border-l-indigo-600 border-slate-200' 
                    : 'border-l-slate-400 border-slate-200'
                }`}
              >
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isWarning 
                        ? 'bg-amber-50 text-amber-600' 
                        : isMaintenance 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'bg-slate-100 text-slate-650'
                    }`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">{ann.title}</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-0.5 text-slate-400">
                        {ann.category}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-slate-400 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(ann.createdAt)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 text-xs font-semibold text-slate-600 leading-relaxed">
                  {ann.content}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
export type { };
