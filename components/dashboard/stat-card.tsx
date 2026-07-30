import React from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  change,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between min-h-[130px] h-[135px] py-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-[38px] leading-none font-bold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl">
            {icon}
          </div>
        )}
      </div>

      {(description || change) && (
        <div className="flex items-center space-x-2 text-xs">
          {change && (
            <span
              className={cn(
                "inline-flex items-center font-bold px-2 py-0.5 rounded-md text-[11px]",
                change.type === 'increase' && "bg-emerald-50 text-emerald-700",
                change.type === 'decrease' && "bg-rose-50 text-rose-700",
                change.type === 'neutral' && "bg-slate-100 text-slate-600"
              )}
            >
              {change.type === 'increase' && (
                <svg className="h-3 w-3 mr-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {change.type === 'decrease' && (
                <svg className="h-3 w-3 mr-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{change.value}</span>
            </span>
          )}
          {description && (
            <span className="text-slate-400 font-medium">{description}</span>
          )}
        </div>
      )}
    </Card>
  );
}
