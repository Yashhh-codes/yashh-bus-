'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatLayoutEngineProps {
  rows: number;
  columnsPattern: string; // e.g. "SS_SS" (S=Seat, _=Aisle)
  bookedSeats: string[];
  unavailableSeats: string[];
  selectedSeats: string[];
  maxSelectable: number;
  onSeatSelect: (seatId: string) => void;
}

export function SeatLayoutEngine({
  rows,
  columnsPattern,
  bookedSeats,
  unavailableSeats,
  selectedSeats,
  maxSelectable,
  onSeatSelect,
}: SeatLayoutEngineProps) {
  const layoutMatrix = useMemo(() => {
    const matrix = [];
    const patternChars = columnsPattern.split('');

    for (let r = 1; r <= rows; r++) {
      const rowSeats = [];
      let seatCharIndex = 0;

      for (let c = 0; c < patternChars.length; c++) {
        const char = patternChars[c];
        if (char === '_') {
          rowSeats.push({ type: 'aisle', id: `aisle-${r}-${c}` });
        } else {
          const seatLetter = String.fromCharCode(65 + seatCharIndex);
          const seatId = `${r}${seatLetter}`;
          const isBooked = bookedSeats.includes(seatId);
          const isUnavailable = unavailableSeats.includes(seatId);
          const isSelected = selectedSeats.includes(seatId);

          rowSeats.push({
            type: 'seat',
            id: seatId,
            label: seatId,
            isBooked,
            isUnavailable,
            isSelected,
          });

          seatCharIndex++;
        }
      }
      matrix.push(rowSeats);
    }
    return matrix;
  }, [rows, columnsPattern, bookedSeats, unavailableSeats, selectedSeats]);

  const handleSeatClick = (seat: { id: string; isBooked?: boolean; isUnavailable?: boolean }) => {
    if (seat.isBooked || seat.isUnavailable) return;
    onSeatSelect(seat.id);
  };

  return (
    <div className="relative max-w-[340px] mx-auto bg-slate-50/40 rounded-[36px] border border-slate-200/80 p-6 pt-14 pb-8 shadow-inner select-none">
      
      {/* Front of Bus Cockpit windscreen header */}
      <div className="absolute top-0 inset-x-0 h-10 bg-slate-200/60 border-b border-slate-300/40 rounded-t-[35px] flex items-center justify-between px-6 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
        <span>Front of Bus</span>
        <div className="flex items-center space-x-1.5">
          <div className="w-4.5 h-4.5 rounded-full border border-slate-300 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
          <span className="text-[9px]">Driver</span>
        </div>
      </div>

      {/* Seating Grid */}
      <div className="space-y-4">
        {layoutMatrix.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center items-center gap-3">
            {row.map((item) => {
              if (item.type === 'aisle') {
                return (
                  <div 
                    key={item.id} 
                    className="w-8 h-12 flex items-center justify-center"
                  />
                );
              }

              const cannotSelect = !item.isSelected && selectedSeats.length >= maxSelectable;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={!(item.isBooked || item.isUnavailable) ? { scale: 0.95 } : {}}
                  onClick={() => handleSeatClick(item)}
                  className={cn(
                    "w-12 h-12 rounded-[14px] flex flex-col items-center justify-center transition-all duration-200 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F5E45]/20",
                    item.isBooked && "bg-rose-50 border border-rose-100 text-rose-300 cursor-not-allowed",
                    item.isUnavailable && "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300",
                    item.isSelected && "bg-[#EAF3EF] text-[#1F5E45] border border-[#a7d7ac] shadow-sm shadow-[#1F5E45]/5",
                    !item.isBooked && !item.isUnavailable && !item.isSelected && !cannotSelect && "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#1F5E45] hover:border-slate-300",
                    !item.isBooked && !item.isUnavailable && !item.isSelected && cannotSelect && "bg-slate-100 border border-slate-200/50 text-slate-400 cursor-not-allowed"
                  )}
                  disabled={item.isBooked || item.isUnavailable}
                >
                  <Armchair 
                    className={cn(
                       "h-4 w-4 mb-0.5 transition-colors duration-200", 
                       item.isSelected ? "text-[#1F5E45]" : item.isBooked ? "text-rose-200" : "text-slate-400"
                    )} 
                  />
                  <span 
                    className={cn(
                       "text-[9px] font-extrabold tracking-tighter uppercase transition-colors duration-200", 
                       item.isSelected ? "text-[#1F5E45]" : item.isBooked ? "text-rose-300" : "text-slate-500"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
export type { };
