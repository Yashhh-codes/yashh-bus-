'use client';

import React from 'react';
import { User, Phone, Mail, ClipboardList, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Passenger {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  phone: string;
  email: string;
}

interface PassengerFormProps {
  selectedSeats: string[];
  passengers: Passenger[];
  onChangePassenger: (index: number, field: keyof Passenger, value: string) => void;
  whatsAppUpdates: boolean;
  onWhatsAppUpdatesChange: (enabled: boolean) => void;
  gstEnabled: boolean;
  gstNumber: string;
  companyName: string;
  onGstToggle: (enabled: boolean) => void;
  onGstChange: (field: 'gstNumber' | 'companyName', value: string) => void;
  specialRequests: string[];
  onSpecialRequestToggle: (request: string) => void;
  otherSpecialRequest: string;
  onOtherSpecialRequestChange: (value: string) => void;
  errors: Record<string, string>;
}

export function PassengerForm({
  selectedSeats,
  passengers,
  onChangePassenger,
  whatsAppUpdates,
  onWhatsAppUpdatesChange,
  gstEnabled,
  gstNumber,
  companyName,
  onGstToggle,
  onGstChange,
  specialRequests,
  onSpecialRequestToggle,
  otherSpecialRequest,
  onOtherSpecialRequestChange,
  errors,
}: PassengerFormProps) {
  const genderOptions: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other'];
  const requestOptions = ['Wheelchair Required', 'Senior Citizen Assistance'];

  // Check if first passenger details exist (for contact card)
  const primaryPhone = passengers[0]?.phone || '';
  const primaryEmail = passengers[0]?.email || '';

  const phoneError = errors['p-0-phone'];
  const emailError = errors['p-0-email'];

  return (
    <div className="space-y-4">
      {/* 1. Contact Details Card (Collected exactly once at the top) */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-3.5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-indigo-650" />
            Contact Details
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Ticket updates and scannable boarding passes will be sent here
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={primaryPhone}
                onChange={(e) => onChangePassenger(0, 'phone', e.target.value)}
                className={cn(
                  "w-full h-8.5 pl-8 pr-3 text-xs rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-colors",
                  phoneError ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-indigo-650"
                )}
              />
              <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
            {phoneError && <p className="text-[9px] text-rose-500 font-bold">{phoneError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. name@example.com"
                value={primaryEmail}
                onChange={(e) => onChangePassenger(0, 'email', e.target.value)}
                className={cn(
                  "w-full h-8.5 pl-8 pr-3 text-xs rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-colors",
                  emailError ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-indigo-650"
                )}
              />
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
            {emailError && <p className="text-[9px] text-rose-500 font-bold">{emailError}</p>}
          </div>
        </div>

        {/* WhatsApp Updates Toggle */}
        <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl mt-1">
          <div className="flex items-center space-x-2.5">
            <MessageSquare className="h-4 w-4 text-[#1F5E45]" />
            <div>
              <span className="text-[11px] font-bold text-slate-700 block leading-tight">Send updates on WhatsApp</span>
              <span className="text-[9px] font-semibold text-slate-400">Fast alerts for delays and schedules</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onWhatsAppUpdatesChange(!whatsAppUpdates)}
            className={cn(
              "w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer outline-none",
              whatsAppUpdates ? "bg-[#1F5E45]" : "bg-slate-200"
            )}
          >
            <div
              className={cn(
                "bg-white w-3 h-3 rounded-full shadow-xs transform transition-transform duration-200",
                whatsAppUpdates ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* 2. Compact Passenger Cards */}
      {passengers.map((passenger, index) => {
        const seat = selectedSeats[index] || '';
        const nameError = errors[`p-${index}-name`];
        const ageError = errors[`p-${index}-age`];
        const genderError = errors[`p-${index}-gender`];

        return (
          <div key={index} className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                Passenger {index + 1}
              </h3>
              <span className="text-[10px] font-black text-[#1F5E45] bg-[#EAF3EF] px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Seat {seat}
              </span>
            </div>

            {/* Inputs: Name & Age in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter passenger name"
                  value={passenger.name}
                  onChange={(e) => onChangePassenger(index, 'name', e.target.value)}
                  className={cn(
                    "w-full h-8.5 px-3 text-xs rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-colors",
                    nameError ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-indigo-650"
                  )}
                />
                {nameError && <p className="text-[9px] text-rose-500 font-bold">{nameError}</p>}
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={passenger.age}
                  onChange={(e) => onChangePassenger(index, 'age', e.target.value)}
                  className={cn(
                    "w-full h-8.5 px-3 text-xs rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-colors",
                    ageError ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-indigo-650"
                  )}
                />
                {ageError && <p className="text-[9px] text-rose-500 font-bold">{ageError}</p>}
              </div>
            </div>

            {/* Segmented Control Gender Selection */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gender</label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-250/30 max-w-xs">
                {genderOptions.map((opt) => {
                  const isSelected = passenger.gender === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChangePassenger(index, 'gender', opt)}
                      className={cn(
                        "flex-1 h-7.5 rounded text-[11px] font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-white text-indigo-600 shadow-xs border border-slate-200/30"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {genderError && <p className="text-[9px] text-rose-500 font-bold">{genderError}</p>}
            </div>
          </div>
        );
      })}

      {/* GST Details - Compact accordion style */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-3">
        <button
          type="button"
          onClick={() => onGstToggle(!gstEnabled)}
          className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
        >
          <div className="flex items-center space-x-2.5">
            <div className={cn(
              "h-4 w-4 rounded border flex items-center justify-center transition-all",
              gstEnabled ? "border-[#1F5E45] bg-[#1F5E45] text-white" : "border-slate-300 bg-white"
            )}>
              {gstEnabled && (
                <div className="w-1.5 h-1.5 bg-white rounded-xs" />
              )}
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block leading-tight">Add GST Details (Optional)</span>
              <span className="text-[9px] font-medium text-slate-400">Claim tax credit for business trips</span>
            </div>
          </div>
        </button>

        {gstEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">GSTIN Number</label>
              <input
                type="text"
                placeholder="27AAAAA1111A1Z1"
                value={gstNumber}
                onChange={(e) => onGstChange('gstNumber', e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-650 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</label>
              <input
                type="text"
                placeholder="Corporate Inc."
                value={companyName}
                onChange={(e) => onGstChange('companyName', e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-650 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Special Requests - Compact style */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 shadow-sm space-y-3">
        <div>
          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            Special Requests (Optional)
          </h3>
          <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Let us know if you require special assistance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {requestOptions.map((request) => {
            const isChecked = specialRequests.includes(request);
            return (
              <button
                key={request}
                type="button"
                onClick={() => onSpecialRequestToggle(request)}
                className={cn(
                  "flex items-center space-x-2.5 p-2 rounded-xl border text-left cursor-pointer transition-colors focus:outline-none",
                  isChecked
                    ? "border-[#a7d7ac] bg-[#EAF3EF]/30 text-[#1F5E45]"
                    : "border-slate-200 bg-white hover:border-slate-350 text-slate-700"
                )}
              >
                <div className={cn(
                  "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0",
                  isChecked ? "border-[#1F5E45] bg-[#1F5E45] text-white" : "border-slate-300 bg-white"
                )}>
                  {isChecked && <div className="w-1 h-1 bg-white rounded-xs" />}
                </div>
                <span className="text-[11px] font-bold">{request}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Other details</label>
          <textarea
            placeholder="e.g. Lower deck seating preference, etc."
            value={otherSpecialRequest}
            onChange={(e) => onOtherSpecialRequestChange(e.target.value)}
            className="w-full h-16 p-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-650 focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
