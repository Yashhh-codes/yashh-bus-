'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, BookingData } from '../services/booking-service';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Ticket, Calendar, Clock, Bus, QrCode, Trash2, ArrowRight, Compass } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function TicketsClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const newBookingId = searchParams.get('newBookingId');
  const queryClient = useQueryClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingData | null>(null);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', user?.uid],
    queryFn: () => bookingService.getBookingsByUser(user?.uid || ''),
    enabled: !!user?.uid,
  });

  useEffect(() => {
    if (newBookingId && bookings.length > 0) {
      const found = bookings.find(b => b.id === newBookingId);
      if (found) {
        const timer = setTimeout(() => {
          setSelectedBooking(found);
          router.replace('/tickets');
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [newBookingId, bookings, router]);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.uid] });
      toast.success('Trip cancelled successfully.');
      setCancelTarget(null);
    },
    onError: () => {
      toast.error('Failed to cancel booking.');
    }
  });

  const handleCancelClick = (booking: BookingData) => {
    setCancelTarget(booking);
  };

  const executeCancellation = () => {
    if (cancelTarget) {
      cancelMutation.mutate(cancelTarget.id);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (activeTab === 'active') {
        return b.status === 'active';
      } else {
        return b.status === 'completed' || b.status === 'cancelled';
      }
    });
  }, [bookings, activeTab]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Tickets</h1>
          <p className="text-slate-500">Access scannable QR ticket passes and view history.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('active')}
            className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer ${
              activeTab === 'active' 
                ? 'bg-white shadow-xs text-indigo-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Trips
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('past')}
            className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer ${
              activeTab === 'past' 
                ? 'bg-white shadow-xs text-indigo-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            History
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(k => (
            <Card key={k} className="p-6 border-slate-200 shadow-sm space-y-4">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-100 bg-red-50/50 p-6">
          <h4 className="font-bold text-red-950">Query Error</h4>
          <p className="text-xs text-red-800 mt-1">Could not fetch booking history records.</p>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm px-6 flex flex-col items-center">
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 mb-4">
            <Compass className="h-8 w-8" />
          </div>
          <h3 className="text-md font-bold text-slate-900">No tickets found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'active' 
              ? 'You do not have any upcoming trips. Search schedules and book one!' 
              : 'You have not completed or cancelled any travel history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          booking.status === 'active' 
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : booking.status === 'cancelled'
                            ? 'bg-rose-50 border border-rose-200 text-rose-700'
                            : 'bg-slate-100 border border-slate-200 text-slate-700'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">ID: {booking.id.substring(0, 8)}</span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                        {booking.routeDetails.departureLocation}
                        <ArrowRight className="h-4 w-4 mx-2 text-slate-400" />
                        {booking.routeDetails.destinationLocation}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" /> {booking.routeDetails.departureDate}</span>
                        <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1 text-slate-400" /> {booking.routeDetails.departureTime}</span>
                        <span className="flex items-center"><Bus className="h-3.5 w-3.5 mr-1 text-slate-400" /> {booking.busDetails.busNumber}</span>
                        <span className="flex items-center"><Ticket className="h-3.5 w-3.5 mr-1 text-indigo-400" /> Seat{booking.selectedSeats.length > 1 ? 's' : ''}: {booking.selectedSeats.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 gap-4">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">Total Price</span>
                        <span className="text-base font-bold text-slate-800">INR {booking.totalPriceLkr}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {booking.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleCancelClick(booking)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-slate-100 rounded-xl cursor-pointer"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        )}
                        <Button
                          onClick={() => setSelectedBooking(booking)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md cursor-pointer transition-all active:scale-95"
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          View Pass
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* QR Ticket Pass Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-xs bg-slate-900 border-indigo-950 p-0 overflow-hidden shadow-2xl rounded-3xl">
          {selectedBooking && (
            <div className="relative text-white p-6 space-y-6">
              {/* Top stub details */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Boarding Pass</span>
                  <h3 className="font-extrabold text-white text-md mt-1 flex items-center">
                    {selectedBooking.routeDetails.departureLocation}
                    <ArrowRight className="h-3 w-3 mx-1 text-white/50" />
                    {selectedBooking.routeDetails.destinationLocation}
                  </h3>
                </div>
                <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                  <Bus className="h-4 w-4" />
                </div>
              </div>

              {/* Passenger Info & Timings */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-white/70">
                <div className="col-span-2">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1">Travelers & Seats</span>
                  <div className="space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    {selectedBooking.passengers && selectedBooking.passengers.length > 0 ? (
                      selectedBooking.passengers.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-white font-bold">{p.name} ({p.age}, {p.gender[0]})</span>
                          <span className="text-indigo-400 font-extrabold">{p.seatNumber}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-bold">{selectedBooking.passengerName || user?.displayName}</span>
                        <span className="text-indigo-400 font-extrabold">{selectedBooking.selectedSeats.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 uppercase tracking-wider block">Coach Info</span>
                  <span className="text-white font-bold">{selectedBooking.busDetails.busNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 uppercase tracking-wider block">Travel Date</span>
                  <span className="text-white font-bold">{selectedBooking.routeDetails.departureDate}</span>
                </div>
                <div className="col-span-2 border-t border-white/5 pt-2">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider block">Departure Time</span>
                  <span className="text-white font-bold">{selectedBooking.routeDetails.departureTime}</span>
                </div>
              </div>

              {/* Selected Seats */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl">
                <span className="text-xs font-semibold text-white/60">Selected Seats</span>
                <span className="text-sm font-black text-indigo-400">{selectedBooking.selectedSeats.join(', ')}</span>
              </div>

              {/* Dynamic QR Code stub split */}
              <div className="relative flex flex-col items-center bg-white rounded-2xl p-4 border border-slate-100 shadow-md">
                {/* Left side circular cut */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 h-6 w-6 bg-slate-900 border-r border-indigo-950 rounded-full" />
                {/* Right side circular cut */}
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 bg-slate-900 border-l border-indigo-950 rounded-full" />

                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedBooking.id}`}
                  alt="Boarding QR Code"
                  className="h-32 w-32 object-contain"
                />
                <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-2 select-all">
                  REF: {selectedBooking.id.substring(0, 12)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-slate-950 text-lg">Cancel Travel Booking?</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              This action cannot be undone. Refund processing will adhere to our standard transit refund policies.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="font-medium text-slate-700">Are you sure you want to cancel booking for:</p>
            <p className="font-bold text-slate-900 mt-2 flex items-center">
              {cancelTarget?.routeDetails.departureLocation}
              <ArrowRight className="h-4 w-4 mx-1.5 text-slate-400" />
              {cancelTarget?.routeDetails.destinationLocation}
            </p>
            <p className="text-xs text-slate-500 mt-1">Date: {cancelTarget?.routeDetails.departureDate} at {cancelTarget?.routeDetails.departureTime}</p>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)} className="rounded-xl font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 text-xs py-2 cursor-pointer">
              No, Keep Booking
            </Button>
            <Button
              onClick={executeCancellation}
              disabled={cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs py-2 cursor-pointer transition-all"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Trip'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export type { };
