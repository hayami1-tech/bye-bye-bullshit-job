
import React, { useState, useEffect } from 'react';
import { DailyJournal } from '../types';

interface DailyJourneyCardProps {
  journals: DailyJournal[];
  onSave: (content: string, date: string) => void;
  selectedDate: string;
  diffDays: number;
}

export const DailyJourneyCard: React.FC<DailyJourneyCardProps> = ({ journals, onSave, selectedDate, diffDays }) => {
  const currentJournal = journals.find(j => j.date === selectedDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(currentJournal?.content || '');
  }, [selectedDate, currentJournal]);

  const handleSave = () => {
    onSave(content, selectedDate);
    setIsModalOpen(false);
  };

  const displayDate = new Date(selectedDate).toLocaleDateString([], { month: 'long', day: 'numeric' });

  return (
    <>
      {/* Compact One-Line Trigger */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white/30 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/40 shadow-sm transition-all hover:bg-white/50 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-gray-700 truncate">
            {currentJournal?.content ? (
              <span className="italic">"{currentJournal.content}"</span>
            ) : (
              <span className="text-gray-400">Describe your journey for Day {diffDays}...</span>
            )}
          </p>
        </div>
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
          {currentJournal ? 'Edit' : 'Write'}
        </span>
      </button>

      {/* Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative glass w-full max-w-lg rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Daily Journey</h3>
                <p className="text-sm font-medium text-gray-500">Day {diffDays} • {displayDate}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <textarea 
              autoFocus
              className="w-full bg-white/50 border border-white/20 rounded-3xl p-6 text-base font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none min-h-[240px] resize-none shadow-inner"
              placeholder={`How was your day? Write about your feelings, wins, or reflections...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSave}
                className="flex-[2] px-6 py-4 bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
