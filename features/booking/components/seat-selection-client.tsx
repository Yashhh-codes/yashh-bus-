'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/features/search/services/search-service';
import { bookingService } from '@/features/booking/services/booking-service';
import { useAuth } from '@/providers/auth-provider';
import { seatLockService } from '@/services/bookings/seatLockService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Wizard Components
import { BookingStepper, StepId } from './booking-stepper';
import { BusSummaryCard, BoardingDroppingPoint } from './bus-summary-card';
import { SeatMap } from './seat-map';
import { BoardingSelector } from './boarding-selector';
import { PassengerForm, Passenger } from './passenger-form';
import { ReviewCard } from './review-card';
import { StickyCheckoutBar } from './sticky-checkout-bar';
import { PaymentSuccessScreen } from './payment-success-screen';

interface SeatSelectionClientProps {
  scheduleId: string;
  passengers: number; // Ignored as seat selection dictates passenger count
}

// Utility to add minutes to time string (e.g. "08:30 AM" + 30 -> "09:00 AM")
function addMinutesToTimeString(timeStr: string, minsToAdd: number): string {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes + minsToAdd, 0);

    let newHours = date.getHours();
    const newMinutes = date.getMinutes();
    const newAmpm = newHours >= 12 ? 'PM' : 'AM';

    if (newHours > 12) newHours -= 12;
    if (newHours === 0) newHours = 12;

    const minStr = String(newMinutes).padStart(2, '0');
    return `${newHours}:${minStr} ${newAmpm}`;
  } catch {
    return timeStr;
  }
}

export function SeatSelectionClient({ scheduleId }: SeatSelectionClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Step Wizard state
  const [step, setStep] = useState<StepId | 'payment_success'>('seats');
  
  // Selected seats & details
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedBoarding, setSelectedBoarding] = useState<BoardingDroppingPoint | null>(null);
  const [selectedDropping, setSelectedDropping] = useState<BoardingDroppingPoint | null>(null);

  // Dynamic Passenger details array matching selectedSeats length
  const [passengersList, setPassengersList] = useState<Passenger[]>([]);
  const [whatsAppUpdates, setWhatsAppUpdates] = useState(true);

  // Seat hold timer states
  const [holdTimerExpiration, setHoldTimerExpiration] = useState<number | null>(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null);

  // Mobile drawer visibility
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Optional parameters
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [otherSpecialRequest, setOtherSpecialRequest] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch schedule properties
  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => searchService.getScheduleById(scheduleId),
  });

  // Prefill Passenger 1 details when user object is available
  useEffect(() => {
    if (user && passengersList.length > 0) {
      const timer = setTimeout(() => {
        setPassengersList(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          if (updated[0]) {
            updated[0].name = updated[0].name || user.displayName || '';
            updated[0].phone = updated[0].phone || user.phoneNumber || '';
            updated[0].email = updated[0].email || user.email || '';
          }
          return updated;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, passengersList.length]);

  // Seat Hold Timer: Start when first seat is selected, reset when empty
  useEffect(() => {
    if (selectedSeats.length > 0) {
      if (!holdTimerExpiration) {
        const expiration = Date.now() + 10 * 60 * 1000; // 10 minutes from selection
        setHoldTimerExpiration(expiration);
        setHoldSecondsLeft(600);
      }
    } else {
      setHoldTimerExpiration(null);
      setHoldSecondsLeft(null);
    }
  }, [selectedSeats.length, holdTimerExpiration]);

  // Seat Hold Timer Tick logic
  useEffect(() => {
    if (!holdTimerExpiration) return;

    const interval = setInterval(() => {
      const seconds = Math.max(0, Math.round((holdTimerExpiration - Date.now()) / 1000));
      setHoldSecondsLeft(seconds);

      if (seconds <= 0) {
        clearInterval(interval);
        toast.error('Seat hold session expired. Selected seats have been released.', {
          duration: 5050,
        });
        // Release seats in database and reset checkout progress
        const userId = user?.uid || user?.phoneNumber || 'anonymous-device';
        seatLockService.releaseAllUserLocks(scheduleId, userId).then(() => {
          setSelectedSeats([]);
          setPassengersList([]);
          setHoldTimerExpiration(null);
          setHoldSecondsLeft(null);
          setStep('seats');
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdTimerExpiration, user, scheduleId]);

  // Dynamic Pick-up and Dropoff points selector options based on route
  const boardingPoints = useMemo<BoardingDroppingPoint[]>(() => {
    if (!schedule || !schedule.route) return [];
    const depLoc = schedule.route.departureLocation || '';
    const depTime = schedule.departureTime;

    if (depLoc.toLowerCase().includes('pune')) {
      return [
        { id: 'bp-1', time: depTime, label: 'Pune Station' },
        { id: 'bp-2', time: addMinutesToTimeString(depTime, 30), label: 'Swargate' },
        { id: 'bp-3', time: addMinutesToTimeString(depTime, 50), label: 'Wakad' },
      ];
    }
    return [
      { id: 'bp-1', time: depTime, label: `${depLoc} Central Bus Stand` },
      { id: 'bp-2', time: addMinutesToTimeString(depTime, 30), label: `${depLoc} Bypass Highway` },
    ];
  }, [schedule]);

  const droppingPoints = useMemo<BoardingDroppingPoint[]>(() => {
    if (!schedule || !schedule.route) return [];
    const destLoc = schedule.route.destinationLocation || '';
    const arrTime = schedule.arrivalTime;

    if (destLoc.toLowerCase().includes('kolhapur')) {
      return [
        { id: 'dp-1', time: arrTime, label: 'Kolhapur Stand' },
        { id: 'dp-2', time: addMinutesToTimeString(arrTime, 20), label: 'Shivaji Chowk' },
      ];
    }
    return [
      { id: 'dp-1', time: arrTime, label: `${destLoc} Main Chowk` },
      { id: 'dp-2', time: addMinutesToTimeString(arrTime, 20), label: `${destLoc} Station Exit` },
    ];
  }, [schedule]);

  const activeBoarding = selectedBoarding || boardingPoints[0] || null;
  const activeDropping = selectedDropping || droppingPoints[0] || null;

  const handleSeatSelect = async (seatId: string) => {
    const isDeselect = selectedSeats.includes(seatId);
    const userId = user?.uid || user?.phoneNumber || 'anonymous-device';

    if (isDeselect) {
      // Deselecting seat: release lock
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      setPassengersList(prev => prev.slice(0, prev.length - 1));
      await seatLockService.releaseLock(scheduleId, seatId, userId);
    } else {
      // Selecting seat: attempt to acquire lock
      if (selectedSeats.length >= 6) {
        toast.error('You can select a maximum of 6 seats.');
        return;
      }
      
      const success = await seatLockService.acquireLock(scheduleId, seatId, userId);
      if (!success) {
        toast.error(`Seat ${seatId} is currently held by another passenger. Please select another seat.`);
        return;
      }

      // Successfully locked! Update state
      setSelectedSeats(prev => [...prev, seatId]);
      setPassengersList(prev => [
        ...prev,
        {
          name: prev.length === 0 && user ? user.displayName || '' : '',
          age: '',
          gender: '',
          phone: prev.length === 0 && user ? user.phoneNumber || '' : '',
          email: prev.length === 0 && user ? user.email || '' : '',
        }
      ]);
    }
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    setPassengersList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear specific field validation error once fixed
    if (errors[`p-${index}-${field}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`p-${index}-${field}`];
        return next;
      });
    }
  };

  const handleSpecialRequestToggle = (req: string) => {
    setSpecialRequests(prev => {
      if (prev.includes(req)) {
        return prev.filter(r => r !== req);
      }
      return [...prev, req];
    });
  };

  // Checkout progression & Validation
  const handleContinue = () => {
    if (step === 'seats') {
      if (selectedSeats.length === 0) {
        toast.error('Please select at least one seat.');
        return;
      }
      setStep('boarding');
    } else if (step === 'boarding') {
      if (!activeBoarding || !activeDropping) {
        toast.error('Please select boarding and dropping points.');
        return;
      }
      setStep('passengers');
    } else if (step === 'passengers') {
      // Validate passengers forms details
      const newErrors: Record<string, string> = {};
      passengersList.forEach((p, idx) => {
        if (!p.name.trim()) {
          newErrors[`p-${idx}-name`] = 'Full name is required';
        }
        if (!p.age.trim()) {
          newErrors[`p-${idx}-age`] = 'Age is required';
        } else if (isNaN(Number(p.age)) || Number(p.age) <= 0 || Number(p.age) > 120) {
          newErrors[`p-${idx}-age`] = 'Enter a valid age';
        }
        if (!p.gender) {
          newErrors[`p-${idx}-gender`] = 'Gender selection is required';
        }

        // Contact info validation (checked once on index 0 fields)
        if (idx === 0) {
          if (!p.phone.trim()) {
            newErrors['p-0-phone'] = 'Contact phone number is required';
          }
          if (p.email.trim() && !/\S+@\S+\.\S+/.test(p.email)) {
            newErrors['p-0-email'] = 'Enter a valid email address';
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fix form validation errors.');
        return;
      }

      setErrors({});
      setStep('review');
    } else if (step === 'review') {
      handleConfirmBooking();
    }
  };

  const handleBack = () => {
    if (step === 'boarding') setStep('seats');
    else if (step === 'passengers') setStep('boarding');
    else if (step === 'review') setStep('passengers');
  };

  const handleConfirmBooking = async () => {
    if (passengersList.length === 0) return;
    setSubmitting(true);
    try {
      const primaryPassenger = passengersList[0];
      const totalPrice = schedule!.seatPriceLkr * selectedSeats.length;
      
      const result = await bookingService.createBooking({
        userId: user?.uid || undefined,
        passengerName: primaryPassenger.name.trim(),
        phoneNumber: primaryPassenger.phone.trim(),
        email: primaryPassenger.email.trim() || undefined,
        whatsAppUpdates,
        scheduleId,
        selectedSeats,
        amount: totalPrice,
        gstEnabled,
        gstNumber,
        companyName,
        specialRequests,
        otherSpecialRequest,
        passengers: passengersList,
      });

      // Save additional passenger details, GST details and requests locally keyed by ID
      if (typeof window !== 'undefined') {
        const metadata = {
          passengers: passengersList,
          boardingPoint: activeBoarding,
          droppingPoint: activeDropping,
          gstEnabled,
          gstNumber,
          companyName,
          specialRequests,
          otherSpecialRequest,
          whatsAppUpdates
        };
        localStorage.setItem(`booking_meta_${result.id}`, JSON.stringify(metadata));
      }

      // Transition to success screen
      setStep('payment_success');

      // Success screen handles loader animation and redirection
      setTimeout(() => {
        router.push(`/tickets?newBookingId=${result.id}`);
      }, 2500);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Booking confirmation failed:', error);
      toast.error(error.message || 'Failed to place booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format countdown timer (secs -> MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Rendering screens
  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-10">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Failed to load schedule details</h3>
        <Button onClick={() => router.push('/home')} className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer text-xs h-8">
          Go back Home
        </Button>
      </div>
    );
  }

  if (step === 'payment_success') {
    return <PaymentSuccessScreen />;
  }

  // Set checkout steps list
  const stepsList = [
    { id: 'seats' as StepId, label: 'Seats' },
    { id: 'boarding' as StepId, label: 'Boarding' },
    { id: 'passengers' as StepId, label: 'Passengers' },
    { id: 'review' as StepId, label: 'Review' },
  ];

  // Disable CTA based on active state criteria
  const isCtaDisabled = () => {
    if (step === 'seats') return selectedSeats.length === 0;
    if (step === 'boarding') return !activeBoarding || !activeDropping;
    return false;
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-24 px-4">
      
      {/* Wizard Step Progression Indicator */}
      <BookingStepper currentStep={step} steps={stepsList} />

      {/* Seat Hold Timer Alert Bar (renders when seats are selected) */}
      {holdSecondsLeft !== null && (
        <div className="bg-amber-50 border border-amber-200/60 text-amber-800 px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px] font-bold shadow-xs select-none">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0 animate-pulse" />
            <span>Seats held temporarily for checkout. Please complete booking before timer expires.</span>
          </div>
          <span className="bg-white border border-amber-300 text-amber-700 px-2 py-0.5 rounded-lg font-black font-mono">
            {formatTimer(holdSecondsLeft)}
          </span>
        </div>
      )}

      {/* Main Grid Layout (Left: 9 cols, Right: 3 cols for width compacting) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column (Checkout Active Step View) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center space-x-3 pb-1">
            {step !== 'seats' && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white transition-all cursor-pointer outline-none"
              >
                <ArrowLeft className="h-4 w-4 text-slate-650" />
              </button>
            )}
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-950 tracking-tight capitalize">
                {step === 'seats' && 'Select Seating Layout'}
                {step === 'boarding' && 'Select Boarding & Dropping'}
                {step === 'passengers' && 'Enter Passenger Details'}
                {step === 'review' && 'Review Booking Details'}
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {step === 'seats' && 'Click available seats to reserve'}
                {step === 'boarding' && 'Pick convenient boarding and drop off points'}
                {step === 'passengers' && 'Fill verified traveler identification information'}
                {step === 'review' && 'Verify checkout details before payment'}
              </p>
            </div>
          </div>

          {step === 'seats' && schedule.bus && (
            <SeatMap
              rows={schedule.bus.seatingConfig.rows}
              columnsPattern={schedule.bus.seatingConfig.layoutPattern}
              bookedSeats={schedule.bookedSeats || []}
              unavailableSeats={schedule.bus.seatingConfig.unavailableSeats || []}
              selectedSeats={selectedSeats}
              maxSelectable={6}
              onSeatSelect={handleSeatSelect}
              busType={schedule.bus.busType}
            />
          )}

          {step === 'boarding' && (
            <BoardingSelector
              boardingPoints={boardingPoints}
              droppingPoints={droppingPoints}
              selectedBoarding={activeBoarding}
              selectedDropping={activeDropping}
              onSelectBoarding={setSelectedBoarding}
              onSelectDropping={setSelectedDropping}
            />
          )}

          {step === 'passengers' && (
            <PassengerForm
              selectedSeats={selectedSeats}
              passengers={passengersList}
              onChangePassenger={handlePassengerChange}
              whatsAppUpdates={whatsAppUpdates}
              onWhatsAppUpdatesChange={setWhatsAppUpdates}
              gstEnabled={gstEnabled}
              gstNumber={gstNumber}
              companyName={companyName}
              onGstToggle={setGstEnabled}
              onGstChange={(field, val) => {
                if (field === 'gstNumber') setGstNumber(val);
                else setCompanyName(val);
              }}
              specialRequests={specialRequests}
              onSpecialRequestToggle={handleSpecialRequestToggle}
              otherSpecialRequest={otherSpecialRequest}
              onOtherSpecialRequestChange={setOtherSpecialRequest}
              errors={errors}
            />
          )}

          {step === 'review' && (
            <ReviewCard
              schedule={schedule}
              selectedSeats={selectedSeats}
              selectedBoarding={activeBoarding}
              selectedDropping={activeDropping}
              passengers={passengersList}
              gstEnabled={gstEnabled}
              gstNumber={gstNumber}
              companyName={companyName}
              specialRequests={specialRequests}
              otherSpecialRequest={otherSpecialRequest}
            />
          )}
        </div>

        {/* Right Column (Sticky Checkout Summary Details - hidden on mobile, slides up as sheet drawer) */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-8 space-y-4">
          <BusSummaryCard
            schedule={schedule}
            selectedSeats={selectedSeats}
            selectedBoarding={activeBoarding}
            selectedDropping={activeDropping}
          />
        </div>
      </div>

      {/* Mobile Drawer (Bottom Sheet) for Trip Summary */}
      {showMobileSummary && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden flex flex-col justify-end">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowMobileSummary(false)} 
          />
          <div className="relative bg-white rounded-t-[28px] border-t border-slate-200 px-6 pt-3 pb-[calc(24px+env(safe-area-inset-bottom,0px))] space-y-3.5 shadow-2xl max-h-[85vh] overflow-y-auto z-50">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2 cursor-pointer" onClick={() => setShowMobileSummary(false)} />
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Trip Summary</span>
              <button 
                onClick={() => setShowMobileSummary(false)} 
                className="text-xs font-bold text-indigo-650 hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
            <BusSummaryCard
              schedule={schedule}
              selectedSeats={selectedSeats}
              selectedBoarding={activeBoarding}
              selectedDropping={activeDropping}
            />
          </div>
        </div>
      )}

      {/* Fixed Footer Sticky Bar Checkout Control */}
      <StickyCheckoutBar
        currentStep={step}
        selectedSeatsCount={selectedSeats.length}
        seatPrice={schedule?.seatPriceLkr || 0}
        disabled={isCtaDisabled()}
        onContinue={handleContinue}
        submitting={submitting}
        onToggleSummary={() => setShowMobileSummary(true)}
      />
    </div>
  );
}
export type { };
