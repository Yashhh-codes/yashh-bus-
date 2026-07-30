'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Users, Ticket, ShieldAlert } from 'lucide-react';
import { Passenger } from './passenger-form';
import { BoardingDroppingPoint } from './bus-summary-card';

interface ReviewCardProps {
  schedule: {
    departureTime: string;
    arrivalTime: string;
    departureDate: string;
    route?: {
      departureLocation: string;
      destinationLocation: string;
    };
    bus?: {
      busNumber: string;
      busType: string;
    };
  };
  selectedSeats: string[];
  selectedBoarding: BoardingDroppingPoint | null;
  selectedDropping: BoardingDroppingPoint | null;
  passengers: Passenger[];
  gstEnabled: boolean;
  gstNumber: string;
  companyName: string;
  specialRequests: string[];
  otherSpecialRequest: string;
}

export function ReviewCard({
  schedule,
  selectedSeats,
  selectedBoarding,
  selectedDropping,
  passengers,
  gstEnabled,
  gstNumber,
  companyName,
  specialRequests,
  otherSpecialRequest,
}: ReviewCardProps) {
  const busName = schedule.bus?.busNumber || 'Swift Cruiser';
  const busType = schedule.bus?.busType || 'Standard Class';

  return (
    <div className="space-y-4">
      {/* Journey & Points Summary */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2">Journey Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Travel Date: <span className="text-slate-900 font-extrabold">{schedule.departureDate}</span></span>
            </div>
            
            <div className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
              <MapPin className="h-3.5 w-3.5 text-[#1F5E45] mt-0.5 shrink-0" />
              <div className="leading-tight">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Pickup Point</span>
                <span className="text-xs font-extrabold text-slate-800 block">{selectedBoarding?.label}</span>
                <span className="text-[9px] font-bold text-slate-500 block">{selectedBoarding?.time}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Coach: <span className="text-slate-900 font-extrabold">{busName} ({busType})</span></span>
            </div>

            <div className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
              <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="leading-tight">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Dropoff Point</span>
                <span className="text-xs font-extrabold text-slate-800 block">{selectedDropping?.label}</span>
                <span className="text-[9px] font-bold text-slate-500 block">{selectedDropping?.time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passengers Summary */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-400" />
            Passenger Information
          </h3>
          <span className="text-[9px] font-black text-[#1F5E45] bg-[#EAF3EF] px-2 py-0.5 rounded-lg flex items-center gap-0.5">
            <Ticket className="h-3 w-3" />
            {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} ({selectedSeats.join(', ')})
          </span>
        </div>

        <div className="space-y-2">
          {passengers.map((passenger, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-[11px] gap-2">
              <div className="leading-tight">
                <span className="font-extrabold text-slate-800 block">{passenger.name}</span>
                <span className="text-slate-500 block">Age: {passenger.age} • Gender: {passenger.gender}</span>
              </div>
              
              {index === 0 && (
                <div className="text-left sm:text-right text-[10px] font-semibold text-slate-500 leading-tight">
                  <span className="block">{passenger.phone}</span>
                  <span className="block text-slate-400">{passenger.email}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Optional GST Details */}
        {gstEnabled && (
          <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
            <span className="text-[8px] font-black text-[#1F5E45] uppercase tracking-wider block">GST Invoice</span>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-[9px] text-slate-400 block">GSTIN</span>
                <span className="font-bold">{gstNumber}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Company</span>
                <span className="font-bold">{companyName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Optional Special Requests */}
        {(specialRequests.length > 0 || otherSpecialRequest.trim()) && (
          <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
            <span className="text-[8px] font-black text-[#1F5E45] uppercase tracking-wider block">Special Requests</span>
            {specialRequests.map((req, idx) => (
              <span key={idx} className="inline-block bg-[#EAF3EF] text-[#1F5E45] border border-[#a7d7ac]/40 px-1.5 py-0.5 rounded font-bold mr-1 text-[9px]">
                {req}
              </span>
            ))}
            {otherSpecialRequest.trim() && (
              <p className="text-slate-600 leading-tight text-[10px] mt-1 font-medium italic border-t border-slate-200/50 pt-1">
                &ldquo;{otherSpecialRequest}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-2">
        <h4 className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          Cancellation Policy
        </h4>
        <div className="text-[10px] font-bold text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/50">
            <span className="text-[8px] text-slate-400 block uppercase font-bold">12h+ Before</span>
            <span className="text-slate-800 font-extrabold">90% Refund</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/50">
            <span className="text-[8px] text-slate-400 block uppercase font-bold">6h-12h Before</span>
            <span className="text-slate-800 font-extrabold">50% Refund</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/50">
            <span className="text-[8px] text-slate-400 block uppercase font-bold">&lt; 6h Before</span>
            <span className="text-slate-500 font-bold">No Refund</span>
          </div>
        </div>
      </div>
    </div>
  );
}
