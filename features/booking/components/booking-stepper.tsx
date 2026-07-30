'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepId = 'seats' | 'boarding' | 'passengers' | 'review';

interface BookingStepperProps {
  currentStep: StepId;
  steps: { id: StepId; label: string }[];
}

export function BookingStepper({ currentStep, steps }: BookingStepperProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full border-b border-slate-100 bg-white py-2.5 px-4 shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-none gap-3 md:gap-5 py-0.5">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <div className="flex items-center space-x-2 shrink-0">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-200",
                    isCompleted && "bg-indigo-600 border-indigo-600 text-white",
                    isActive && "bg-white border-indigo-600 text-indigo-600 ring-2 ring-indigo-50",
                    !isCompleted && !isActive && "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold tracking-tight transition-colors duration-200",
                    isCompleted && "text-slate-800",
                    isActive && "text-indigo-650 font-black",
                    !isCompleted && !isActive && "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "w-6 sm:w-16 h-0.5 rounded transition-colors duration-200 shrink-0",
                    idx < currentStepIndex ? "bg-indigo-600" : "bg-slate-100"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
