'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepId } from './booking-stepper';

interface StickyCheckoutBarProps {
  currentStep: StepId;
  selectedSeatsCount: number;
  seatPrice: number;
  disabled: boolean;
  onContinue: () => void;
  submitting?: boolean;
  onToggleSummary?: () => void;
}

export function StickyCheckoutBar({
  currentStep,
  selectedSeatsCount,
  seatPrice,
  disabled,
  onContinue,
  submitting = false,
  onToggleSummary,
}: StickyCheckoutBarProps) {
  // Simple calculation matching FareBreakdown's total formula:
  // Base + CGST(2.5%) + SGST(2.5%) + serviceFee (₹30/seat)
  const baseFare = seatPrice * selectedSeatsCount;
  const taxes = Math.round(baseFare * 0.05); // 5% total tax
  const serviceFee = selectedSeatsCount > 0 ? 30 * selectedSeatsCount : 0;
  const totalPrice = baseFare + taxes + serviceFee;

  // Compute CTA button label based on active step
  const getCtaLabel = () => {
    switch (currentStep) {
      case 'seats':
        return (
          <>
            Continue to Boarding <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </>
        );
      case 'boarding':
        return (
          <>
            Continue to Passengers <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </>
        );
      case 'passengers':
        return (
          <>
            Continue to Review <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </>
        );
      case 'review':
        return submitting ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Confirm & Pay <ShieldCheck className="ml-1 h-3.5 w-3.5" />
          </>
        );
      default:
        return 'Continue';
    }
  };

  if (selectedSeatsCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgb(0,0,0,0.05)] px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Left Side: Summary info */}
        <div className="flex flex-col leading-tight cursor-pointer" onClick={onToggleSummary}>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            {selectedSeatsCount} Seat{selectedSeatsCount > 1 ? 's' : ''} Selected
            {onToggleSummary && <span className="text-indigo-650 text-[8px] font-bold underline font-sans ml-1 lg:hidden">Details</span>}
          </span>
          <span className="text-base font-black text-[#1A365D]">
            ₹{totalPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Right Side: CTA Button */}
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled || submitting}
          className={cn(
            "h-10 md:h-12 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-sm flex items-center justify-center transition-all duration-150 active:scale-[0.98] cursor-pointer outline-none border-0",
            disabled || submitting
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
          )}
        >
          {getCtaLabel()}
        </button>
      </div>
    </div>
  );
}
