'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Ticket, MapPin, Search, Calendar, ShieldCheck, HelpCircle, Megaphone, Users, ArrowLeftRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const LOCATIONS = ['Swargate', 'Hinjewadi', 'Kothrud', 'Hadapsar', 'Viman Nagar'];

const searchSchema = z.object({
  from: z.string().min(1, "Please select departure location"),
  to: z.string().min(1, "Please select destination location"),
  date: z.string().min(1, "Please select a date"),
  passengers: z.string().min(1, "Please select traveler count"),
}).refine(data => data.from !== data.to, {
  message: "Origin and destination cannot be the same",
  path: ["to"],
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function LandingPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [rotate, setRotate] = useState(0);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      passengers: '1',
    }
  });

  const fromVal = watch('from');
  const toVal = watch('to');

  const handleSwap = () => {
    setRotate(prev => prev + 180);
    setValue('from', toVal);
    setValue('to', fromVal);
  };

  const onSubmit = (data: SearchFormValues) => {
    // Redirect public guest searches to login/register flow carrying search parameters
    router.push(`/register?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&date=${data.date}&passengers=${data.passengers}`);
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const sectionIds = ['home', 'features', 'routes', 'notices'];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  } as const;

  const popularRoutes = [
    { from: 'Hinjewadi Phase 3', to: 'Viman Nagar', duration: '1.2 hrs', price: 'INR 120', type: 'Super Luxury' },
    { from: 'Kothrud Depot', to: 'Swargate', duration: '0.5 hrs', price: 'INR 40', type: 'Luxury' },
    { from: 'Hadapsar', to: 'Baner', duration: '1.0 hrs', price: 'INR 130', type: 'Standard' },
    { from: 'Pimpri', to: 'Shivajinagar', duration: '0.9 hrs', price: 'INR 100', type: 'Luxury' },
  ];

  return (
    <div className="flex flex-col min-h-fit bg-[#F8FAFC]">
      {/* Dynamic Fonts & Style overrides from Stitch layout */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `
        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(180deg, rgba(240, 244, 248, 0.1) 0%, rgba(240, 244, 248, 0) 25%),
            radial-gradient(circle at 20% 50%, rgba(240, 244, 248, 0.4) 0%, rgba(240, 244, 248, 0) 65%),
            linear-gradient(90deg, rgba(240, 244, 248, 0.92) 20%, rgba(240, 244, 248, 0.4) 55%, rgba(240, 244, 248, 0) 85%);
        }
        .floating-card-shadow {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .search-container-blur {
          backdrop-filter: blur(28px) saturate(210%);
          background-color: rgba(240, 244, 248, 0.65);
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.12);
        }
        .font-serif-heading {
          font-family: 'Playfair Display', serif;
        }
      `}} />

      {/* Premium Floating Navbar */}
      <div className="sticky top-5 z-50 w-[calc(100%-2rem)] max-w-[850px] mx-auto mt-6 -mb-[88px]">
        <header className="w-full h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 rounded-full px-5 shadow-[0_8px_32px_0_rgba(99,102,241,0.06)] flex items-center justify-between relative z-50">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#1A365D] rounded-full text-white">
              <Bus className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">Travel Booking</span>
          </div>

          {/* Center Links (Desktop only) */}
          <nav className="hidden md:flex items-center space-x-1.5 text-[14px] font-semibold text-slate-500">
            <a 
              href="#" 
              onClick={() => setActiveSection('home')}
              className={activeSection === 'home'
                ? "text-[#1A365D] bg-[#F0F4F8] border border-[#D9E2EC]/30 px-4 py-1.5 rounded-full shadow-sm font-bold transition-all duration-300"
                : "hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-50 transition-all duration-205"}
            >
              Home
            </a>
            <a 
              href="#routes" 
              onClick={() => setActiveSection('routes')}
              className={activeSection === 'routes'
                ? "text-[#1A365D] bg-[#F0F4F8] border border-[#D9E2EC]/30 px-4 py-1.5 rounded-full shadow-sm font-bold transition-all duration-300"
                : "hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-50 transition-all duration-205"}
            >
              Routes
            </a>
            <a 
              href="#notices" 
              onClick={() => setActiveSection('notices')}
              className={activeSection === 'notices'
                ? "text-[#1A365D] bg-[#F0F4F8] border border-[#D9E2EC]/30 px-4 py-1.5 rounded-full shadow-sm font-bold transition-all duration-300"
                : "hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-50 transition-all duration-205"}
            >
              Notice Board
            </a>
            <a 
              href="#features" 
              onClick={() => setActiveSection('features')}
              className={activeSection === 'features'
                ? "text-[#1A365D] bg-[#F0F4F8] border border-[#D9E2EC]/30 px-4 py-1.5 rounded-full shadow-sm font-bold transition-all duration-300"
                : "hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-50 transition-all duration-205"}
            >
              Features
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-[#1A365D] text-xs font-semibold transition-all px-3 h-9 rounded-full cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#1A365D] hover:bg-[#142D52] text-white text-xs font-bold transition-all px-4.5 h-9 rounded-full cursor-pointer shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-0 right-0 bg-white border border-slate-100 rounded-[24px] p-5 shadow-xl z-40 space-y-4 md:hidden"
            >
              <a 
                href="#" 
                onClick={() => { setIsMobileMenuOpen(false); setActiveSection('home'); }} 
                className={`block px-4 py-2.5 text-sm rounded-xl transition-all ${
                  activeSection === 'home' 
                    ? 'text-[#1A365D] bg-[#F0F4F8] font-bold' 
                    : 'text-slate-600 hover:bg-slate-55'
                }`}
              >
                Home
              </a>
              <a 
                href="#routes" 
                onClick={() => { setIsMobileMenuOpen(false); setActiveSection('routes'); }} 
                className={`block px-4 py-2.5 text-sm rounded-xl transition-all ${
                  activeSection === 'routes' 
                    ? 'text-[#1A365D] bg-[#F0F4F8] font-bold' 
                    : 'text-slate-600 hover:bg-slate-55'
                }`}
              >
                Routes
              </a>
              <a 
                href="#notices" 
                onClick={() => { setIsMobileMenuOpen(false); setActiveSection('notices'); }} 
                className={`block px-4 py-2.5 text-sm rounded-xl transition-all ${
                  activeSection === 'notices' 
                    ? 'text-[#1A365D] bg-[#F0F4F8] font-bold' 
                    : 'text-slate-600 hover:bg-slate-55'
                }`}
              >
                Notice Board
              </a>
              <a 
                href="#features" 
                onClick={() => { setIsMobileMenuOpen(false); setActiveSection('features'); }} 
                className={`block px-4 py-2.5 text-sm rounded-xl transition-all ${
                  activeSection === 'features' 
                    ? 'text-[#1A365D] bg-[#F0F4F8] font-bold' 
                    : 'text-slate-600 hover:bg-slate-55'
                }`}
              >
                Features
              </a>
              
              <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full h-11 rounded-xl text-slate-700 font-bold border-slate-200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button className="w-full h-11 bg-[#1A365D] text-white font-bold hover:bg-[#142D52] rounded-xl">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BEGIN: HeroSection */}
      <section id="home" className="relative min-h-[720px] md:min-h-[80vh] lg:min-h-[85vh] w-full overflow-hidden bg-slate-900 isolate">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Sleek, modern luxury tour bus driving on a breathtaking mountain pass at golden hour" 
            className="w-full h-full object-cover object-center animate-fade-in contrast-105 saturate-[1.02] brightness-[0.98]" 
            src="/luxury_tour_bus.png"
          />
          <div className="absolute inset-0 hero-gradient-overlay"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:pl-6 md:pr-12 pt-24 pb-4 md:pt-28 md:pb-8">
          {/* Left Column: Hero Content */}
          <div className="max-w-5xl space-y-6 md:space-y-8">


            {/* Headline */}
            <h1 className="text-4xl md:text-[3.2rem] lg:text-[3.8rem] xl:text-[4.4rem] font-serif-heading text-[#0F1E36] leading-[1.1] tracking-tight max-w-[280px] md:max-w-none">
              Better Journeys.<br/>
              <span className="text-[#2A4B7C]">Every Single Time.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg lg:text-xl text-slate-655 max-w-[300px] md:max-w-2xl leading-6 md:leading-relaxed font-medium">
              Discover reliable bus services, comfortable seats, live tracking and instant booking — all in one place.
            </p>

            {/* Feature Points */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-6 pt-2 max-w-3xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center border border-blue-100 shadow-2xs">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F1E36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] sm:text-base font-extrabold text-slate-800 leading-tight">Premium Seats</p>
                  <p className="text-[11px] sm:text-xs text-slate-550 font-semibold mt-0.5 leading-none sm:leading-normal">Comfort you deserve</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center border border-orange-100 shadow-2xs">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] sm:text-base font-extrabold text-slate-800 leading-tight">Live Tracking</p>
                  <p className="text-[11px] sm:text-xs text-slate-550 font-semibold mt-0.5 leading-none sm:leading-normal">Track your bus live</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center border border-blue-100 shadow-2xs">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] sm:text-base font-extrabold text-slate-800 leading-tight">Instant Updates</p>
                  <p className="text-[11px] sm:text-xs text-slate-550 font-semibold mt-0.5 leading-none sm:leading-normal">Stay informed always</p>
                </div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-row gap-3 pt-2 sm:pt-4">
              <Button 
                onClick={() => router.push('/register')}
                className="bg-[#0F1E36] hover:bg-[#1E3A8A] text-white h-11 px-6 sm:h-auto sm:px-10 sm:py-4 text-xs sm:text-base rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 flex-1 sm:flex-initial hover:shadow-md transition-all group cursor-pointer border-0"
              >
                Book Your Seat
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const element = document.getElementById('routes');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white border border-slate-200 text-slate-700 h-11 px-6 sm:h-auto sm:px-10 sm:py-4 text-xs sm:text-base rounded-lg sm:rounded-xl font-bold flex items-center justify-center flex-1 sm:flex-initial hover:bg-gray-55 transition-all cursor-pointer"
              >
                View Routes
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar Container (nested inside Hero Section to extend golden hour mountain highway background) */}
        <div className="max-w-[1280px] w-[calc(100%-2rem)] mx-auto search-container-blur rounded-2xl md:rounded-[2rem] p-5 md:p-8 shadow-2xl border border-white/45 relative z-20 mb-20 mt-4">
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#0F1E36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-[#0F1E36] truncate">Find Your Journey</h3>
          </div>
          <button 
            type="button"
            className="whitespace-nowrap min-w-fit px-4 h-9 bg-white/80 border border-gray-200 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer select-none shrink-0"
          >
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Fast Search
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* From Select */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">From</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
                <select 
                  className="w-full pl-12 pr-10 h-12 md:h-14 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1A365D] text-slate-800 appearance-none cursor-pointer text-[15px] md:text-sm font-semibold transition-all focus:outline-none"
                  {...register('from')}
                >
                  <option value="" disabled>e.g. Swargate</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc} disabled={toVal === loc}>{loc}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
              </div>
              {errors.from && <p className="text-xs text-red-500 font-medium ml-1">{errors.from.message}</p>}
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center mb-1">
              <button 
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors border border-gray-100 active:scale-90 cursor-pointer"
              >
                <motion.div animate={{ rotate }}>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </motion.div>
              </button>
            </div>

            {/* To Select */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">To</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
                <select 
                  className="w-full pl-12 pr-10 h-12 md:h-14 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1A365D] text-slate-800 appearance-none cursor-pointer text-[15px] md:text-sm font-semibold transition-all focus:outline-none"
                  {...register('to')}
                >
                  <option value="" disabled>e.g. Kothrud</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc} disabled={fromVal === loc}>{loc}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
              </div>
              {errors.to && <p className="text-xs text-red-500 font-medium ml-1">{errors.to.message}</p>}
            </div>

            {/* Date Select */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Date</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-12 pr-4 h-12 md:h-[56px] bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1A365D] text-slate-800 cursor-pointer text-[15px] md:text-sm font-semibold transition-all focus:outline-none"
                  {...register('date')}
                />
              </div>
              {errors.date && <p className="text-xs text-red-500 font-medium ml-1">{errors.date.message}</p>}
            </div>

            {/* Search Submit Button */}
            <div className="md:col-span-1 w-full">
              <Button 
                type="submit"
                className="w-full h-12 md:h-[56px] bg-[#0F1E36] hover:bg-[#1E3A8A] text-white rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 transition-all cursor-pointer border-0 text-sm font-bold"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="md:hidden">Search Journeys</span>
              </Button>
            </div>
          </div>

          {/* Bottom highlights info */}
          <div className="border-t border-slate-100 pt-4 flex flex-row flex-nowrap overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center justify-center md:justify-start gap-4 md:gap-6 text-[11px] md:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap w-full">
            <div className="flex items-center shrink-0">
              <span className="text-[#0F1E36] mr-1.5">&bull;</span>
              <span>Best Prices</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200 shrink-0" />
            <div className="flex items-center shrink-0">
              <span className="text-[#0F1E36] mr-1.5">&bull;</span>
              <span>Secure Booking</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200 shrink-0" />
            <div className="flex items-center shrink-0">
              <span className="text-[#0F1E36] mr-1.5">&bull;</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </form>
      </div>
      </section>
      {/* END: HeroSection */}

      {/* Features Grid Section with Parallax Background */}
      <section 
        id="features" 
        className="relative pt-32 pb-24 px-6 bg-slate-900 bg-fixed bg-cover bg-center overflow-hidden border-t border-slate-800 content-visibility-auto intrinsic-size-features"
        style={{
          backgroundImage: "url('/luxury-bus-scenic.png')"
        }}
      >
        {/* Dark overlay for text contrast and premium cinematic feel */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] z-0" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Designed for Modern Travelers</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Enjoy a modern passenger interface packing advanced tools to manage your travel end-to-end.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/85 hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 w-fit">
                <Ticket className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Seat selection engine</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Choose seats interactively using our responsive seating engine. Arrangements automatically match bus layouts.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/85 hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 w-fit">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Simulation Tracking</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Track bus runs, preview routes, check estimated arrival times, and set destination alarms to trigger alerts.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/85 hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Notice Board & Lost Items</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Check notice board updates, trace general notifications, and report or lookup lost & found items.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section id="routes" className="py-20 px-6 bg-slate-50 content-visibility-auto intrinsic-size-routes">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Popular Intercity Routes</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Check out routes connecting primary hubs with premium luxury buses.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {popularRoutes.map((route, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-[10px] font-bold text-[#1A365D] uppercase">
                    {route.type}
                  </div>
                  <span className="text-sm font-semibold text-[#1A365D]">{route.price}</span>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-lg">{route.from} &rarr; {route.to}</div>
                  <div className="text-xs text-slate-500 font-medium">Duration: {route.duration}</div>
                </div>
                <Link href={`/register?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${new Date().toISOString().split('T')[0]}&passengers=1`} className="block w-full">
                  <Button variant="outline" className="w-full text-xs font-semibold border-slate-200 hover:bg-slate-55">
                    Book This Route
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Notice Board Preview Section */}
      <section id="notices" className="py-20 px-6 bg-white border-t border-b border-slate-100 content-visibility-auto intrinsic-size-notices">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Integrated Notice Board</h2>
              <p className="text-slate-600 leading-relaxed">
                Stay updated with schedules, bus replacements, emergency delay warnings, and notices. Built to help passengers stay informed.
              </p>
              <div className="space-y-6 pt-3">
                {/* Instructions Notice Card */}
                <div 
                  className="relative flex items-start space-x-3.5 p-5 bg-[#fbfbfa] rounded-sm shadow-[3px_5px_12px_rgba(0,0,0,0.1)] border-l-[3px] border-amber-500/80 select-none transition-all duration-200 hover:rotate-0 hover:scale-[1.01]"
                  style={{ transform: "rotate(0.5deg)" }}
                >
                  {/* Subtle yellow pushpin */}
                  <div className="absolute -top-2.5 left-[15%] z-20 w-3 h-3 bg-amber-500 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_-1.5px_3px_rgba(0,0,0,0.3)]">
                    <div className="w-1 h-1 bg-white/40 rounded-full absolute top-0.5 left-0.5" />
                    <div className="absolute top-3 left-[55%] w-0.5 h-2 bg-black/25 rotate-[15deg] origin-top" />
                  </div>

                  <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Instructions Notice</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                      Passengers are responsible for the accuracy of information provided in notices.
                    </p>
                  </div>
                </div>

                {/* Lost & Found Card */}
                <div 
                  className="relative flex items-start space-x-3.5 p-5 bg-[#fbfbfa] rounded-sm shadow-[3px_5px_12px_rgba(0,0,0,0.1)] border-l-[3px] border-indigo-500/80 select-none transition-all duration-200 hover:rotate-0 hover:scale-[1.01]"
                  style={{ transform: "rotate(-0.7deg)" }}
                >
                  {/* Subtle blue pushpin */}
                  <div className="absolute -top-2.5 left-[15%] z-20 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_-1.5px_3px_rgba(0,0,0,0.3)]">
                    <div className="w-1 h-1 bg-white/40 rounded-full absolute top-0.5 left-0.5" />
                    <div className="absolute top-3 left-[55%] w-0.5 h-2 bg-black/25 rotate-[15deg] origin-top" />
                  </div>

                  <Bus className="h-5 w-5 text-indigo-650 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Lost & Found Feature</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                      Trace or report lost items during trips easily using image uploads and direct notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Skeuomorphic Notice Board Container */}
            <div className="relative border-[6px] border-[#5e3d25] bg-[#ebd2be] bg-[radial-gradient(#dfc2a8_12%,transparent_13%)] bg-[size:5px_5px] p-5 rounded-2xl shadow-lg space-y-5 overflow-visible before:absolute before:inset-0 before:border before:border-[#422916]/80 before:rounded-sm before:pointer-events-none before:z-20">
              {/* Subtle title bar */}
              <div className="flex justify-between items-center bg-[#563720] py-2 px-3 rounded shadow-sm">
                <span className="font-extrabold text-amber-50 tracking-wider text-[11px] uppercase">Recent Notices</span>
                <span className="text-[9px] text-amber-250 font-bold uppercase tracking-wider cursor-pointer hover:text-white transition-colors hover:underline">View All</span>
              </div>

              {/* Physical Pinned Notes Stack */}
              <div className="space-y-5 pt-1">
                {/* Note 1 - Warning */}
                <div 
                  className="relative p-4.5 bg-[#fbfbfa] rounded-sm shadow-[3px_5px_12px_rgba(0,0,0,0.12)] border-l-[3px] border-red-500/80 select-none transition-all duration-200 hover:rotate-0 hover:scale-[1.01] hover:z-20"
                  style={{ transform: "rotate(-0.8deg)" }}
                >
                  {/* Subtle red pushpin */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-3 h-3 bg-red-500 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_-1.5px_3px_rgba(0,0,0,0.3)]">
                    <div className="w-1 h-1 bg-white/40 rounded-full absolute top-0.5 left-0.5" />
                    <div className="absolute top-3 left-[55%] w-0.5 h-2 bg-black/25 rotate-[15deg] origin-top" />
                  </div>

                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    <span className="text-red-500">Warning</span>
                    <span>2 hours ago</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Swargate Expressway Maintenance Delays</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    Expressway maintenance causes minor 15m delays on Hinjewadi - Swargate schedules.
                  </p>
                </div>

                {/* Note 2 - Announcement */}
                <div 
                  className="relative p-4.5 bg-[#fbfbfa] rounded-sm shadow-[3px_5px_12px_rgba(0,0,0,0.12)] border-l-[3px] border-indigo-500/80 select-none transition-all duration-200 hover:rotate-0 hover:scale-[1.01] hover:z-20"
                  style={{ transform: "rotate(0.6deg)" }}
                >
                  {/* Subtle blue pushpin */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_-1.5px_3px_rgba(0,0,0,0.3)]">
                    <div className="w-1 h-1 bg-white/40 rounded-full absolute top-0.5 left-0.5" />
                    <div className="absolute top-3 left-[55%] w-0.5 h-2 bg-black/25 rotate-[15deg] origin-top" />
                  </div>

                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    <span className="text-indigo-500">Announcement</span>
                    <span>Yesterday</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Luxury AC Bus Added to Kothrud Route</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    A brand new luxury bus (ND-3972) is introduced on Kothrud-Hadapsar runs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#1A365D] rounded-lg text-white">
              <Bus className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Travel Booking</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Travel Booking Passenger Web App. Phase 1 Release.
          </p>
        </div>
      </footer>
    </div>
  );
}
