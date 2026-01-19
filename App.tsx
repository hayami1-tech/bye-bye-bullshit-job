
import React, { useState, useEffect } from 'react';
import { WidgetFrame } from './components/WidgetFrame';
import { DayCounter } from './components/DayCounter';
import { ProjectSection } from './components/ProjectSection';
import { HistoryView } from './components/HistoryView';
import { TimelineView } from './components/TimelineView';
import { DailyJourneyCard } from './components/DailyJourneyCard';
import { DateNavigator } from './components/DateNavigator';
import { categorizeActivity } from './services/geminiService';
import { Project, CheckIn, WidgetSettings, DailyJournal } from './types';

const STORAGE_KEY_PROJECTS = 'new-life-projects';
const STORAGE_KEY_CHECKINS = 'new-life-checkins';
const STORAGE_KEY_SETTINGS = 'new-life-settings';
const STORAGE_KEY_JOURNALS = 'new-life-journals';

const DEFAULT_PROJECTS: Project[] = [
  { id: 'p-sports', name: 'Sports', emoji: '🏃', color: 'orange', createdAt: Date.now() },
  { id: 'p-job', name: 'Look for a new job', emoji: '💼', color: 'blue', createdAt: Date.now() },
  { id: 'p-english', name: 'Learn English', emoji: '🇺🇸', color: 'red', createdAt: Date.now() },
  { id: 'p-ai', name: 'AI Study', emoji: '🤖', color: 'purple', createdAt: Date.now() },
];

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [view, setView] = useState<'timeline' | 'projects' | 'history'>('projects');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [settings, setSettings] = useState<WidgetSettings>({
    eventName: "lost my job",
    startDate: new Date().toISOString()
  });
  const [universalInput, setUniversalInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const p = localStorage.getItem(STORAGE_KEY_PROJECTS);
    const c = localStorage.getItem(STORAGE_KEY_CHECKINS);
    const s = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const j = localStorage.getItem(STORAGE_KEY_JOURNALS);
    
    if (p) {
      setProjects(JSON.parse(p));
    } else {
      // First time initialization with default categories
      setProjects(DEFAULT_PROJECTS);
    }
    
    if (c) setCheckIns(JSON.parse(c));
    if (s) setSettings(JSON.parse(s));
    if (j) setJournals(JSON.parse(j));
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkIns)); }, [checkIns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_JOURNALS, JSON.stringify(journals)); }, [journals]);

  const addCheckIn = (projectId: string, text: string, date?: string, progress?: number, startTime?: string, endTime?: string) => {
    const checkInDate = date || selectedDate;
    const newCheckIn: CheckIn = {
      id: crypto.randomUUID(),
      projectId,
      text,
      date: checkInDate,
      timestamp: Date.now(),
      progress: progress ?? 0,
      startTime,
      endTime,
      durationSeconds: 0
    };
    setCheckIns(prev => [...prev, newCheckIn]);
  };

  const handleAIAssistedLog = async (text: string, date: string, startTime?: string, endTime?: string) => {
    setIsProcessing(true);
    try {
      const result = await categorizeActivity(text, projects);
      let targetProjectId = '';

      if (result.matchFound && result.projectId && projects.some(p => p.id === result.projectId)) {
        targetProjectId = result.projectId;
      } else {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name: result.newProjectName || 'General',
          emoji: result.newProjectEmoji || '🎯',
          color: 'blue',
          createdAt: Date.now(),
          trackingMode: undefined
        };
        setProjects(prev => [...prev, newProject]);
        targetProjectId = newProject.id;
      }

      const project = projects.find(p => p.id === targetProjectId);
      let initialProgress = 0;
      if (project?.trackingMode === 'progress') {
        const projectCheckins = checkIns.filter(c => c.projectId === targetProjectId);
        initialProgress = projectCheckins.length > 0 
          ? Math.max(...projectCheckins.map(c => c.progress || 0)) 
          : 0;
      }

      addCheckIn(targetProjectId, text, date, initialProgress, startTime, endTime);
    } catch (error) {
      console.error("AI Logging Error:", error);
      const fallbackId = projects[0]?.id || 'general';
      addCheckIn(fallbackId, text, date, 0, startTime, endTime);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUniversalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universalInput.trim() || isProcessing) return;

    const text = universalInput.trim();
    setUniversalInput('');
    await handleAIAssistedLog(text, selectedDate);
  };

  const addProject = (name: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      emoji: '🎯',
      color: 'blue',
      createdAt: Date.now(),
      trackingMode: undefined
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateCheckIn = (id: string, text: string, progress?: number, startTime?: string, endTime?: string, durationSeconds?: number, timerActiveSince?: number) => {
    setCheckIns(prev => prev.map(c => c.id === id ? { 
      ...c, 
      text, 
      progress: progress ?? c.progress, 
      startTime: startTime ?? c.startTime, 
      endTime: endTime ?? c.endTime,
      durationSeconds: durationSeconds ?? c.durationSeconds,
      timerActiveSince: timerActiveSince === -1 ? undefined : (timerActiveSince ?? c.timerActiveSince)
    } : c));
  };

  const toggleCheckInTimer = (id: string) => {
    setCheckIns(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (c.timerActiveSince) {
        // Stop timer - calculate exact seconds elapsed
        const elapsedSeconds = Math.floor((Date.now() - c.timerActiveSince) / 1000);
        return {
          ...c,
          timerActiveSince: undefined,
          durationSeconds: (c.durationSeconds || 0) + elapsedSeconds
        };
      } else {
        // Start timer
        return { ...c, timerActiveSince: Date.now() };
      }
    }));
  };

  const deleteCheckIn = (id: string) => {
    setCheckIns(prev => prev.filter(c => c.id !== id));
  };

  const saveJournal = (content: string, date: string) => {
    setJournals(prev => {
      const existing = prev.find(j => j.date === date);
      if (existing) {
        return prev.map(j => j.date === date ? { ...j, content, updatedAt: Date.now() } : j);
      }
      return [...prev, { id: crypto.randomUUID(), date, content, updatedAt: Date.now() }];
    });
  };

  const updateProject = (id: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const updateProjectMode = (id: string, mode: 'progress' | 'counter') => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, trackingMode: mode } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setCheckIns(prev => prev.filter(c => c.projectId !== id));
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4 md:p-8" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000')" }}>
      
      <WidgetFrame>
        <div className="flex flex-col h-full space-y-4 overflow-hidden">
          <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
          
          <DayCounter 
            settings={settings} 
            onUpdate={(val) => setSettings(prev => ({...prev, ...val}))} 
          />

          {view === 'projects' && (
            <form onSubmit={handleUniversalSubmit} className="relative group">
              <input 
                className={`w-full glass-input bg-white/40 border border-white/50 rounded-3xl px-6 py-5 text-base font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-lg ${isProcessing ? 'animate-pulse opacity-70' : ''}`}
                placeholder={isProcessing ? "AI is categorizing..." : "What did you do for your new life today?"}
                value={universalInput}
                onChange={(e) => setUniversalInput(e.target.value)}
                disabled={isProcessing}
              />
              <button 
                type="submit" 
                disabled={isProcessing}
                className="absolute right-3 top-3 p-2.5 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 disabled:bg-gray-400"
              >
                {isProcessing ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                )}
              </button>
            </form>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-6 mb-4 border-b border-black/5 pb-1">
              <button onClick={() => setView('timeline')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative pb-2 ${view === 'timeline' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                Timeline
                {view === 'timeline' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
              <button onClick={() => setView('projects')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative pb-2 ${view === 'projects' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                Log
                {view === 'projects' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
              <button onClick={() => setView('history')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative pb-2 ${view === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                History
                {view === 'history' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
            </div>

            {view === 'timeline' && (
              <TimelineView 
                projects={projects}
                checkIns={checkIns}
                selectedDate={selectedDate}
                onAddCheckInAI={handleAIAssistedLog}
                isProcessing={isProcessing}
                onDeleteCheckIn={deleteCheckIn}
              />
            )}

            {view === 'projects' && (
              <ProjectSection 
                projects={projects}
                checkIns={checkIns}
                selectedDate={selectedDate}
                onAddCheckIn={addCheckIn}
                onUpdateCheckIn={updateCheckIn}
                onToggleTimer={toggleCheckInTimer}
                onDeleteCheckIn={deleteCheckIn}
                onUpdateProject={updateProject}
                onUpdateProjectMode={updateProjectMode}
                onAddProject={addProject} 
                onDeleteProject={deleteProject}
              />
            )}

            {view === 'history' && (
              <HistoryView 
                projects={projects}
                checkIns={checkIns}
                journals={journals}
                onDeleteCheckIn={deleteCheckIn}
                onUpdateCheckIn={updateCheckIn}
              />
            )}
          </div>

          {view !== 'history' && (
            <div className="pt-2">
              <DailyJourneyCard 
                journals={journals} 
                onSave={saveJournal}
                selectedDate={selectedDate}
                diffDays={Math.floor((new Date(selectedDate).getTime() - new Date(settings.startDate).getTime()) / (1000 * 60 * 60 * 24))}
              />
            </div>
          )}
        </div>
      </WidgetFrame>
    </div>
  );
};

export default App;
