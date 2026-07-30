'use client';

import React from 'react';
import { Star, Wifi, Navigation, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import { FareBreakdown } from './fare-breakdown';

export interface BoardingDroppingPoint {
  id: string;
  time: string;
  label: string;
}

interface BusSummaryCardProps {
  schedule: {
    id: string;
    departureTime: string;
    arrivalTime: string;
    departureDate: string;
    seatPriceLkr: number;
    route?: {
      departureLocation: string;
      destinationLocation: string;
      durationHours: number;
    };
    bus?: {
      busNumber: string;
      busType: string;
      amenities: string[];
    };
  };
  selectedSeats: string[];
  selectedBoarding?: BoardingDroppingPoint | null;
  selectedDropping?: BoardingDroppingPoint | null;
}

export function BusSummaryCard({
  schedule,
  selectedSeats,
  selectedBoarding,
  selectedDropping
}: BusSummaryCardProps) {
  const { bus, route } = schedule;

  const busName = bus?.busNumber || 'Swift Cruiser';
  const busType = bus?.busType || 'Standard Class';
  const busAmenities = bus?.amenities || [];
  const departureLoc = route?.departureLocation || 'Origin';
  const destinationLoc = route?.destinationLocation || 'Destination';
  const durationHours = route?.durationHours || 0.0;

  // Generate deterministic rating based on bus name length
  const rating = (4.0 + (busName.length % 10) / 10).toFixed(1);
  const totalReviews = (10 + (busName.length * 7) % 200);

  return (
    <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-3.5">
      {/* Compact Operator Info & Rating */}
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Bus Operator</span>
          <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight">{busName}</h3>
          <span className="text-[10px] font-semibold text-slate-400 block">{busType}</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-0.5 text-[#1A365D]">
            <Star className="h-3 w-3 fill-[#1A365D]" />
            <span className="text-xs font-black">{rating}</span>
          </div>
          <span className="text-[8px] text-slate-400 font-bold">({totalReviews} reviews)</span>
        </div>
      </div>

      {/* Bus Image Panel (Reduced Height - Aspect 21/9 for density) */}
      <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-slate-100/70 border border-slate-200/40">
        <Image
          src="/luxury-bus-scenic.png"
          alt={busName}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover transition-transform duration-500 hover:scale-102"
        />
        <div className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-slate-100 flex items-center space-x-0.5 shadow-xs">
          <Wifi className="h-3 w-3 text-[#1A365D]" />
          <span className="text-[8px] font-black text-[#1A365D] uppercase tracking-wider">WiFi</span>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Route & Timings */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Departure</span>
            <span className="font-extrabold text-xs text-slate-900">{schedule.departureTime}</span>
            <span className="text-[9px] text-slate-500 font-bold block truncate max-w-[80px]">{departureLoc}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <span className="text-[8px] font-bold text-slate-400 flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {durationHours} hrs
            </span>
            <div className="flex items-center gap-1 my-0.5">
              <div className="w-1 h-1 rounded-full bg-slate-350" />
              <div className="w-10 h-px bg-slate-200" />
              <div className="w-1 h-1 rounded-full bg-[#1A365D]" />
            </div>
          </div>

          <div className="space-y-0.5 text-right">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Arrival</span>
            <span className="font-extrabold text-xs text-slate-900">{schedule.arrivalTime}</span>
            <span className="text-[9px] text-slate-500 font-bold block truncate max-w-[80px]">{destinationLoc}</span>
          </div>
        </div>

        <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1.5">
          <Navigation className="h-3 w-3 text-slate-400" />
          <span>Travel Date: <span className="text-slate-900 font-extrabold">{schedule.departureDate}</span></span>
        </div>
      </div>

      {/* Boarding & Dropping Points Selected Summary */}
      {(selectedBoarding || selectedDropping) && (
        <>
          <div className="border-t border-slate-100" />
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Selected Points</span>
            <div className="space-y-1.5 text-[11px]">
              {selectedBoarding && (
                <div className="flex items-start gap-2 bg-[#EAF3EF]/30 border border-[#a7d7ac]/10 p-1.5 rounded-lg">
                  <MapPin className="h-3 w-3 text-[#1A365D] mt-0.5 shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[8px] font-bold text-[#1A365D] uppercase tracking-wider block">Pickup</span>
                    <span className="font-bold text-slate-800">{selectedBoarding.label}</span>
                    <span className="text-[9px] font-medium text-slate-500 block">{selectedBoarding.time}</span>
                  </div>
                </div>
              )}
              {selectedDropping && (
                <div className="flex items-start gap-2 bg-[#EAF3EF]/30 border border-[#a7d7ac]/10 p-1.5 rounded-lg">
                  <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Dropoff</span>
                    <span className="font-bold text-slate-800">{selectedDropping.label}</span>
                    <span className="text-[9px] font-medium text-slate-500 block">{selectedDropping.time}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="border-t border-slate-100" />

      {/* Amenities (Compact Chips) */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Amenities</span>
        <div className="flex flex-wrap gap-1">
          {busAmenities.slice(0, 4).map((item, idx) => (
            <span
              key={idx}
              className="text-[8px] font-bold text-slate-600 bg-slate-50 border border-slate-200/50 px-1.5 py-0.5 rounded-md"
            >
              {item}
            </span>
          ))}
          {busAmenities.length > 4 && (
            <span className="text-[8px] font-bold text-slate-400 px-1.5 py-0.5">
              +{busAmenities.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Selected Seats summary & Fare breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Seats</span>
          <span className="font-black text-[#1A365D]">
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </span>
        </div>
        
        <FareBreakdown
          seatPrice={schedule.seatPriceLkr}
          selectedSeatsCount={selectedSeats.length}
        />
      </div>
    </div>
  );
}
