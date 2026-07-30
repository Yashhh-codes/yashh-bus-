'use client';

import React, { useState, useMemo } from 'react';
import { Armchair, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  rows: number;
  columnsPattern: string;
  bookedSeats: string[];
  unavailableSeats: string[];
  selectedSeats: string[];
  maxSelectable: number;
  onSeatSelect: (seatId: string) => void;
  busType: string;
}

export function SeatMap({
  rows,
  columnsPattern,
  bookedSeats,
  unavailableSeats,
  selectedSeats,
  maxSelectable,
  onSeatSelect,
  busType,
}: SeatMapProps) {
  const isSleeper = busType.toLowerCase().includes('sleeper');
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Decks rows split: Lower (first half), Upper (second half)
  const deckRowsRange = useMemo(() => {
    if (!isSleeper) return { start: 1, end: rows };
    const mid = Math.ceil(rows / 2);
    if (activeDeck === 'lower') {
      return { start: 1, end: mid };
    } else {
      return { start: mid + 1, end: rows };
    }
  }, [isSleeper, activeDeck, rows]);

  const layoutMatrix = useMemo(() => {
    const matrix = [];
    const patternChars = columnsPattern.split('');
    const { start, end } = deckRowsRange;

    for (let r = start; r <= end; r++) {
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
  }, [deckRowsRange, columnsPattern, bookedSeats, unavailableSeats, selectedSeats]);

  const handleSeatClick = (seatId: string, isBooked: boolean, isUnavailable: boolean) => {
    if (isBooked || isUnavailable) return;
    onSeatSelect(seatId);
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">Select Seats</h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Choose up to {maxSelectable} seat{maxSelectable > 1 ? 's' : ''} for your journey
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-50 border border-slate-200/60 p-0.5 rounded-lg text-slate-500">
            <button
              type="button"
              onClick={() => setZoomScale((s) => Math.max(0.75, s - 0.05))}
              className="p-1 hover:text-slate-800 hover:bg-white rounded transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="text-[9px] font-bold w-9 text-center tracking-tighter">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((s) => Math.min(1.2, s + 0.05))}
              className="p-1 hover:text-slate-800 hover:bg-white rounded transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1.0)}
              className="p-1 hover:text-slate-800 hover:bg-white rounded transition-colors cursor-pointer ml-0.5 border-l border-slate-200/60 pl-1.5"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {/* Deck Switcher (Sleeper only) */}
          {isSleeper && (
            <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveDeck('lower')}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-all duration-150",
                  activeDeck === 'lower'
                    ? "bg-white shadow-xs text-indigo-650"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Lower
              </button>
              <button
                type="button"
                onClick={() => setActiveDeck('upper')}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-all duration-150",
                  activeDeck === 'upper'
                    ? "bg-white shadow-xs text-indigo-650"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Upper
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Seat Map Layout Box */}
      <div className="relative max-w-[280px] mx-auto bg-slate-50/30 rounded-[24px] border border-slate-200/50 p-4 pt-10 pb-4 shadow-xs select-none overflow-hidden">
        {/* Cockpit Indicator */}
        <div className="absolute top-0 inset-x-0 h-8 bg-slate-200/30 border-b border-slate-200/60 rounded-t-[23px] flex items-center justify-between px-5 text-[8px] font-bold text-slate-400 tracking-widest uppercase">
          <span>Front of Bus</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
            </div>
            <span className="text-[7px]">Driver</span>
          </div>
        </div>

        {/* Scaled Seating Grid */}
        <div
          className="space-y-2 mt-1"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {layoutMatrix.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center items-center gap-2">
              {row.map((item) => {
                if (item.type === 'aisle') {
                  return (
                    <div
                      key={item.id}
                      className="w-8.5 h-8.5 flex items-center justify-center"
                    />
                  );
                }

                const cannotSelect = !item.isSelected && selectedSeats.length >= maxSelectable;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSeatClick(item.id, !!item.isBooked, !!item.isUnavailable)}
                    className={cn(
                      "w-8.5 h-8.5 rounded-lg flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer focus:outline-none",
                      item.isBooked && "bg-rose-50 border border-rose-100 text-rose-300 cursor-not-allowed",
                      item.isUnavailable && "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                      item.isSelected && "bg-[#EAF3EF] text-[#1A365D] border border-[#a7d7ac] shadow-xs",
                      !item.isBooked && !item.isUnavailable && !item.isSelected && !cannotSelect && "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#1A365D] hover:border-slate-300 active:scale-95",
                      !item.isBooked && !item.isUnavailable && !item.isSelected && cannotSelect && "bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed"
                    )}
                    disabled={item.isBooked || item.isUnavailable}
                  >
                    <Armchair
                      className={cn(
                        "h-3 w-3 mb-0.5",
                        item.isSelected ? "text-[#1A365D]" : item.isBooked ? "text-rose-200" : "text-slate-400"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[7px] font-extrabold tracking-tighter uppercase",
                        item.isSelected ? "text-[#1A365D]" : item.isBooked ? "text-rose-300" : "text-slate-500"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Seat Status Legend */}
      <div className="flex justify-center gap-4 text-[9px] font-bold text-slate-400 border-t border-slate-100 pt-3">
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-md bg-rose-50 border border-rose-100" />
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-md bg-white border border-slate-200" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-md bg-[#EAF3EF] border border-[#a7d7ac]" />
          <span>Selected</span>
        </div>
      </div>

      {/* Selected Seat Chips & Counter */}
      {selectedSeats.length > 0 && (
        <div className="border-t border-slate-100 pt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-bold uppercase">Selected ({selectedSeats.length})</span>
            {selectedSeats.length === maxSelectable && (
              <span className="text-[#1A365D] font-extrabold">All seats selected</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSeats.map((seatId) => (
              <div
                key={seatId}
                className="flex items-center space-x-1 bg-[#EAF3EF] border border-[#a7d7ac] px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-[#1A365D]"
              >
                <span>Seat {seatId}</span>
                <button
                  type="button"
                  onClick={() => onSeatSelect(seatId)}
                  className="p-0.5 hover:bg-[#d3ebd5] rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
