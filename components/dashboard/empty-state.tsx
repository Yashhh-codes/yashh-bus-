import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-dashed border-slate-200 rounded-[20px]">
      {Icon && (
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">{description}</p>
      {actionText && onAction && (
        <Button 
          onClick={onAction} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
