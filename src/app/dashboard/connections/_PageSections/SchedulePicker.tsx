'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { Button } from '@/components/ui/Button';

interface SchedulePickerProps {
  days: string[];
  time: string;
  onChange: (days: string[], time: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const ALL_DAYS = [
  { id: 'Mon', label: 'Du' },
  { id: 'Tue', label: 'Se' },
  { id: 'Wed', label: 'Ch' },
  { id: 'Thu', label: 'Pa' },
  { id: 'Fri', label: 'Ju' },
  { id: 'Sat', label: 'Sh' },
  { id: 'Sun', label: 'Ya' },
];

export const SchedulePicker: React.FC<SchedulePickerProps> = ({ days, time, onChange, onSave, isSaving }) => {
  const toggleDay = (dayId: string) => {
    if (days.includes(dayId)) {
      onChange(days.filter(d => d !== dayId), time);
    } else {
      onChange([...days, dayId], time);
    }
  };

  return (
    <div className="bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-400" />
        Nashr jadvali
      </h3>

      <div className="space-y-6">
        {/* Days */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Kunlar</label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map(day => {
              const isActive = days.includes(day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 active:scale-95 overflow-hidden",
                    isActive 
                      ? "text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border-transparent" 
                      : "text-zinc-400 bg-zinc-800/50 border border-white/5 hover:bg-zinc-800 hover:text-zinc-200"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl" />
                  )}
                  <span className="relative z-10">{day.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Vaqt (HH:MM)</label>
          <div className="relative max-w-[150px] group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
              <Clock className="h-4 w-4" />
            </div>
            <input
              type="time"
              value={time}
              onChange={(e) => onChange(days, e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-inner"
            />
          </div>
        </div>

        {/* Save Button */}
        {onSave && (
          <div className="pt-4 border-t border-white/5">
            <Button 
              onClick={onSave} 
              disabled={isSaving}
              className="relative w-full overflow-hidden group bg-zinc-900 border border-white/10 hover:border-indigo-500/50 rounded-xl py-6 transition-all duration-500"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <span className={cn("relative z-10 font-bold tracking-wide", isSaving ? "opacity-50" : "opacity-100")}>
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
