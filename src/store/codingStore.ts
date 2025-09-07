import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { getStorageKey } from '../utils/browserId';

export interface StudySession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  description: string;
  category: string;
  studyReason?: string;
}

interface StudyState {
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id'>) => void;
  updateSession: (id: string, session: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;
  getStreak: () => number;
  getTotalTime: () => number;
  getTotalTimeByDate: (date: string) => number;
  getSessionsByDate: (date: string) => StudySession[];
}

// Custom event for session updates
const SESSION_UPDATE_EVENT = 'session-update';

// Function to dispatch session updates
const dispatchSessionUpdate = (sessions: StudySession[]) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SESSION_UPDATE_EVENT, {
        detail: { sessions },
      })
    );
  }
};

// Function to validate session
const validateSession = (session: Partial<StudySession>): boolean => {
  if (!session.duration) {
    console.error('Missing duration:', session);
    return false;
  }
  
  if (session.duration <= 0) {
    console.error('Duration must be greater than 0:', session.duration);
    return false;
  }

  if (!session.date) {
    console.error('Missing date:', session);
    return false;
  }

  if (!session.description || session.description.trim() === '') {
    console.error('Missing description:', session);
    return false;
  }

  if (!session.category || session.category.trim() === '') {
    console.error('Missing category:', session);
    return false;
  }

  return true;
};

// Function to calculate streak
const calculateStreak = (sessions: StudySession[]): number => {
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasSession = sessions.some((s) => s.date === dateStr);
    if (!hasSession) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
};


export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      sessions: [],
      
      addSession: (session) => {
        console.log('Adding session:', session);
        
        if (!validateSession(session)) {
          console.error('Invalid session:', session);
          return;
        }

        const newSession = { 
          ...session, 
          id: uuidv4(),
          duration: session.duration || 0,
          category: session.category || 'General',
          studyReason: session.studyReason || ''
        };
        
        console.log('New session with ID:', newSession);
        
        set((state) => {
          const newSessions = [...state.sessions, newSession];
          console.log('Updated sessions:', newSessions);
          
          // Dispatch session update event
          dispatchSessionUpdate(newSessions);
          
          return { sessions: newSessions };
        });
      },
      
      updateSession: (id, session) => {
        console.log('Updating session:', { id, session });
        const currentSession = get().sessions.find(s => s.id === id);
        if (!currentSession) {
          console.error('Session not found:', id);
          return;
        }

        const updatedSession = { 
          ...currentSession, 
          ...session,
          duration: session.duration || currentSession.duration
        };
        
        if (!validateSession(updatedSession)) {
          console.error('Invalid session update:', session);
          return;
        }

        set((state) => {
          const newSessions = state.sessions.map((s) =>
            s.id === id ? updatedSession : s
          );
          console.log('Updated sessions after update:', newSessions);
          
          // Dispatch session update event
          dispatchSessionUpdate(newSessions);
          
          return { sessions: newSessions };
        });
      },
      
      deleteSession: (id) => {
        console.log('Deleting session:', id);
        const session = get().sessions.find(s => s.id === id);
        if (!session) {
          console.error('Session not found:', id);
          return;
        }
        
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          console.log('Updated sessions after delete:', newSessions);
          
          // Dispatch session update event
          dispatchSessionUpdate(newSessions);
          
          return { sessions: newSessions };
        });
      },

      getStreak: () => {
        return calculateStreak(get().sessions);
      },

      getTotalTime: () => {
        return get().sessions.reduce((sum, session) => sum + session.duration, 0);
      },

      getTotalTimeByDate: (date) => {
        const total = get()
          .sessions.filter((session) => session.date === date)
          .reduce((sum, session) => sum + session.duration, 0);
        console.log(`Total time for ${date}:`, total);
        return total;
      },

      getSessionsByDate: (date) => {
        const sessions = get().sessions.filter((session) => session.date === date);
        console.log(`Sessions for ${date}:`, sessions);
        return sessions;
      },
    }),
    {
      name: getStorageKey('study-storage'),
      storage: createJSONStorage(() => localStorage),
      version: 3,
      partialize: (state) => state,
      onRehydrateStorage: () => (state) => {
        console.log('Hydrated coding state:', state);
      },
    }
  )
); 