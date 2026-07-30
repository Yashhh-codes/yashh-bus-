import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
        <DialogHeader>
          <DialogTitle className={`text-lg font-bold ${variant === 'danger' ? 'text-rose-600' : 'text-slate-800'}`}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-end border-t border-slate-100 pt-4 flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 px-4 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
