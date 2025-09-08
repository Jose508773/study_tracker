import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useState } from 'react';
import { useStudyStore } from '../store/codingStore';
import GoalsAndAchievements from './GoalsAndAchievements';
import DataVisualization from './DataVisualization';
import CustomizableDashboard from './CustomizableDashboard';
import Analytics from './Analytics';
import StudySessionCards from './StudySessionCards';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg animate-fade-in-scale"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-white">{value}</p>
      </div>
      <div className={`text-4xl ${color} opacity-80`}>{icon}</div>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { sessions, getTotalTime, getStreak, deleteSession } = useStudyStore();
  const [showCustomize, setShowCustomize] = useState(false);
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions.filter(s => s.date === today);
  const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const stats = [
    {
      title: 'Today\'s Study Time',
      value: formatDuration(todayTotal),
      icon: '⏱️',
      color: 'text-white',
    },
    {
      title: 'Weekly Streak',
      value: `${getStreak()} days`,
      icon: '🔥',
      color: 'text-white',
    },
    {
      title: 'Total Hours',
      value: formatDuration(getTotalTime()),
      icon: '📊',
      color: 'text-white',
    },
  ];

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Study Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Track your learning progress and achievements</p>
        </div>
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => setShowCustomize(true)}
                 className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-sm"
               >
                 🎨 Customize
               </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Analytics & Insights */}
      <Analytics />

      {/* Study Session Cards */}
      <StudySessionCards />

      {/* Data Visualization */}
      <DataVisualization />

      {/* Goals and Achievements */}
      <GoalsAndAchievements />

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">📚</div>
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        </div>
        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                    <p className="font-semibold text-white">
                      {format(new Date(session.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  {session.description && (
                    <p className="text-sm text-gray-300 mb-1">{session.description}</p>
                  )}
                  {session.category && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-1 rounded-full">
                        {session.category}
                      </span>
                      {session.studyReason && (
                        <span className="text-xs text-gray-400">
                          • {session.studyReason}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-accent-blue font-semibold bg-accent-blue/10 px-3 py-1 rounded-full">
                    {formatDuration(session.duration)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteSession(session.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
                  >
                    🗑️
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Study Sessions Yet</h3>
            <p className="text-gray-400">
              Start the timer to begin tracking your learning progress!
            </p>
          </div>
        )}
      </motion.div>

      {/* Customizable Dashboard Modal */}
      {showCustomize && (
        <CustomizableDashboard onClose={() => setShowCustomize(false)} />
      )}
    </div>
  );
};

export default Dashboard; 