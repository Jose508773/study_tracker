import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useStudyStore } from '../store/codingStore';

const StudySessionCards: React.FC = () => {
  const { sessions, deleteSession } = useStudyStore();

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Programming': '💻',
      'Mathematics': '🔢',
      'Science': '🔬',
      'Language': '🗣️',
      'Design': '🎨',
      'Business': '💼',
      'General': '📚'
    };
    return icons[category] || '📖';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Programming': 'border-blue-500/50 bg-blue-500/10',
      'Mathematics': 'border-green-500/50 bg-green-500/10',
      'Science': 'border-purple-500/50 bg-purple-500/10',
      'Language': 'border-yellow-500/50 bg-yellow-500/10',
      'Design': 'border-pink-500/50 bg-pink-500/10',
      'Business': 'border-indigo-500/50 bg-indigo-500/10',
      'General': 'border-gray-500/50 bg-gray-500/10'
    };
    return colors[category] || 'border-white/50 bg-white/10';
  };

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
      >
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Study Sessions Yet</h3>
        <p className="text-gray-400">
          Start the timer to begin tracking your learning progress!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">📋</div>
        <h2 className="text-2xl font-bold text-white">Study Sessions</h2>
        <div className="ml-auto text-sm text-gray-400">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 ${getCategoryColor(session.category)}`}
          >
            {/* Category Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(session.category)}</span>
                <span className="text-sm font-medium text-white/80 bg-white/10 px-2 py-1 rounded-full">
                  {session.category}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deleteSession(session.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
              >
                🗑️
              </motion.button>
            </div>

            {/* Session Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {format(new Date(session.date), 'MMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-300">
                  {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                </p>
              </div>

              {session.description && (
                <div>
                  <p className="text-white text-sm leading-relaxed">
                    {session.description}
                  </p>
                </div>
              )}

              {session.studyReason && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Study Reason:</p>
                  <p className="text-white text-sm">{session.studyReason}</p>
                </div>
              )}

              {/* Duration Badge */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <span className="text-white font-semibold">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round(session.duration / 60 * 10) / 10}h
                </div>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4">📊 Session Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {sessions.length}
            </div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.floor(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)}h
            </div>
            <div className="text-sm text-gray-400">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length) : 0}m
            </div>
            <div className="text-sm text-gray-400">Avg Session</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {new Set(sessions.map(s => s.date)).size}
            </div>
            <div className="text-sm text-gray-400">Study Days</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudySessionCards;
