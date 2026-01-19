
export interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
  trackingMode?: 'progress' | 'counter';
}

export interface CheckIn {
  id: string;
  projectId: string;
  text: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  progress?: number;
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  durationSeconds?: number; // High precision duration
  timerActiveSince?: number; // Unix timestamp when timer started
}

export interface DailyJournal {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  updatedAt: number;
}

export interface WidgetSettings {
  eventName: string;
  startDate: string; // ISO String
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
