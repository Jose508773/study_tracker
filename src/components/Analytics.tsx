import { motion } from 'framer-motion';
import { useStudyStore } from '../store/codingStore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const Analytics: React.FC = () => {
  const { sessions, getTotalTime, getStreak } = useStudyStore();

  // Calculate analytics data
  const totalTime = getTotalTime();
  const currentStreak = getStreak();
  
  // Weekly data
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Study sessions this week
  const weeklySessions = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => s.date === dayStr);
    const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      date: day,
      dateStr: dayStr,
      sessions: daySessions,
      totalMinutes,
      hasStudied: totalMinutes > 0
    };
  });

  // Category breakdown
  const categoryStats = sessions.reduce((acc, session) => {
    const category = session.category || 'General';
    acc[category] = (acc[category] || 0) + session.duration;
    return acc;
  }, {} as Record<string, number>);

  // Most productive day
  const dailyStats = sessions.reduce((acc, session) => {
    const day = new Date(session.date).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + session.duration;
    return acc;
  }, {} as Record<string, number>);

  const mostProductiveDay = Object.entries(dailyStats).reduce((max, [day, minutes]) => 
    minutes > max.minutes ? { day, minutes } : max, 
    { day: 'None', minutes: 0 }
  );

  return (
    <div className="space-y-6 animate-slide-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">📊</div>
        <h2 className="text-2xl font-bold text-white">Analytics & Insights</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-300 text-sm font-medium">Total Study Time</h3>
              <p className="text-3xl font-bold mt-2 text-white">
                {Math.floor(totalTime / 60)}h {totalTime % 60}m
              </p>
            </div>
            <div className="text-4xl text-white/80">⏱️</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-300 text-sm font-medium">Current Streak</h3>
              <p className="text-3xl font-bold mt-2 text-white">{currentStreak} days</p>
            </div>
            <div className="text-4xl text-white/80">🔥</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-300 text-sm font-medium">Total Sessions</h3>
              <p className="text-3xl font-bold mt-2 text-white">{sessions.length}</p>
            </div>
            <div className="text-4xl text-white/80">📚</div>
          </div>
        </motion.div>
      </div>

      {/* Study Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">📅 This Week's Study Calendar</h3>
        <div className="grid grid-cols-7 gap-2">
          {weeklySessions.map((day, index) => (
            <motion.div
              key={day.dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`text-center p-3 rounded-lg border transition-all ${
                day.hasStudied
                  ? 'bg-white/20 border-white/50 text-white'
                  : 'bg-white/5 border-white/20 text-gray-400'
              }`}
            >
              <div className="text-xs font-medium mb-1">
                {format(day.date, 'EEE')}
              </div>
              <div className="text-lg font-bold">
                {format(day.date, 'd')}
              </div>
              {day.hasStudied && (
                <div className="text-xs mt-1">
                  {Math.floor(day.totalMinutes / 60)}h {day.totalMinutes % 60}m
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-white mb-4">📊 Study Categories</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)
              .map(([category, minutes], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <span className="text-white font-medium">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${(minutes / Math.max(...Object.values(categoryStats))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-white text-sm w-16 text-right">
                      {Math.floor(minutes / 60)}h {minutes % 60}m
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">💡 Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className="text-2xl">📈</div>
            <div>
              <p className="text-white font-medium">Most Productive Day</p>
              <p className="text-gray-300 text-sm">
                {mostProductiveDay.day} with {Math.floor(mostProductiveDay.minutes / 60)}h {mostProductiveDay.minutes % 60}m
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="text-white font-medium">Average Session</p>
              <p className="text-gray-300 text-sm">
                {sessions.length > 0 ? Math.round(totalTime / sessions.length) : 0} minutes per session
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className="text-2xl">🔥</div>
            <div>
              <p className="text-white font-medium">Streak Status</p>
              <p className="text-gray-300 text-sm">
                {currentStreak > 0 
                  ? `Keep it up! ${currentStreak} day streak` 
                  : 'Start a new streak today!'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
