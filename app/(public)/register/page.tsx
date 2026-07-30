'use client';

import React from 'react';
import { RegisterForm } from '@/features/auth/components/register-form';
import { Bus, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side Pane - Brand Feature (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-950 text-white overflow-hidden flex-col justify-between p-12">
        {/* Decorative Grid Patterns & Ambient Light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />

        {/* Top Info */}
        <div className="relative z-10 flex items-center space-x-2">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Travel Booking</span>
        </div>

        {/* Core Value Proposition Section */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight leading-tight"
          >
            Start Your Premium Journey With Us
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-indigo-200/90 leading-relaxed"
          >
            Create an account to unlock advanced seat booking configurations, ticket validation passes, and live bus updates.
          </motion.p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-start space-x-3"
            >
              <Clock className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-100">Real-time Timetables</h4>
                <p className="text-sm text-indigo-200/70">Always know when buses leave</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-start space-x-3"
            >
              <ShieldCheck className="h-5 w-5 text-indigo-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-100">Secure Payments</h4>
                <p className="text-sm text-indigo-200/70">Safe and reliable booking channels</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-sm text-indigo-300">
          &copy; {new Date().getFullYear()} Travel Booking Passenger App. All rights reserved.
        </div>
      </div>

      {/* Right side Pane - Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-slate-50">
        <RegisterForm />
      </div>
    </div>
  );
}
