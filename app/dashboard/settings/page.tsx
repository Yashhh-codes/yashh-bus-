'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/dashboard/page-container';
import { SectionHeader } from '@/components/dashboard/section-header';
import { Card } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('SwiftRide Transit');
  const [supportEmail, setSupportEmail] = useState('support@swiftride.com');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  
  // Localization States
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('en');
  
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("All Portal configurations saved successfully!");
    }, 800);
  };

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Settings Module"
        description="Manage your bus booking portal core settings, localization preferences, and contact channels."
      />

      {/* Settings Form Container */}
      <div className="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Section Card */}
          <Card className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">General Operations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Define core business details and customer support contact fields.</p>
            </div>
            <hr className="border-slate-100/80" />
            
            {/* Business Name */}
            <div className="space-y-1.5">
              <label htmlFor="businessName" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full h-11 px-4 text-sm bg-slate-50/50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Grid for Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Support Email */}
              <div className="space-y-1.5">
                <label htmlFor="supportEmail" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Support Email
                </label>
                <input
                  id="supportEmail"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 text-sm bg-slate-50/50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label htmlFor="phoneNumber" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Support Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full h-11 px-4 text-sm bg-slate-50/50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </Card>

          {/* Localization Section Card */}
          <Card className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Localization Preferences</h3>
              <p className="text-xs text-slate-400 mt-0.5">Adjust currency display, time formats, and local language preferences.</p>
            </div>
            <hr className="border-slate-100/80" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Currency */}
              <div className="space-y-1.5">
                <label htmlFor="currency" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Default Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50/50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  <option value="INR">INR (₹) - Rupee</option>
                  <option value="USD">USD ($) - Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - Pound</option>
                </select>
              </div>

              {/* Timezone */}
              <div className="space-y-1.5">
                <label htmlFor="timezone" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Default Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50/50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  <option value="Asia/Kolkata">IST (UTC+05:30) - Kolkata</option>
                  <option value="America/New_York">EST (UTC-05:00) - New York</option>
                  <option value="Europe/London">GMT (UTC+00:00) - London</option>
                  <option value="Asia/Singapore">SGT (UTC+08:00) - Singapore</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label htmlFor="language" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Portal Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-slate-50/50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Submit Action Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold px-6 h-11 transition-colors cursor-pointer"
            >
              {saving ? 'Saving Configurations...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
