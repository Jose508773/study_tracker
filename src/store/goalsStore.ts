import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StudySession } from './codingStore';
import { getStorageKey } from '../utils/browserId';

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetMinutes: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  progress: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  unlockedAt?: string;
}

interface GoalsState {
  goals: Goal[];
  achievements: Achievement[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed' | 'progress'>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  completeGoal: (goalId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
}

// Initial achievements
const initialAchievements: Achievement[] = [
  {
    id: 'first-session',
    title: 'First Steps',
    description: 'Complete your first study session',
    icon: '🚀',
    target: 1,
    progress: 0,
  },
  {
    id: 'study-streak-3',
    title: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    target: 3,
    progress: 0,
  },
  {
    id: 'study-streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '⚡',
    target: 7,
    progress: 0,
  },
  {
    id: 'total-hours-10',
    title: 'Dedicated Learner',
    description: 'Log 10 total hours of studying',
    icon: '📚',
    target: 600, // 10 hours in minutes
    progress: 0,
  },
];

// Function to update goals and achievements based on sessions
const updateGoalsAndAchievements = (sessions: StudySession[], set: any) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate today's total
  const todayTotal = sessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.duration, 0);
  
  // Calculate total minutes
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  
  // Calculate streak
  let streak = 0;
  let currentDate = new Date(today);
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasSession = sessions.some((s) => s.date === dateStr);
    if (!hasSession) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  set((state: GoalsState) => {
    // Update goals
    const updatedGoals = state.goals.map(goal => {
      if (goal.type === 'daily' && goal.startDate <= today && goal.endDate >= today) {
        return { ...goal, progress: todayTotal };
      }
      return goal;
    });

    // Update achievements
    const updatedAchievements = state.achievements.map(achievement => {
      let progress = achievement.progress;
      let unlockedAt = achievement.unlockedAt;

      switch (achievement.id) {
        case 'first-session':
          progress = sessions.length > 0 ? 1 : 0;
          break;
        case 'study-streak-3':
          progress = Math.min(streak, 3);
          if (streak >= 3 && !unlockedAt) {
            unlockedAt = new Date().toISOString();
          }
          break;
        case 'study-streak-7':
          progress = Math.min(streak, 7);
          if (streak >= 7 && !unlockedAt) {
            unlockedAt = new Date().toISOString();
          }
          break;
        case 'total-hours-10':
          progress = Math.min(totalMinutes, 600);
          if (totalMinutes >= 600 && !unlockedAt) {
            unlockedAt = new Date().toISOString();
          }
          break;
      }

      return { ...achievement, progress, unlockedAt };
    });

    return {
      goals: updatedGoals,
      achievements: updatedAchievements,
    };
  });
};


export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => {
      // Listen for session updates
      if (typeof window !== 'undefined') {
        window.addEventListener('session-update', ((event: CustomEvent) => {
          updateGoalsAndAchievements(event.detail.sessions, set);
        }) as EventListener);
      }

      const initialState = {
        goals: [],
        achievements: initialAchievements,
        
        addGoal: (goal: Omit<Goal, 'id' | 'completed' | 'progress'>) => set((state) => ({
          goals: [...state.goals, {
            ...goal,
            id: crypto.randomUUID(),
            completed: false,
            progress: 0,
          }],
        })),
        
        updateGoalProgress: (goalId: string, progress: number) => set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? { ...goal, progress, completed: progress >= goal.targetMinutes }
              : goal
          ),
        })),
        
        completeGoal: (goalId: string) => set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId ? { ...goal, completed: true } : goal
          ),
        })),
        
        unlockAchievement: (achievementId: string) => set((state) => ({
          achievements: state.achievements.map((achievement) =>
            achievement.id === achievementId
              ? { ...achievement, unlockedAt: new Date().toISOString() }
              : achievement
          ),
        })),
        
        updateAchievementProgress: (achievementId: string, progress: number) => set((state) => ({
          achievements: state.achievements.map((achievement) =>
            achievement.id === achievementId
              ? {
                  ...achievement,
                  progress,
                  unlockedAt: progress >= achievement.target
                    ? achievement.unlockedAt || new Date().toISOString()
                    : undefined,
                }
              : achievement
          ),
        })),
      };

      // Ensure goals and achievements reflect current coding sessions on first load
      if (typeof window !== 'undefined') {
        const rehydrateAndSync = () => {
          try {
            const codingRaw = localStorage.getItem('coding-storage');
            if (codingRaw) {
              const parsed = JSON.parse(codingRaw);
              const sessions = parsed?.state?.sessions ?? [];
              if (Array.isArray(sessions)) {
                updateGoalsAndAchievements(sessions, set);
              }
            }
          } catch {}
        };
        // Run once after current tick so Zustand can rehydrate
        setTimeout(rehydrateAndSync, 0);
      }

      return initialState;
    },
    {
      name: getStorageKey('goals-storage'),
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => state,
      onRehydrateStorage: () => (state) => {
        console.log('Hydrated goals state:', state);
      },
    }
  )
); 