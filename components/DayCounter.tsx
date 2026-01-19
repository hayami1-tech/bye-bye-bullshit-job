
import React, { useState, useEffect } from 'react';
import { WidgetSettings } from '../types';

interface DayCounterProps {
  settings: WidgetSettings;
  onUpdate: (newSettings: Partial<WidgetSettings>) => void;
}

export const DayCounter: React.FC<DayCounterProps> = ({ settings, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(settings.eventName);
  const [tempDate, setTempDate] = useState(settings.startDate.split('T')[0]);

  const startDate = new Date(settings.startDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const handleSave = () => {
    onUpdate({
      eventName: tempName,
      startDate: new Date(tempDate).toISOString()
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white/40 dark:bg-black/20 p-4 rounded-3xl space-y-3 transition-all">
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Event Description</label>
          <input 
            type="text" 
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full bg-white/50 border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Start Date</label>
          <input 
            type="date" 
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            className="w-full bg-white/50 border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button 
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
          <button 
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-gray-200/50 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-300/50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-6xl font-black text-gray-900 tracking-tighter tabular-nums">
          {diffDays}
        </span>
        <span className="text-xl font-semibold text-gray-500">days</span>
      </div>
      <p className="text-lg font-medium text-gray-700 leading-tight">
        Since I <span className="text-blue-600 underline decoration-blue-500/30 underline-offset-4 decoration-2">{settings.eventName}</span>
      </p>
      
      {/* Edit Hint Icon */}
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-2 bg-white/50 rounded-full shadow-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
