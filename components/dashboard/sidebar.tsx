'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  Map,
  Bus,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { signOutUser, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Ticket },
    { name: 'Routes', href: '/dashboard/routes', icon: Map },
    { name: 'Buses', href: '/dashboard/buses', icon: Bus },
    { name: 'Schedules', href: '/dashboard/schedules', icon: Calendar },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Passenger App', href: '/home', icon: ChevronLeft },
  ];

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out pt-safe pb-safe md:pt-0 md:pb-0",
        // Desktop/Tablet width behavior
        isCollapsed ? "w-20" : "w-[260px]",
        // Mobile drawer positioning
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 md:px-6 border-b border-slate-100">
        <Link
          href="/dashboard"
          onClick={handleLinkClick}
          className="flex items-center space-x-3 overflow-hidden"
        >
          <div className="p-2 bg-indigo-600 text-white rounded-xl flex-shrink-0">
            <Bus className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-slate-800 tracking-tight whitespace-nowrap transition-opacity duration-300">
              Admin Portal
            </span>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 transition-all duration-200", isActive ? "text-white opacity-100" : "text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-slate-700")} />
              
              {/* Text label is hidden when collapsed */}
              {!isCollapsed && (
                <span className="transition-opacity duration-300">{item.name}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-16 hidden group-hover:block bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {/* Profile Details */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="h-10 w-10 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center flex-shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-300">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {user?.displayName || 'Admin User'}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {user?.email || 'admin@busbooking.com'}
              </span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            signOutUser();
            handleLinkClick();
          }}
          className={cn(
            "flex w-full items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all duration-200 group relative"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-rose-500" />
          {!isCollapsed && <span>Logout</span>}
          
          {isCollapsed && (
            <div className="absolute left-16 hidden group-hover:block bg-rose-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-50 whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
