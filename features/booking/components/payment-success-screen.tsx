'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PaymentSuccessScreen() {
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    // 800ms: Confirmed -> Generating Ticket
    const timer1 = setTimeout(() => {
      setStage(2);
    }, 850);

    // 1700ms: Generating Ticket -> Redirecting
    const timer2 = setTimeout(() => {
      setStage(3);
    }, 1750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-50/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white border border-slate-200/60 rounded-[28px] p-8 shadow-xl text-center space-y-6">
        
        {/* Animated Checkmark Circle */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="h-20 w-20 rounded-full bg-[#EAF3EF] flex items-center justify-center text-[#1F5E45]"
          >
            <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
          </motion.div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <motion.h2
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-2xl font-black text-slate-900 tracking-tight"
          >
            Booking Confirmed
          </motion.h2>
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-xs text-slate-500 font-semibold"
          >
            Your payment was processed successfully.
          </motion.p>
        </div>

        {/* Progress List */}
        <div className="border-t border-slate-100 pt-5 space-y-3.5 text-left max-w-xs mx-auto">
          {/* Step 1: Confirmed */}
          <div className="flex items-center space-x-3 text-xs font-bold">
            <div className="h-5.5 w-5.5 rounded-full bg-[#EAF3EF] text-[#1F5E45] flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <span className="text-slate-800">Seat Reservation Secured</span>
          </div>

          {/* Step 2: Generating Ticket */}
          <div className="flex items-center space-x-3 text-xs font-bold">
            <div className="h-5.5 w-5.5 flex items-center justify-center">
              {stage >= 2 ? (
                <div className="h-5.5 w-5.5 rounded-full bg-[#EAF3EF] text-[#1F5E45] flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              ) : (
                <Loader2 className="h-4.5 w-4.5 text-[#1F5E45] animate-spin" />
              )}
            </div>
            <span className={stage >= 2 ? "text-slate-800" : "text-slate-400"}>
              Generating Scannable Ticket Pass...
            </span>
          </div>

          {/* Step 3: Redirecting */}
          <div className="flex items-center space-x-3 text-xs font-bold">
            <div className="h-5.5 w-5.5 flex items-center justify-center">
              {stage === 3 ? (
                <Loader2 className="h-4.5 w-4.5 text-[#1F5E45] animate-spin" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-slate-200" />
              )}
            </div>
            <span className={stage === 3 ? "text-slate-800" : "text-slate-400"}>
              Redirecting to boarding passes...
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
