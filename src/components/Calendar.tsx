import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useStudyStore } from '../store/codingStore';
import SessionModal from './SessionModal';

interface CalendarProps {}

const Calendar: React.FC<CalendarProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  
  const { getTotalTimeByDate, getSessionsByDate } = useStudyStore();
  
  // Get the calendar view including leading/trailing days for proper alignment
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday = 0
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // Sunday = 0
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedSessionId(undefined);
  };

  const handleSessionClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSelectedSessionId(sessionId);
  };

  const handleDescriptionClick = (e: React.MouseEvent, sessionId: string, isTruncated: boolean) => {
    e.stopPropagation();
    if (isTruncated) {
      setExpandedSessions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sessionId)) {
          newSet.delete(sessionId);
        } else {
          newSet.add(sessionId);
        }
        return newSet;
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-accent-blue/20 text-accent-blue"
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          >
            Previous
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-accent-blue/20 text-accent-blue"
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          >
            Next
          </motion.button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <div className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass">
        <div className="grid grid-cols-7 gap-2">
          {/* Week Days Header */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-gray-400 font-medium py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const dateStr = format(day, 'yyyy-MM-dd');
            const totalMinutes = getTotalTimeByDate(dateStr);
            const sessions = getSessionsByDate(dateStr);

            return (
              <motion.div
                key={day.toString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square p-2 rounded-lg cursor-pointer
                  ${isCurrentMonth ? 'bg-glass' : 'bg-secondary/30'}
                  ${isCurrentDay ? 'ring-2 ring-accent-blue' : ''}
                  ${totalMinutes > 0 ? 'border border-accent-purple' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </span>
                  {totalMinutes > 0 && (
                    <div className="mt-1 space-y-1">
                      <div className="h-1 bg-accent-purple rounded-full" />
                      <div className="text-xs text-accent-purple">
                        {formatDuration(totalMinutes)}
                      </div>
                      {sessions.map((session, sessionIndex) => {
                        const isExpanded = expandedSessions.has(session.id);
                        const isTruncated = session.description && session.description.length > 15;
                        const displayText = session.description || `${session.category} - ${formatDuration(session.duration)}`;
                        
                        return (
                          <div
                            key={session.id}
                            onClick={(e) => handleSessionClick(e, session.id)}
                            className={`text-xs text-gray-400 hover:text-accent-blue cursor-pointer ${
                              isExpanded ? '' : 'truncate'
                            }`}
                            title={isExpanded ? undefined : displayText}
                          >
                            {sessionIndex < 2 ? (
                              session.description ? (
                                isTruncated ? (
                                  <span
                                    onClick={(e) => handleDescriptionClick(e, session.id, true)}
                                    className="cursor-pointer hover:text-accent-purple"
                                  >
                                    {isExpanded ? displayText : `${session.description.substring(0, 15)}...`}
                                  </span>
                                ) : (
                                  displayText
                                )
                              ) : (
                                formatDuration(session.duration)
                              )
                            ) : sessionIndex === 2 ? (
                              `+${sessions.length - 2} more`
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 border border-accent-blue rounded-full" />
          <span>Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-accent-purple rounded-full" />
          <span>Study Time</span>
        </div>
      </div>

      {/* Session Modal */}
      {selectedDate && (
        <SessionModal
          isOpen={true}
          onClose={() => {
            setSelectedDate(null);
            setSelectedSessionId(undefined);
          }}
          date={selectedDate}
          sessionId={selectedSessionId}
        />
      )}
    </div>
  );
};

export default Calendar; 