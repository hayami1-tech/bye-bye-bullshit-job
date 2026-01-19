
import React, { useState, useEffect } from 'react';
import { Project, CheckIn } from '../types';

interface ProjectSectionProps {
  projects: Project[];
  checkIns: CheckIn[];
  selectedDate: string;
  onAddCheckIn: (projectId: string, text: string, date?: string, progress?: number) => void;
  onUpdateCheckIn: (id: string, text: string, progress?: number, startTime?: string, endTime?: string, durationSeconds?: number) => void;
  onToggleTimer: (id: string) => void;
  onDeleteCheckIn: (id: string) => void;
  onUpdateProject: (id: string, name: string) => void;
  onUpdateProjectMode: (id: string, mode: 'progress' | 'counter') => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectSection: React.FC<ProjectSectionProps> = ({ 
  projects, 
  checkIns, 
  selectedDate,
  onAddCheckIn, 
  onUpdateCheckIn,
  onToggleTimer,
  onDeleteCheckIn,
  onUpdateProject,
  onUpdateProjectMode,
  onAddProject, 
  onDeleteProject 
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
      setShowAddProject(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar pb-10">
        {projects.length === 0 && !showAddProject ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-60">
            <p className="text-sm font-medium text-gray-500">
              No categories found.
            </p>
            <button 
              onClick={() => setShowAddProject(true)}
              className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              New Category
            </button>
          </div>
        ) : (
          <>
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                selectedDate={selectedDate}
                history={checkIns.filter(c => c.projectId === project.id)}
                onCheckIn={onAddCheckIn}
                onUpdateCheckIn={onUpdateCheckIn}
                onToggleTimer={onToggleTimer}
                onDeleteCheckIn={onDeleteCheckIn}
                onUpdateName={(newName) => onUpdateProject(project.id, newName)}
                onUpdateMode={(mode) => onUpdateProjectMode(project.id, mode)}
                onDelete={() => onDeleteProject(project.id)}
              />
            ))}

            {showAddProject ? (
              <form onSubmit={handleProjectSubmit} className="bg-white/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Create New Category</h4>
                <input 
                  autoFocus
                  className="w-full bg-white/50 border border-blue-100 rounded-2xl px-4 py-3 text-base font-bold outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Health, Career, Learning..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 py-3 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">Add</button>
                  <button type="button" onClick={() => setShowAddProject(false)} className="px-6 py-3 bg-gray-200/50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddProject(true)}
                className="w-full py-5 bg-white/30 hover:bg-white/50 border-2 border-dashed border-gray-400/20 rounded-[32px] text-gray-400 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
              >
                <span className="bg-gray-100 p-1 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </span>
                New Category
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ 
  project: Project; 
  history: CheckIn[]; 
  selectedDate: string;
  onCheckIn: (projectId: string, text: string, date?: string, progress?: number) => void;
  onUpdateCheckIn: (id: string, text: string, progress?: number, startTime?: string, endTime?: string, durationSeconds?: number) => void;
  onToggleTimer: (id: string) => void;
  onDeleteCheckIn: (id: string) => void;
  onUpdateName: (name: string) => void;
  onUpdateMode: (mode: 'progress' | 'counter') => void;
  onDelete: () => void;
}> = ({ project, history, selectedDate, onCheckIn, onUpdateCheckIn, onToggleTimer, onDeleteCheckIn, onUpdateName, onUpdateMode, onDelete }) => {
  const [checkInText, setCheckInText] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(project.name);
  const [showModeSelector, setShowModeSelector] = useState(false);
  
  const mode = project.trackingMode;
  const selectedCheckIns = history.filter(c => c.date === selectedDate);
  
  const latestCheckIn = history.length > 0 
    ? [...history].sort((a, b) => b.timestamp - a.timestamp)[0] 
    : null;
  const currentProgress = latestCheckIn?.progress ?? 0;
  const daysLogged = new Set(history.map(c => c.date)).size;
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    onCheckIn(project.id, `Progress update: ${newProgress}%`, selectedDate, newProgress);
  };

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkInText.trim()) {
      onCheckIn(project.id, checkInText.trim(), selectedDate, mode === 'progress' ? currentProgress : 0);
      setCheckInText('');
    }
  };

  return (
    <div className="group bg-white/40 backdrop-blur-lg rounded-[28px] p-5 border border-white/50 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl shrink-0">{project.emoji}</span>
          {isEditingName ? (
            <form onSubmit={(e) => { e.preventDefault(); if (tempName.trim()) onUpdateName(tempName.trim()); setIsEditingName(false); }} className="flex-1">
              <input 
                autoFocus
                className="w-full bg-white/60 border border-blue-200 rounded-lg px-2 py-0.5 text-base font-bold outline-none"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => { if (tempName.trim()) onUpdateName(tempName.trim()); setIsEditingName(false); }}
              />
            </form>
          ) : (
            <h3 
              onClick={() => setIsEditingName(true)}
              className="font-bold text-gray-800 text-base cursor-text hover:text-blue-600 transition-colors"
            >
              {project.name}
            </h3>
          )}
        </div>
        
        <div className="relative flex items-center gap-2">
          <button 
            onClick={() => setShowModeSelector(!showModeSelector)}
            className={`p-1.5 rounded-full transition-all ${mode ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 4a2 2 0 100-4m0 4a2 2 0 110-4m-6 0a2 2 0 100-4m0 4a2 2 0 110-4" />
            </svg>
          </button>

          {showModeSelector && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-white/50 p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button 
                onClick={() => { onUpdateMode('progress'); setShowModeSelector(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider ${mode === 'progress' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Progress
              </button>
              <button 
                onClick={() => { onUpdateMode('counter'); setShowModeSelector(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider ${mode === 'counter' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Counter
              </button>
              <button 
                onClick={() => { onUpdateMode(undefined as any); setShowModeSelector(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider ${!mode ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Timer Only
              </button>
            </div>
          )}

          <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        {mode === 'progress' ? (
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-blue-600 tabular-nums">{currentProgress}%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</span>
            </div>
            <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300" style={{ width: `${currentProgress}%` }} />
               <input 
                type="range" min="0" max="100" value={currentProgress} onChange={handleProgressChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>
        ) : mode === 'counter' ? (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 tabular-nums">{daysLogged}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Days</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {selectedCheckIns.sort((a,b) => b.timestamp - a.timestamp).map(c => (
          <LogItem 
            key={c.id} 
            item={c} 
            onDelete={() => onDeleteCheckIn(c.id)}
            onUpdate={(text, durSec) => onUpdateCheckIn(c.id, text, c.progress, c.startTime, c.endTime, durSec)}
            onToggleTimer={() => onToggleTimer(c.id)}
          />
        ))}
      </div>

      <form onSubmit={handleSubmitLog} className="relative mt-auto">
        <input 
          className="w-full bg-white/50 border border-white/30 rounded-2xl px-4 py-3 text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-10 shadow-sm"
          placeholder="Log something today..."
          value={checkInText}
          onChange={(e) => setCheckInText(e.target.value)}
        />
        <button type="submit" className="absolute right-1.5 top-1.5 p-1.5 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </button>
      </form>
    </div>
  );
};

const LogItem: React.FC<{
  item: CheckIn;
  onDelete: () => void;
  onUpdate: (text: string, durationSec: number) => void;
  onToggleTimer: () => void;
}> = ({ item, onDelete, onUpdate, onToggleTimer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  
  const [h, setH] = useState('0');
  const [m, setM] = useState('0');
  const [s, setS] = useState('0');
  const [, setTick] = useState(0);

  useEffect(() => {
    if (isEditing) {
      const totalSeconds = item.durationSeconds || 0;
      setH(Math.floor(totalSeconds / 3600).toString());
      setM(Math.floor((totalSeconds % 3600) / 60).toString());
      setS((totalSeconds % 60).toString());
    }
  }, [isEditing, item.durationSeconds]);

  useEffect(() => {
    let interval: number | undefined;
    if (item.timerActiveSince) {
      interval = window.setInterval(() => {
        setTick(t => t + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [item.timerActiveSince]);

  const formatDisplayTime = (totalSeconds: number, activeSince?: number) => {
    let currentTotalSec = (totalSeconds || 0);
    if (activeSince) {
      currentTotalSec += Math.floor((Date.now() - activeSince) / 1000);
    }
    
    const hh = Math.floor(currentTotalSec / 3600);
    const mm = Math.floor((currentTotalSec % 3600) / 60);
    const ss = currentTotalSec % 60;

    if (activeSince) {
      if (hh > 0) return `${hh}h ${mm}m ${ss}s`;
      return `${mm}m ${ss}s`;
    } else {
      if (hh > 0) return `${hh}h ${mm}m`;
      if (mm > 0) return `${mm}m`;
      return `${currentTotalSec}s`;
    }
  };

  const handleSave = () => {
    const totalSec = (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    onUpdate(editText, totalSec);
    setIsEditing(false);
  };

  return (
    <div className="bg-white/50 border border-white/60 rounded-[18px] px-4 py-3 group transition-all hover:bg-white/80 shadow-sm">
      {isEditing ? (
        <div className="space-y-3">
          <input 
            autoFocus
            className="w-full bg-white/50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs outline-none font-bold"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-400 uppercase text-center">H</span>
              <input 
                type="number" min="0" className="w-12 bg-white/50 border border-blue-100 rounded-lg px-2 py-1 text-xs outline-none tabular-nums font-bold text-center"
                value={h} onChange={(e) => setH(e.target.value)}
              />
            </div>
            <span className="text-gray-400 font-bold self-end pb-1">:</span>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-400 uppercase text-center">M</span>
              <input 
                type="number" min="0" max="59" className="w-12 bg-white/50 border border-blue-100 rounded-lg px-2 py-1 text-xs outline-none tabular-nums font-bold text-center"
                value={m} onChange={(e) => setM(e.target.value)}
              />
            </div>
            <span className="text-gray-400 font-bold self-end pb-1">:</span>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-400 uppercase text-center">S</span>
              <input 
                type="number" min="0" max="59" className="w-12 bg-white/50 border border-blue-100 rounded-lg px-2 py-1 text-xs outline-none tabular-nums font-bold text-center"
                value={s} onChange={(e) => setS(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
             <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold text-gray-400 px-2 py-1">Cancel</button>
             <button onClick={handleSave} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Save</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 overflow-hidden">
               {item.startTime && (
                 <span className="text-[8px] font-black text-gray-400 tabular-nums uppercase whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded-md">{item.startTime}</span>
               )}
               <p 
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-800 font-bold leading-tight truncate cursor-text hover:text-blue-600 transition-colors"
               >
                {item.text}
               </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div 
              onClick={(e) => { e.stopPropagation(); onToggleTimer(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border ${
                item.timerActiveSince 
                  ? 'bg-blue-500 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                  : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center">
                {item.timerActiveSince ? (
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">
                {formatDisplayTime(item.durationSeconds || 0, item.timerActiveSince)}
              </span>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
