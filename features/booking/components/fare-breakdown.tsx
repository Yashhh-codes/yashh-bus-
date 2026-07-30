'use client';

import React from 'react';

interface FareBreakdownProps {
  seatPrice: number;
  selectedSeatsCount: number;
}

export function FareBreakdown({ seatPrice, selectedSeatsCount }: FareBreakdownProps) {
  const baseFare = seatPrice * selectedSeatsCount;
  const sgst = Math.round(baseFare * 0.025); // 2.5% SGST
  const cgst = Math.round(baseFare * 0.025); // 2.5% CGST
  const serviceFee = selectedSeatsCount > 0 ? 30 * selectedSeatsCount : 0; // Flat ₹30 per seat
  const total = baseFare + sgst + cgst + serviceFee;

  if (selectedSeatsCount === 0) {
    return (
      <div className="text-center py-2.5 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <p className="text-[10px] text-slate-400 font-semibold">Select seats to view fare breakdown</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
        <span>Base Fare ({selectedSeatsCount} × ₹{seatPrice})</span>
        <span className="text-slate-700 font-black">₹{baseFare.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
        <span>CGST (2.5%)</span>
        <span className="text-slate-700 font-black">₹{cgst.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
        <span>SGST (2.5%)</span>
        <span className="text-slate-700 font-black">₹{sgst.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
        <span>Booking Service Fee</span>
        <span className="text-slate-700 font-black">₹{serviceFee.toLocaleString('en-IN')}</span>
      </div>
      <div className="border-t border-slate-100 my-1 pt-1.5 flex justify-between items-center text-xs">
        <span className="text-slate-800 font-black">Total Price</span>
        <span className="text-[#1F5E45] font-black text-sm">
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
