'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Bus, Home, Ticket, Megaphone, User, LogOut, Settings, HelpCircle, MapPin, Menu, X } from 'lucide-react';
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
    { name: 'Tracking', href: '/tracking', icon: MapPin },
    { name: 'Notice Board', href: '/announcements', icon: Megaphone },
  ];

  return (
    <div className="sticky top-5 z-50 w-[calc(100%-2rem)] max-w-[850px] mx-auto mt-6 mb-0">
      <header className="w-full h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 rounded-full px-5 shadow-[0_8px_32px_0_rgba(99,102,241,0.06)] flex items-center justify-between relative z-50">
        
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
            className="absolute top-20 left-0 right-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 rounded-[24px] p-4 shadow-xl z-40 space-y-2 md:hidden"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm rounded-xl transition-all ${
                    isActive 
                      ? 'text-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold' 
                      : 'text-slate-650 hover:bg-white/40 dark:hover:bg-slate-850/40'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            {!user && (
              <div className="border-t border-slate-100/80 pt-3 mt-3 flex flex-col space-y-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full h-10 rounded-xl text-slate-700 font-bold border-slate-200 cursor-pointer">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full h-10 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export type { };
