import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useStudyStore } from '../store/codingStore';
import GoalsAndAchievements from './GoalsAndAchievements';
import DataVisualization from './DataVisualization';

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
    whileHover={{ scale: 1.02 }}
    className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`text-3xl ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { sessions, getTotalTime, getStreak, deleteSession } = useStudyStore();
  
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
      color: 'text-accent-blue',
    },
    {
      title: 'Weekly Streak',
      value: `${getStreak()} days`,
      icon: '🔥',
      color: 'text-accent-purple',
    },
    {
      title: 'Total Hours',
      value: formatDuration(getTotalTime()),
      icon: '📊',
      color: 'text-accent-teal',
    },
  ];

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Dashboard
      </motion.h1>

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

      {/* Data Visualization */}
      <DataVisualization />

      {/* Goals and Achievements */}
      <GoalsAndAchievements />

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
      >
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-glass rounded-lg group"
              >
                <div>
                  <p className="font-medium">
                    {format(new Date(session.date), 'MMMM d, yyyy')}
                  </p>
                  {session.description && (
                    <p className="text-sm text-gray-400">{session.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-accent-blue">
                    {formatDuration(session.duration)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteSession(session.id)}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    🗑️
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No study sessions recorded yet. Start the timer to begin tracking your progress!
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard; 