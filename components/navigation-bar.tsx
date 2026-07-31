'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Bus, Home, Ticket, Megaphone, User, LogOut, Settings, HelpCircle, MapPin, Menu, X, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function NavigationBar() {
  const pathname = usePathname();
  const { user, signOutUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Notice Board', href: '/announcements', icon: Megaphone },
  ];

  return (
    <div className="sticky top-0 md:top-5 z-50 w-full md:w-[calc(100%-2rem)] max-w-[850px] mx-auto mt-0 md:mt-6 mb-0">
      <header className="w-full h-14 md:h-16 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-b border-slate-100 md:border md:border-white/40 dark:border-slate-800/40 md:rounded-full px-4 md:px-5 shadow-[0_4px_20px_rgba(99,102,241,0.04)] flex items-center justify-between relative z-50 pt-safe">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/home" className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-full text-white">
              <Bus className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 hidden sm:inline">Travel Booking</span>
          </Link>
        </div>

        {/* Center Links (Desktop only) */}
        <nav className="hidden md:flex items-center space-x-1.5 text-[14px] font-semibold text-slate-500">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'text-slate-950 bg-white border border-slate-200/80 shadow-sm font-bold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="flex items-center space-x-2.5">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full border border-slate-200 bg-slate-50 p-0 overflow-hidden shadow-inner cursor-pointer flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-100 font-bold text-indigo-700 text-xs uppercase">
                    {user.displayName ? user.displayName.substring(0, 2) : 'US'}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-slate-900">{user.displayName}</p>
                      <p className="text-xs leading-none text-slate-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" className="w-full flex items-center cursor-pointer" />}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/settings" className="w-full flex items-center cursor-pointer" />}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {user && (user.role === 'admin' || user.role === 'manager') && (
                  <DropdownMenuItem render={<Link href="/dashboard" className="w-full flex items-center cursor-pointer font-bold text-indigo-600 focus:text-indigo-700" />}>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
                    <span>Dashboard Portal</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOutUser} className="text-red-650 focus:text-red-700 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 text-xs font-semibold transition-all px-3 h-9 rounded-full cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all px-4.5 h-9 rounded-full cursor-pointer shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Side-Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 md:hidden"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 flex flex-col md:hidden pt-[calc(24px+env(safe-area-inset-top,0px))] pb-[calc(24px+env(safe-area-inset-bottom,0px))]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-600 rounded-full text-white">
                    <Bus className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">Travel Menu</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer animate-scale-in"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                        isActive 
                          ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 font-bold' 
                          : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                {user && (user.role === 'admin' || user.role === 'manager') && (
                  <Link 
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                    <span>Dashboard Portal</span>
                  </Link>
                )}
              </nav>

              {/* Auth / Action Button Footer */}
              {!user ? (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full block">
                    <Button variant="outline" className="w-full h-12 rounded-xl text-slate-705 font-bold border-slate-200 cursor-pointer">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full block">
                    <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer">
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center space-x-3 px-2">
                    <div className="h-9 w-9 bg-indigo-105 rounded-full flex items-center justify-center font-bold text-indigo-750 text-sm">
                      {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.displayName}</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 truncate">{user.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOutUser();
                    }} 
                    className="w-full flex items-center justify-center gap-2 h-12 border border-rose-200 text-rose-600 bg-rose-50/30 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
export type { };
