'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, MapPin, Compass, ShieldAlert, Navigation, Volume2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const TRACKING_STOPS = [
  { name: 'Swargate Central', progress: 0, distanceKm: 20 },
  { name: 'Chandni Chowk Interchange', progress: 40, distanceKm: 12 },
  { name: 'Wakad Bridge Interchange', progress: 65, distanceKm: 7 },
  { name: 'Hinjewadi Terminal', progress: 100, distanceKm: 0 }
];

export default function TrackingPage() {
  const [activeBus, setActiveBus] = useState('ND-3972 (Swargate - Hinjewadi Line)');
  const [progress, setProgress] = useState(25); // Starts at 25% progress
  const [alarmStation, setAlarmStation] = useState('Hinjewadi Terminal');
  const [alarmActive, setAlarmActive] = useState(false);
  const [speedKmH, setSpeedKmH] = useState(82);

  // Auto-simulate movement progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (alarmActive) {
            toast.success('⏰ Wake up! You have arrived at your destination.', {
              duration: 8000,
              icon: '🔊'
            });
            setAlarmActive(false);
          }
          return 100;
        }

        const nextProgress = prev + 1.5;
        
        // Trigger alarm triggers when approaching selected station
        if (alarmActive) {
          const targetStop = TRACKING_STOPS.find(s => s.name === alarmStation);
          if (targetStop && nextProgress >= targetStop.progress - 10 && prev < targetStop.progress - 10) {
            toast.info(`🔔 Alarm: You are approaching ${targetStop.name} (within 10km)!`, {
              duration: 5000
            });
          }
        }

        // Randomize speed slightly to simulate expressway conditions
        setSpeedKmH(Math.floor(75 + Math.random() * 15));

        return nextProgress;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [alarmActive, alarmStation]);

  const currentDistanceRemaining = Math.max(0, Math.floor(120 * (1 - progress / 100)));

  const handleToggleAlarm = () => {
    if (!alarmActive) {
      toast.success(`Destination alarm set for ${alarmStation}`);
    }
    setAlarmActive(!alarmActive);
  };

  // SVG Line definitions
  const startX = 60;
  const startY = 60;
  const endX = 260;
  const endY = 240;
  
  // Calculate bus position along path
  const busX = startX + (endX - startX) * (progress / 100);
  const busY = startY + (endY - startY) * (progress / 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Live Bus Tracking</h1>
          <p className="text-slate-500">Monitor active bus location and configure proximity destination alerts.</p>
        </div>

        {/* Reset simulation */}
        <Button 
          variant="outline"
          size="sm"
          onClick={() => { setProgress(0); toast.info('Simulation reset to Swargate Central.'); }}
          className="border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-bold rounded-xl flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Sim
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left pane: Simulation Map panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[420px] relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-indigo-50 border border-indigo-100 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1 animate-pulse">
            <Compass className="h-3.5 w-3.5 text-indigo-600" />
            Live Sim GPS
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* SVG Interactive Map */}
            <svg viewBox="0 0 320 300" className="w-full h-full max-h-[300px]">
              {/* Expressway path */}
              <line 
                x1={startX} y1={startY} x2={endX} y2={endY} 
                stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" 
              />
              <line 
                x1={startX} y1={startY} x2={busX} y2={busY} 
                stroke="#6366f1" strokeWidth="6" strokeLinecap="round" 
              />

              {/* Stops / Nodes */}
              {TRACKING_STOPS.map((stop, index) => {
                const stopX = startX + (endX - startX) * (stop.progress / 100);
                const stopY = startY + (endY - startY) * (stop.progress / 100);
                const isPassed = progress >= stop.progress;

                return (
                  <g key={index}>
                    <circle 
                      cx={stopX} cy={stopY} r="7" 
                      fill={isPassed ? '#6366f1' : '#ffffff'} 
                      stroke={isPassed ? '#818cf8' : '#cbd5e1'} 
                      strokeWidth="3.5" 
                    />
                    <text 
                      x={stopX + 12} y={stopY + 4} 
                      fill="#475569" 
                      fontSize="9" 
                      fontWeight="bold"
                    >
                      {stop.name}
                    </text>
                  </g>
                );
              })}

              {/* Pulsing Bus Marker */}
              <g>
                <circle cx={busX} cy={busY} r="18" fill="#6366f1" fillOpacity="0.15" />
                <circle cx={busX} cy={busY} r="12" fill="#6366f1" fillOpacity="0.3" />
                <circle cx={busX} cy={busY} r="6" fill="#4f46e5" />
              </g>
            </svg>
          </div>

          {/* Quick Metrics */}
          <div className="border-t border-slate-100 pt-4 grid grid-cols-3 text-center text-xs font-bold text-slate-500">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400">Current Speed</span>
              <span className="text-sm font-extrabold text-slate-800">{speedKmH} km/h</span>
            </div>
            <div className="border-l border-r border-slate-100">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400">Remaining</span>
              <span className="text-sm font-extrabold text-indigo-650">{currentDistanceRemaining} km</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400">Progress</span>
              <span className="text-sm font-extrabold text-green-600">{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Right pane: Destination Alarm configurations */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200/80 shadow-md bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-slate-950 font-bold text-base">Proximity Alarm</CardTitle>
                <CardDescription className="text-slate-500 text-xs">Prevent sleeping past your interchange stop.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Bus Route tag */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Vehicle</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-xs text-slate-700 flex items-center gap-2">
                  <Navigation className="h-3.5 w-3.5 text-indigo-500 rotate-45" />
                  {activeBus}
                </div>
              </div>

              {/* Station Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alarm Destination</Label>
                <select
                  disabled={alarmActive}
                  value={alarmStation}
                  onChange={(e) => setAlarmStation(e.target.value)}
                  className="w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {TRACKING_STOPS.slice(1).map((stop) => (
                    <option key={stop.name} value={stop.name}>
                      {stop.name} (Ch. {stop.progress}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Active alert status info */}
              {alarmActive && (
                <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                  <Volume2 className="h-4.5 w-4.5 text-amber-600 mt-0.5 flex-shrink-0 animate-bounce" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 block">Destination Alert Armed</span>
                    <p className="text-amber-800 font-medium mt-0.5">
                      Your phone will ring when the bus is within 10km of {alarmStation}. Maintain network coverage.
                    </p>
                  </div>
                </div>
              )}

              {/* Proximity Alarm Button */}
              <Button
                onClick={handleToggleAlarm}
                className={`w-full font-semibold rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] py-5 flex items-center justify-center ${
                  alarmActive 
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100/50' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {alarmActive ? 'Deactivate Wake Alarm' : 'Set Destination Alarm'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export type { };
