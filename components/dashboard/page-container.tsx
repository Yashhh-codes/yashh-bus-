import React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "max-w-[1600px] mx-auto w-full p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
