import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[20px] border border-slate-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
