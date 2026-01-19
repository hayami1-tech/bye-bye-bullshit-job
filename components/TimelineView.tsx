
import React, { useState, useRef, useEffect } from 'react';
import { Project, CheckIn } from '../types';

interface TimelineViewProps {
  projects: Project[];
  checkIns: CheckIn[];
  selectedDate: string;
  onAddCheckInAI: (text: string, date: string, startTime: string, endTime: string) => Promise<void>;
  isProcessing: boolean;
  onDeleteCheckIn: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ projects, checkIns, selectedDate, onAddCheckInAI, isProcessing, onDeleteCheckIn }) => {
  const [isLogging, setIsLogging] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [inputText, setInputText] = useState('');
  
  const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayCheckIns = checkIns.filter(c => c.date === selectedDate && c.startTime && c.endTime);

  // Auto-scroll to 7:00 AM on initial load
  useEffect(() => {
    const scrollTo7AM = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 420;
      }
    };
    const timer = setTimeout(scrollTo7AM, 100);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    try {
      await onAddCheckInAI(inputText, selectedDate, startTime, endTime);
      setInputText('');
      setIsLogging(false);
      setSelection(null);
    } catch (err) {
      console.error("Timeline save error:", err);
    }
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds) return null;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${totalSeconds}s`;
  };

  const handleMouseDownOnGrid = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const snappedMinutes = Math.floor(y / 15) * 15;
    
    setSelection({ start: snappedMinutes, end: snappedMinutes + 15 });
    setIsDragging(true);
    setIsLogging(false);
  };

  const handleMouseMoveOnGrid = (e: React.MouseEvent) => {
    if (!isDragging || !gridRef.current || !selection) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const snappedMinutes = Math.max(0, Math.min(1440, Math.round(y / 15) * 15));
    
    if (snappedMinutes !== selection.end) {
      setSelection({ ...selection, end: snappedMinutes });
    }
  };

  const handleMouseUpOnGrid = () => {
    if (!isDragging || !selection) return;
    setIsDragging(false);
    
    const finalStart = Math.min(selection.start, selection.end);
    const finalEnd = Math.max(selection.start, selection.end);
    const adjustedEnd = finalEnd <= finalStart ? finalStart + 15 : finalEnd;
    
    setStartTime(minutesToTime(finalStart));
    setEndTime(minutesToTime(adjustedEnd));
    setIsLogging(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white/10 rounded-[32px] border border-white/40 overflow-hidden shadow-inner relative select-none">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative bg-white/5 scroll-smooth"
      >
        <div 
          ref={gridRef}
          className="relative w-full cursor-crosshair" 
          style={{ height: '1440px' }}
          onMouseDown={handleMouseDownOnGrid}
          onMouseMove={handleMouseMoveOnGrid}
          onMouseUp={handleMouseUpOnGrid}
        >
          {hours.map(h => (
            <div 
              key={h} 
              className="absolute w-full flex items-start gap-4 border-t border-black/[0.05] pointer-events-none" 
              style={{ top: `${h * 60}px`, height: '60px' }}
            >
              <span className="text-[10px] font-black text-gray-400/80 w-10 text-right pt-1 tabular-nums">
                {h.toString().padStart(2, '0')}:00
              </span>
              <div className="flex-1 h-full border-l border-black/[0.05]" />
            </div>
          ))}

          {dayCheckIns.map(c => {
            const start = timeToMinutes(c.startTime!);
            const end = timeToMinutes(c.endTime!);
            const project = projects.find(p => p.id === c.projectId);
            const duration = formatDuration(c.durationSeconds || (end - start) * 60);
            
            return (
              <div 
                key={c.id}
                className="absolute left-14 right-4 rounded-2xl p-3 border shadow-sm group transition-all hover:brightness-95 z-10 cursor-default"
                style={{ 
                  top: `${start}px`, 
                  height: `${Math.max(30, end - start)}px`,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="flex justify-between items-start h-full">
                  <div className="overflow-hidden h-full">
                    <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest truncate leading-none mb-1">
                      {project?.name || 'Log'} • {c.startTime} {duration && `(${duration})`}
                    </p>
                    <p className="text-xs text-gray-900 font-bold truncate leading-tight">{c.text}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteCheckIn(c.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-white/50 rounded-full text-red-500 hover:text-red-700 transition-all shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            );
          })}

          {selection && (
            <div 
              className="absolute left-14 right-4 rounded-2xl bg-blue-500/20 border-2 border-dashed border-blue-500/50 pointer-events-none z-20"
              style={{ 
                top: `${Math.min(selection.start, selection.end)}px`, 
                height: `${Math.max(15, Math.abs(selection.end - selection.start))}px` 
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-full shadow-lg border border-blue-100">
                  <span className="text-[9px] font-black text-blue-600 tabular-nums">
                    {minutesToTime(Math.min(selection.start, selection.end))} - {minutesToTime(Math.max(selection.start, selection.end))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLogging && (
        <div className="absolute inset-x-4 bottom-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <form onSubmit={handleLogSubmit} className="glass rounded-[32px] p-5 shadow-2xl border border-white/60 space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Add Timeline Entry</h4>
              <button type="button" onClick={() => { setIsLogging(false); setSelection(null); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[8px] font-black text-gray-400 uppercase mb-1 block">Start</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black/5 border-none rounded-xl px-3 py-2 text-xs font-bold" />
              </div>
              <div className="flex-1">
                <label className="text-[8px] font-black text-gray-400 uppercase mb-1 block">End</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-black/5 border-none rounded-xl px-3 py-2 text-xs font-bold" />
              </div>
            </div>

            <div className="relative">
              <input 
                autoFocus
                disabled={isProcessing}
                className={`w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-gray-300 shadow-inner focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${isProcessing ? 'opacity-50' : ''}`}
                placeholder={isProcessing ? "AI is categorizing..." : "What did you do during this time?"}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isProcessing}
                className="absolute right-2 top-2 bottom-2 px-4 bg-blue-500 text-white rounded-xl font-black text-xs uppercase hover:bg-blue-600 disabled:bg-gray-300 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center min-w-[70px]"
              >
                {isProcessing ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isLogging && !selection && dayCheckIns.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 text-center opacity-40">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest leading-loose">
            Drag your mouse across the timeline to record a block of time.
          </p>
        </div>
      )}
    </div>
  );
};
