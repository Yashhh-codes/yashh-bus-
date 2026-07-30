'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bus, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center space-y-6"
      >
        <div className="mx-auto p-4 bg-indigo-50 text-indigo-600 rounded-3xl w-fit border border-indigo-100 shadow-md">
          <Bus className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">404 - Route Not Found</h1>
        <p className="text-slate-600 text-sm">
          Oops! The page/route you are looking for has been delayed, rescheduled, or doesn't exist. Let's get you back on track!
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">
              <Home className="mr-2 h-4 w-4" />
              Go to Landing
            </Button>
          </Link>
          <Link href="/home" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
