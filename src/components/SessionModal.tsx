import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useStudyStore } from '../store/codingStore';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  sessionId?: string;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, date, sessionId }) => {
  const { sessions, addSession, updateSession, deleteSession } = useStudyStore();
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingSession = sessionId ? sessions.find(s => s.id === sessionId) : null;

  useEffect(() => {
    if (existingSession) {
      const totalMinutes = existingSession.duration;
      setHours(Math.floor(totalMinutes / 60).toString());
      setMinutes((totalMinutes % 60).toString());
      setDescription(existingSession.description || '');
    } else {
      // Reset form when opening for new session
      setHours('0');
      setMinutes('0');
      setDescription('');
      setError(null);
    }
  }, [existingSession, isOpen]);

  const validateInput = () => {
    const hoursNum = parseInt(hours);
    const minutesNum = parseInt(minutes);
    
    if (isNaN(hoursNum) || isNaN(minutesNum)) {
      setError('Please enter valid numbers for hours and minutes');
      return false;
    }
    
    if (hoursNum < 0 || minutesNum < 0) {
      setError('Hours and minutes cannot be negative');
      return false;
    }
    
    if (minutesNum >= 60) {
      setError('Minutes must be less than 60');
      return false;
    }
    
    if (hoursNum === 0 && minutesNum === 0) {
      setError('Please enter a duration greater than 0');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateInput()) {
      return;
    }
    
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const sessionDate = format(date, 'yyyy-MM-dd');
    const startTime = new Date(sessionDate + 'T00:00:00');
    const endTime = new Date(startTime.getTime() + totalMinutes * 60000);
    
    try {
      if (sessionId) {
        updateSession(sessionId, {
          duration: totalMinutes,
          description: description.trim() || 'Study session'
        });
      } else {
        const newSession = {
          date: sessionDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: totalMinutes,
          description: description.trim() || 'Study session'
        };
        console.log('Creating new session:', newSession);
        addSession(newSession);
      }
      onClose();
    } catch (err) {
      console.error('Error saving session:', err);
      setError('Failed to save session. Please try again.');
    }
  };

  const handleDelete = () => {
    if (sessionId) {
      try {
        deleteSession(sessionId);
        onClose();
      } catch (err) {
        console.error('Error deleting session:', err);
        setError('Failed to delete session. Please try again.');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-secondary/90 backdrop-blur-md rounded-xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              {sessionId ? 'Edit Session' : 'Add Session'}
            </h2>
            <p className="text-gray-400 mb-4">
              {format(date, 'MMMM d, yyyy')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm mb-4">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) => {
                      setHours(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-glass rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => {
                      setMinutes(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-glass rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-glass rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-blue outline-none h-24 resize-none"
                  placeholder="What did you study?"
                />
              </div>

              <div className="flex justify-between space-x-4 pt-4">
                {sessionId && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30"
                  >
                    Delete
                  </motion.button>
                )}
                <div className="flex space-x-4 ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-accent-blue/20 text-accent-blue border border-accent-blue hover:bg-accent-blue/30"
                  >
                    {sessionId ? 'Update' : 'Add'} Session
                  </motion.button>
                </div>
              </div>
            </form>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-secondary/90 backdrop-blur-md rounded-xl p-6 w-full max-w-md"
                    onClick={e => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold mb-4">Delete Session</h3>
                    <p className="text-gray-400 mb-6">
                      Are you sure you want to delete this study session? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionModal; 