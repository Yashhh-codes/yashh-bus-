'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Bell, Search, Calendar, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  setIsMobileOpen: (open: boolean) => void;
  isMobileOpen: boolean;
}

export function Topbar({ setIsMobileOpen, isMobileOpen }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      setFormattedDate(new Date().toLocaleDateString('en-US', options));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Helper to map pathname to clean page titles
  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/dashboard/bookings')) return 'Bookings';
    if (path.startsWith('/dashboard/routes')) return 'Routes';
    if (path.startsWith('/dashboard/buses')) return 'Buses';
    if (path.startsWith('/dashboard/schedules')) return 'Schedules';
    if (path.startsWith('/dashboard/settings')) return 'Settings';
    return 'Admin Portal';
  };

  return (
    <header className="sticky top-0 z-30 flex h-[60px] md:h-[72px] w-full items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm px-3 md:px-6">
      <div className="flex items-center space-x-4">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden p-2 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Page Title */}
        <h2 className="text-xl font-bold text-slate-800 tracking-tight transition-all duration-200">
          {getPageTitle(pathname)}
        </h2>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Search Bar — hidden on mobile, shown md+ */}
        <div className="relative hidden md:block w-44 md:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 pl-9 pr-4 text-sm bg-slate-50 text-slate-700 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 placeholder:text-slate-400"
          />
        </div>

        {/* Current Date */}
        {mounted && (
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        )}

        {/* Notifications Icon — always visible */}
        <button className="relative p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Admin Avatar Dropdown */}
        <div className="border-l border-slate-100 pl-3 md:pl-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 text-left cursor-pointer focus:outline-none select-none">
              <div className="h-9 w-9 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center flex-shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-slate-700 leading-none">
                  {user?.displayName || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">
                  Super Admin
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5 bg-white rounded-xl shadow-lg border border-slate-100 mt-1">
              <DropdownMenuLabel className="px-2.5 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                My Profile
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="-mx-1.5 my-1" />
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
                className="cursor-pointer flex items-center space-x-2 px-2.5 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-sm font-medium"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="-mx-1.5 my-1" />
              <DropdownMenuItem
                onClick={signOutUser}
                className="cursor-pointer flex items-center space-x-2 px-2.5 py-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg text-sm font-semibold"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
