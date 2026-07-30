'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { busSearchSchema, BusSearchInput } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, Calendar, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const LOCATIONS = ['Swargate', 'Hinjewadi', 'Kothrud', 'Hadapsar', 'Viman Nagar'];

export function SearchWidget() {
  const router = useRouter();
  const [rotate, setRotate] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<BusSearchInput>({
    resolver: zodResolver(busSearchSchema),
    defaultValues: {
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      passengers: 1,
    }
  });

  const fromVal = watch('from');
  const toVal = watch('to');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    setRotate(prev => prev + 180);
    setValue('from', toVal);
    setValue('to', fromVal);
  };

  const onSubmit = (data: BusSearchInput) => {
    router.push(`/search?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&date=${data.date}&passengers=${data.passengers}`);
  };

  // Helper date parsing/manipulations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelectedDate = (date: Date, selectedStr: string) => {
    if (!selectedStr) return false;
    const sel = new Date(selectedStr);
    return date.getDate() === sel.getDate() && 
           date.getMonth() === sel.getMonth() && 
           date.getFullYear() === sel.getFullYear();
  };

  const toDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFormattedDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xl relative z-10 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Departure city */}
        <div className="md:col-span-3 space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-indigo-500" />
            <select
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium transition-all text-sm appearance-none cursor-pointer"
              {...register('from')}
            >
              <option value="" disabled>Select Departure</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc} disabled={toVal === loc}>{loc}</option>
              ))}
            </select>
          </div>
          {errors.from && <p className="text-xs text-red-500 font-medium">{errors.from.message}</p>}
        </div>

        {/* Swap button */}
        <div className="md:col-span-1 flex justify-center pb-1">
          <motion.button
            type="button"
            onClick={handleSwap}
            animate={{ rotate }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full border border-indigo-100 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-90 cursor-pointer"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Destination city */}
        <div className="md:col-span-3 space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-amber-500" />
            <select
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium transition-all text-sm appearance-none cursor-pointer"
              {...register('to')}
            >
              <option value="" disabled>Select Destination</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc} disabled={fromVal === loc}>{loc}</option>
              ))}
            </select>
          </div>
          {errors.to && <p className="text-xs text-red-500 font-medium">{errors.to.message}</p>}
        </div>

        {/* Date selection */}
        <div className="md:col-span-2 space-y-2 relative" ref={calendarRef}>
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <>
                <button
                  type="button"
                  onClick={() => setShowCalendar(prev => !prev)}
                  className="w-full flex items-center gap-3 pl-3 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium transition-all text-sm cursor-pointer select-none text-left shadow-sm h-[40px]"
                >
                  <Calendar className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span className="truncate">{getFormattedDisplay(field.value)}</span>
                </button>

                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-20 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-72 space-y-3 origin-top-left"
                    >
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-850 text-sm select-none">
                          {monthsList[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Weekday labels */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {weekDays.map(wd => (
                          <span key={wd} className="text-[10px] font-bold text-slate-400 uppercase py-1 select-none">
                            {wd}
                          </span>
                        ))}
                      </div>

                      {/* Days grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((day, idx) => {
                          if (!day) return <div key={`empty-${idx}`} />;
                          const isPast = isPastDate(day);
                          const isSelected = isSelectedDate(day, field.value);
                          return (
                            <button
                              key={day.toISOString()}
                              type="button"
                              disabled={isPast}
                              onClick={() => {
                                field.onChange(toDateString(day));
                                setShowCalendar(false);
                              }}
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : isPast
                                  ? 'text-slate-300 cursor-not-allowed opacity-40'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          />
          {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date.message}</p>}
        </div>

        {/* Passenger count */}
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passengers</Label>
          <Controller
            name="passengers"
            control={control}
            render={({ field }) => (
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 h-[40px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg cursor-pointer"
                  disabled={field.value <= 1}
                  onClick={() => field.onChange(field.value - 1)}
                >
                  -
                </Button>
                <span className="flex-1 text-center font-bold text-sm text-slate-800 select-none">
                  {field.value}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg cursor-pointer"
                  disabled={field.value >= 10}
                  onClick={() => field.onChange(field.value + 1)}
                >
                  +
                </Button>
              </div>
            )}
          />
        </div>

        {/* Search submit button */}
        <div className="md:col-span-1 w-full">
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md cursor-pointer h-10 px-5 rounded-xl flex items-center justify-center active:scale-95 transition-all"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
