import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStyles = (val?: string) => {
    const s = (val || '').toLowerCase();
    
    // Success cases
    if (s === 'active' || s === 'confirmed' || s === 'paid') {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      };
    }
    
    // Alert / Pending cases
    if (s === 'pending' || s === 'maintenance') {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        icon: s === 'maintenance' 
          ? <ShieldAlert className="h-3.5 w-3.5" /> 
          : <AlertCircle className="h-3.5 w-3.5" />,
      };
    }

    // Danger / Inactive cases
    if (s === 'cancelled' || s === 'inactive' || s === 'suspended' || s === 'refunded') {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-100',
        icon: <XCircle className="h-3.5 w-3.5" />,
      };
    }

    // Fallback default
    return {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: null,
    };
  };

  const { bg, icon } = getStyles(status);

  return (
    <span
      className={cn(
        "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
        bg,
        className
      )}
    >
      {icon}
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
