
import React, { useState } from 'react';
import { Project, CheckIn, DailyJournal } from '../types';

interface HistoryViewProps {
  projects: Project[];
  checkIns: CheckIn[];
  journals: DailyJournal[];
  onDeleteCheckIn: (id: string) => void;
  onUpdateCheckIn: (id: string, text: string, progress?: number, startTime?: string, endTime?: string, durationSeconds?: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ projects, checkIns, journals, onDeleteCheckIn, onUpdateCheckIn }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDurationSec, setEditDurationSec] = useState(0);

  const grouped = checkIns.reduce((acc: Record<string, CheckIn[]>, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleEditSubmit = (e: React.FormEvent, item: CheckIn) => {
    e.preventDefault();
    if (editText.trim()) {
      onUpdateCheckIn(item.id, editText.trim(), item.progress, item.startTime, item.endTime, editDurationSec);
      setEditingId(null);
    }
  };

  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds) return null;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${totalSeconds}s`;
  };

  if (checkIns.length === 0 && journals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-gray-600 font-bold">Your journey hasn't started</h3>
        <p className="text-sm text-gray-400 mt-1">Logs from Timeline and Daily view appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
      {sortedDates.map(date => {
        const journal = journals.find(j => j.date === date);
        const dayCheckIns = grouped[date] || [];

        return (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-20 py-1 flex items-center justify-between">
               <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-gray-600 uppercase tracking-widest border border-white/50 shadow-sm">
                 {new Date(date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
               </span>
            </div>

            {journal && (
              <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-2xl p-5 mb-4 shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Reflection
                </p>
                <p className="text-sm text-gray-800 font-medium italic leading-relaxed">
                  "{journal.content}"
                </p>
              </div>
            )}

            <div className="space-y-3 pl-2 border-l-2 border-white/30 ml-4">
              {dayCheckIns.sort((a, b) => b.timestamp - a.timestamp).map(item => {
                const project = projects.find(p => p.id === item.projectId);
                const mode = project?.trackingMode;
                const durationLabel = formatDuration(item.durationSeconds || 0);

                return (
                  <div key={item.id} className="group bg-white/30 hover:bg-white/50 p-3 rounded-2xl border border-white/40 transition-all flex items-start gap-3">
                    <div className="text-lg flex-shrink-0 mt-0.5">{project?.emoji || '🎯'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider truncate">
                          {project?.name || 'Category'} {item.startTime ? `• ${item.startTime}` : ''}
                        </p>
                        <div className="flex items-center gap-2">
                           {mode === 'progress' && item.progress !== undefined && (
                             <span className="text-[10px] font-black text-blue-500">{item.progress}%</span>
                           )}
                           {mode === 'counter' && (
                             <span className="text-[10px] font-black text-blue-500">+1</span>
                           )}
                           {!mode && durationLabel && (
                             <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full shadow-sm">{durationLabel}</span>
                           )}
                        </div>
                      </div>
                      
                      {editingId === item.id ? (
                        <form onSubmit={(e) => handleEditSubmit(e, item)} className="space-y-2">
                          <input 
                            autoFocus
                            className="w-full bg-white/50 border border-white/40 rounded-lg px-2 py-1 text-sm outline-none font-medium"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingId(null)} className="text-[10px] px-2 py-0.5 text-gray-400">Cancel</button>
                            <button type="submit" className="text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded">Save</button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm text-gray-700 font-bold leading-tight">{item.text}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button 
                        onClick={() => { setEditingId(item.id); setEditText(item.text); setEditDurationSec(item.durationSeconds || 0); }}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => onDeleteCheckIn(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
