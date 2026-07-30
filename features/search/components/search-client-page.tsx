'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '../services/search-service';
import { Schedule } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Calendar, Users, SlidersHorizontal, Info, Compass, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SearchClientPageProps {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

export function SearchClientPage({ from, to, date, passengers }: SearchClientPageProps) {
  const [currentPassengers, setCurrentPassengers] = useState<number>(passengers || 1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: schedules = [], isLoading, error, refetch } = useQuery<Schedule[]>({
    queryKey: ['schedules', from, to, date],
    queryFn: () => searchService.getSchedules(from, to, date),
    staleTime: 60 * 1000,
  });

  const parseTime = (timeStr: string): number => {
    const [time, modifier] = timeStr.split(' ');
    const parts = time.split(':').map(Number);
    let hours = parts[0];
    const minutes = parts[1];
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const getFilteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (selectedTypes.length > 0 && schedule.bus && !selectedTypes.includes(schedule.bus.busType)) {
        return false;
      }
      if (schedule.seatPriceLkr > maxPrice) {
        return false;
      }
      if (selectedTimes.length > 0) {
        const departureMins = parseTime(schedule.departureTime);
        const matchesTime = selectedTimes.some(slot => {
          if (slot === 'Morning') return departureMins >= 0 && departureMins < 720;
          if (slot === 'Afternoon') return departureMins >= 720 && departureMins < 1020;
          if (slot === 'Evening') return departureMins >= 1020 && departureMins < 1440;
          return false;
        });
        if (!matchesTime) return false;
      }
      return true;
    });
  }, [schedules, selectedTypes, selectedTimes, maxPrice]);

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes(prev => checked ? [...prev, type] : prev.filter(t => t !== type));
  };

  const handleTimeChange = (time: string, checked: boolean) => {
    setSelectedTimes(prev => checked ? [...prev, time] : prev.filter(t => t !== time));
  };

  // Resuable Filters content to satisfy anti-duplication principles
  const renderFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center">
          <SlidersHorizontal className="h-4 w-4 mr-2 text-slate-500" />
          Filters
        </h3>
        <button 
          onClick={() => { setSelectedTypes([]); setSelectedTimes([]); setMaxPrice(2500); }}
          className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <Label className="font-bold text-slate-500 uppercase tracking-wider">Max Price</Label>
          <span className="font-bold text-indigo-600">INR {maxPrice}</span>
        </div>
        <input
          type="range"
          min="500"
          max="2500"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
        />
      </div>

      {/* Bus Type */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bus Type</Label>
        <div className="space-y-2">
          {['Standard', 'Luxury', 'Super Luxury'].map((type) => (
            <div key={type} className="flex items-center space-x-2.5">
              <Checkbox 
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-semibold text-slate-700 cursor-pointer">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Departure Time</Label>
        <div className="space-y-2">
          {[
            { label: 'Morning (06 AM - 12 PM)', val: 'Morning' },
            { label: 'Afternoon (12 PM - 05 PM)', val: 'Afternoon' },
            { label: 'Evening (05 PM - 12 AM)', val: 'Evening' },
          ].map((slot) => (
            <div key={slot.val} className="flex items-center space-x-2.5">
              <Checkbox 
                id={`time-${slot.val}`}
                checked={selectedTimes.includes(slot.val)}
                onCheckedChange={(checked) => handleTimeChange(slot.val, !!checked)}
              />
              <Label htmlFor={`time-${slot.val}`} className="text-sm font-semibold text-slate-700 cursor-pointer">{slot.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-sm:pb-24">
      {/* Search Recap Strip */}
      <div className="bg-indigo-950 text-white rounded-3xl p-5 md:p-6 shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        
        <div className="relative z-10 flex items-center space-x-4 md:space-x-6">
          <div className="p-2.5 md:p-3 bg-indigo-600 rounded-2xl shadow-inner">
            <Bus className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center text-md md:text-xl font-bold tracking-tight">
              <span>{from}</span>
              <span className="mx-2 md:mx-3 text-indigo-400">&rarr;</span>
              <span>{to}</span>
            </div>
            <div className="flex items-center space-x-4 text-[10px] md:text-xs text-indigo-200 mt-1 font-medium flex-wrap gap-y-2">
              <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {date}</span>
              
              {/* Interactive Passenger Selector inside the page */}
              <div className="flex items-center space-x-2 bg-indigo-900/60 border border-indigo-700/50 rounded-lg px-2 py-0.5 text-white">
                <Users className="h-3.5 w-3.5 text-indigo-300" />
                <span className="font-bold text-[10px] md:text-xs mr-1">Passengers:</span>
                <button
                  type="button"
                  onClick={() => setCurrentPassengers(prev => Math.max(1, prev - 1))}
                  className="w-5 h-5 flex items-center justify-center bg-indigo-800 hover:bg-indigo-700 rounded text-white font-extrabold text-[10px] md:text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="font-extrabold text-[10px] md:text-xs text-white px-1.5 min-w-[12px] text-center">{currentPassengers}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPassengers(prev => Math.min(10, prev + 1))}
                  className="w-5 h-5 flex items-center justify-center bg-indigo-800 hover:bg-indigo-700 rounded text-white font-extrabold text-[10px] md:text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <Link href="/home" className="relative z-10 w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-white hover:bg-indigo-50 text-indigo-950 hover:text-indigo-900 border-0 shadow-sm cursor-pointer text-xs font-bold rounded-xl h-10 px-5 transition-all">
            Modify Search
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Sidebar Filters (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6">
          {renderFilters()}
        </aside>

        {/* Filter Trigger Button (Mobile only) */}
        <div className="lg:hidden w-full">
          <Button 
            onClick={() => setShowMobileFilters(true)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-slate-200 rounded-xl py-5 text-xs font-bold cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            Filter Results
          </Button>
        </div>

        {/* Results List */}
        <div className="lg:col-span-9 space-y-4 w-full">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((key) => (
                  <Card key={key} className="border-slate-200/80 shadow-sm p-6 space-y-4 bg-white">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48 rounded-lg" />
                        <Skeleton className="h-4 w-32 rounded-lg" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-16 rounded-md" />
                      <Skeleton className="h-4 w-16 rounded-md" />
                      <Skeleton className="h-4 w-16 rounded-md" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="border-red-100 bg-red-50/50 p-6 flex items-center space-x-4">
                <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-red-950">Search Failed</h4>
                  <p className="text-xs text-red-800 mt-1">Failed to query schedules. Check your connection and try again.</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3 border-red-200 text-red-800 hover:bg-red-100/50 cursor-pointer">
                    Retry
                  </Button>
                </div>
              </Card>
            ) : getFilteredSchedules.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-center px-6"
              >
                <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 mb-4">
                  <Compass className="h-8 w-8 animate-spin-slow" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No schedules match your filters</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Try adjusting your price threshold, switching bus types, or modifying date selections.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {getFilteredSchedules.map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  >
                    <Card className="border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                      <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        
                        {/* Travel Timings & Route details (responsive flex reflow) */}
                        <div className="space-y-4 flex-1 w-full">
                          <div className="flex flex-col md:flex-row md:items-center justify-start gap-3 md:gap-6 w-full">
                            
                            {/* Departure */}
                            <div className="flex md:block items-center justify-between md:justify-start">
                              <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departure</span>
                              <div className="text-right md:text-left">
                                <div className="text-lg md:text-xl font-extrabold text-slate-900">{schedule.departureTime}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{from}</div>
                              </div>
                            </div>
                            
                            {/* Proximity / Direction arrow line */}
                            <div className="flex flex-col items-center justify-center md:flex-1 md:max-w-[120px] -my-1.5 md:my-0">
                              <span className="text-[10px] font-bold text-indigo-650 mb-0.5">
                                {schedule.route?.durationHours} hrs
                              </span>
                              <div className="hidden md:block w-full h-px bg-slate-200 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-indigo-600 rounded-full" />
                              </div>
                              <div className="md:hidden text-slate-400 text-xs font-bold animate-pulse">
                                &darr;
                              </div>
                            </div>

                            {/* Arrival */}
                            <div className="flex md:block items-center justify-between md:justify-start">
                              <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrival</span>
                              <div className="text-right md:text-left">
                                <div className="text-lg md:text-xl font-extrabold text-slate-900">{schedule.arrivalTime}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{to}</div>
                              </div>
                            </div>
                          </div>

                          {/* Bus specifications tags */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md font-bold text-slate-600">
                              {schedule.bus?.busNumber}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md font-bold text-indigo-700">
                              {schedule.bus?.busType}
                            </span>
                            {schedule.bus?.amenities.slice(0, 3).map((a, idx) => (
                              <span key={idx} className="text-slate-400 font-medium text-[11px]">
                                &bull; {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price & Call to Action (responsive flex reflow) */}
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 gap-4 w-full md:w-auto">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Per Seat</span>
                            <span className="text-lg md:text-xl font-black text-amber-500">INR {schedule.seatPriceLkr}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Bus Details Dialog */}
                            <Dialog>
                              <DialogTrigger className="text-slate-400 hover:text-slate-600 border border-slate-200 bg-slate-50 shadow-inner rounded-xl p-3 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all active:scale-95">
                                <Info className="h-4.5 w-4.5" />
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
                                <DialogHeader>
                                  <DialogTitle className="font-extrabold text-lg text-slate-955">Bus Specifications</DialogTitle>
                                  <DialogDescription className="text-xs text-slate-500">Details for schedule on {date}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4 text-sm text-slate-700">
                                  <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-500">Bus Operator Code</span>
                                    <span className="font-bold text-slate-900">{schedule.bus?.busNumber}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-500">Bus Comfort Class</span>
                                    <span className="font-bold text-indigo-700">{schedule.bus?.busType}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="font-semibold text-slate-500">Total Seating Capacity</span>
                                    <span className="font-bold text-slate-900">{schedule.bus?.capacity} Seats</span>
                                  </div>
                                  <div className="space-y-2">
                                    <span className="font-semibold text-slate-500 block">Onboard Amenities</span>
                                    <div className="grid grid-cols-2 gap-2">
                                      {schedule.bus?.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center text-xs font-semibold text-slate-600">
                                          <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full mr-2" />
                                          {amenity}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Link href={`/booking/${schedule.id}/seats?passengers=${currentPassengers}`} className="flex-1 md:flex-initial">
                              <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md cursor-pointer transition-all active:scale-98 text-xs py-5 px-5">
                                Select Seats
                              </Button>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Drawer (Bottom Sheet) for filters */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            {/* Slide up panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 rounded-t-3xl p-6 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto lg:hidden"
            >
              {renderFilters()}
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-4 mt-2 cursor-pointer transition-all active:scale-95"
              >
                Apply Filters
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
export type { };
