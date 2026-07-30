'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoardingDroppingPoint } from './bus-summary-card';

interface BoardingSelectorProps {
  boardingPoints: BoardingDroppingPoint[];
  droppingPoints: BoardingDroppingPoint[];
  selectedBoarding: BoardingDroppingPoint | null;
  selectedDropping: BoardingDroppingPoint | null;
  onSelectBoarding: (point: BoardingDroppingPoint) => void;
  onSelectDropping: (point: BoardingDroppingPoint) => void;
}

export function BoardingSelector({
  boardingPoints,
  droppingPoints,
  selectedBoarding,
  selectedDropping,
  onSelectBoarding,
  onSelectDropping,
}: BoardingSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Boarding Points Card */}
      <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-xs">
        <h3 className="text-md font-black text-slate-900 tracking-tight leading-tight mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#1A365D]" />
          Boarding Points
        </h3>

        <div className="divide-y divide-slate-100">
          {boardingPoints.map((point) => {
            const isSelected = selectedBoarding?.id === point.id;
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => onSelectBoarding(point)}
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer group focus:outline-none"
              >
                <div className="flex items-start space-x-3.5">
                  <span className="text-xs font-black text-[#1A365D] bg-[#EAF3EF] px-2 py-0.5 rounded-lg">
                    {point.time}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold text-slate-800 block group-hover:text-[#1A365D] transition-colors">
                      {point.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Boarding Location
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200",
                    isSelected
                      ? "border-[#1A365D] bg-[#1A365D] text-white"
                      : "border-slate-350 bg-white group-hover:border-slate-400"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropping Points Card */}
      <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-xs">
        <h3 className="text-md font-black text-slate-900 tracking-tight leading-tight mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-400" />
          Dropping Points
        </h3>

        <div className="divide-y divide-slate-100">
          {droppingPoints.map((point) => {
            const isSelected = selectedDropping?.id === point.id;
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => onSelectDropping(point)}
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer group focus:outline-none"
              >
                <div className="flex items-start space-x-3.5">
                  <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {point.time}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold text-slate-800 block group-hover:text-[#1A365D] transition-colors">
                      {point.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Dropping Location
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200",
                    isSelected
                      ? "border-[#1A365D] bg-[#1A365D] text-white"
                      : "border-slate-350 bg-white group-hover:border-slate-400"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
