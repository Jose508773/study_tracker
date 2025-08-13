import { motion } from 'framer-motion';
import { useStudyStore } from '../store/codingStore';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

const DataVisualization = () => {
  const { sessions } = useStudyStore();

  // Get last 7 days of data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  // Calculate daily totals
  const dailyTotals = last7Days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter((s) => s.date === dateStr);
    return {
      date: format(day, 'EEE'),
      total: daySessions.reduce((sum, s) => sum + s.duration, 0),
    };
  });

  // Calculate weekly total
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekSessions = sessions.filter(
    (s) =>
      new Date(s.date) >= weekStart && new Date(s.date) <= weekEnd
  );
  const weeklyTotal = weekSessions.reduce((sum, s) => sum + s.duration, 0);

  // Calculate average daily time
  const averageDailyTime =
    dailyTotals.reduce((sum, day) => sum + day.total, 0) / dailyTotals.length;

  // Find best day
  const bestDay = dailyTotals.reduce(
    (max, day) => (day.total > max.total ? day : max),
    dailyTotals[0]
  );

  return (
    <div className="space-y-8">
      {/* Weekly Overview */}
      <div className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass">
        <h2 className="text-xl font-bold mb-6">Weekly Overview</h2>
        <div className="h-48 flex items-end space-x-2">
          {dailyTotals.map((day) => (
            <motion.div
              key={day.date}
              initial={{ height: 0 }}
              animate={{
                height: `${Math.min((day.total / (bestDay.total || 1)) * 100, 100)}%`,
              }}
              transition={{ duration: 0.5 }}
              className="flex-1 bg-accent-blue/20 rounded-t-lg relative group"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-secondary/90 px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(day.total / 60)}h
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                {day.date}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
        >
          <h3 className="text-lg font-medium mb-2">Weekly Total</h3>
          <p className="text-3xl font-bold text-accent-blue">
            {Math.round(weeklyTotal / 60)}h
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
        >
          <h3 className="text-lg font-medium mb-2">Average Daily Time</h3>
          <p className="text-3xl font-bold text-accent-purple">
            {Math.round(averageDailyTime / 60)}h
          </p>
          <p className="text-sm text-gray-400 mt-1">Last 7 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
        >
          <h3 className="text-lg font-medium mb-2">Best Day</h3>
          <p className="text-3xl font-bold text-accent-teal">
            {Math.round(bestDay.total / 60)}h
          </p>
          <p className="text-sm text-gray-400 mt-1">{bestDay.date}</p>
        </motion.div>
      </div>

      {/* Time Distribution */}
      <div className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass">
        <h2 className="text-xl font-bold mb-6">Time Distribution</h2>
        <div className="space-y-4">
          {dailyTotals.map((day) => (
            <div key={day.date} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{day.date}</span>
                <span className="text-accent-blue">
                  {Math.round(day.total / 60)}h
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-blue"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((day.total / (bestDay.total || 1)) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataVisualization; 