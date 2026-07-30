'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/features/search/services/search-service';
import { bookingService } from '@/features/booking/services/booking-service';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowLeft, Loader2, ShieldCheck, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

interface BookingSummaryClientProps {
  scheduleId: string;
  seats: string[];
}

export function BookingSummaryClient({ scheduleId, seats }: BookingSummaryClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Passenger details input states
  const [passengerName, setPassengerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync user details if logged in (optional fallback helper)
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setPassengerName(prev => prev || user.displayName || '');
        setPhoneNumber(prev => prev || user.phoneNumber || '');
        setEmail(prev => prev || user.email || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => searchService.getScheduleById(scheduleId),
  });

  const totalPrice = useMemo(() => {
    if (!schedule) return 0;
    return schedule.seatPriceLkr * seats.length;
  }, [schedule, seats]);

  const handleConfirmBooking = async () => {
    if (!passengerName.trim()) {
      toast.error('Please enter passenger full name.');
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error('Please enter passenger phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await bookingService.createBooking({
        passengerName: passengerName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
        scheduleId,
        selectedSeats: seats,
        amount: totalPrice,
      });
      
      toast.success('Booking confirmed successfully!');
      router.push(`/tickets?newBookingId=${result.id}`);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Booking creation error:', error);
      toast.error(error.message || 'Failed to place booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-md mx-auto py-10">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Failed to load booking details</h3>
        <Button onClick={() => router.push('/home')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          Go back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Back button and title */}
      <div className="flex items-center space-x-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">Booking Summary</h1>
          <p className="text-xs text-slate-500">Confirm details and generate your ticket pass.</p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3.5 px-5 flex flex-row items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Ticket className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-slate-950 font-bold text-sm">Verify Trip Pass</CardTitle>
            <CardDescription className="text-[11px] text-slate-400">Passenger booking details.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          
          {/* Passenger details inputs */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Passenger Info</span>
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="space-y-1">
                <Label htmlFor="passengerName" className="font-bold text-slate-500">Full Name *</Label>
                <Input
                  id="passengerName"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="bg-white border-slate-200 text-slate-800 text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="font-bold text-slate-500">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="bg-white border-slate-200 text-slate-800 text-xs h-9"
                  type="tel"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="font-bold text-slate-500">Email Address (Optional)</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. amit@example.com"
                  className="bg-white border-slate-200 text-slate-800 text-xs h-9"
                  type="email"
                />
              </div>
            </div>
          </div>

          {/* Route details (2x2 Grid) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Itinerary</span>
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-3.5 border border-slate-100 rounded-xl text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Route</span>
                <div className="font-extrabold text-slate-900 mt-0.5 flex items-center">
                  {schedule.route?.departureLocation}
                  <ArrowRight className="h-3 w-3 mx-1 text-slate-400" />
                  {schedule.route?.destinationLocation}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Travel Date</span>
                <div className="font-bold text-slate-900 mt-0.5">{schedule.departureDate}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Departure Time</span>
                <div className="font-bold text-slate-900 mt-0.5">{schedule.departureTime}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Coach Class</span>
                <div className="font-bold text-indigo-700 mt-0.5 truncate">
                  {schedule.bus?.busType} ({schedule.bus?.busNumber})
                </div>
              </div>
            </div>
          </div>

          {/* Seat specifications and Price in a single horizontal grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3">
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Seats</span>
              <span className="font-extrabold text-indigo-600 mt-0.5 text-sm">
                {seats.join(', ')}
              </span>
            </div>
            <div className="flex flex-col justify-center text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Due</span>
              <span className="text-lg font-black text-amber-500 mt-0.5">INR {totalPrice}</span>
            </div>
          </div>

          {/* Checkbox confirmation */}
          <div className="flex items-center space-x-2 pt-2 justify-center">
            <Checkbox 
              id="confirm" 
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(!!checked)}
            />
            <Label htmlFor="confirm" className="text-slate-700 text-xs font-semibold cursor-pointer select-none">
              I confirm the travel details above
            </Label>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-5 py-3.5 flex flex-col items-center gap-2">
          <Button
            disabled={!isConfirmed || submitting || !passengerName.trim() || !phoneNumber.trim()}
            onClick={handleConfirmBooking}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.98] h-11"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming Trip...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4.5 w-4.5" />
                Confirm Booking
              </>
            )}
          </Button>
          <span className="text-[9px] text-slate-400 font-medium">By confirming, you agree to our transit policies.</span>
        </CardFooter>
      </Card>
    </div>
  );
}
export type { };
