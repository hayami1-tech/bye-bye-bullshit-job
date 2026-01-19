
import React from 'react';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange }) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/30 shadow-sm">
      <div className="flex gap-4">
        <button 
          onClick={() => onDateChange(today)}
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedDate === today ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Today
        </button>
        <button 
          onClick={() => onDateChange(yesterday)}
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedDate === yesterday ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Yesterday
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <input 
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-gray-500 focus:text-blue-600 cursor-pointer"
        />
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
};
