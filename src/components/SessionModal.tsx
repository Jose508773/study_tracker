import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useStudyStore } from '../store/codingStore';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  sessionId?: string;
}

// Study templates for quick input
const STUDY_TEMPLATES = [
  {
    id: 'leetcode',
    name: 'LeetCode Practice',
    category: 'Programming',
    description: 'Solved coding problems and algorithms',
    icon: '💻',
    duration: 60
  },
  {
    id: 'reading',
    name: 'Reading & Research',
    category: 'General',
    description: 'Read documentation, articles, or books',
    icon: '📚',
    duration: 45
  },
  {
    id: 'project',
    name: 'Project Work',
    category: 'Programming',
    description: 'Worked on personal or work projects',
    icon: '🚀',
    duration: 120
  },
  {
    id: 'tutorial',
    name: 'Tutorial/Video',
    category: 'General',
    description: 'Watched tutorials or educational videos',
    icon: '🎥',
    duration: 30
  },
  {
    id: 'review',
    name: 'Review & Notes',
    category: 'General',
    description: 'Reviewed previous material and took notes',
    icon: '📝',
    duration: 25
  }
];

// Enhanced categories with icons
const CATEGORIES = [
  { value: 'Programming', label: 'Programming', icon: '💻', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'Mathematics', label: 'Mathematics', icon: '🔢', color: 'bg-green-500/20 text-green-400' },
  { value: 'Science', label: 'Science', icon: '🔬', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'Language', label: 'Language', icon: '🗣️', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'Design', label: 'Design', icon: '🎨', color: 'bg-pink-500/20 text-pink-400' },
  { value: 'Business', label: 'Business', icon: '💼', color: 'bg-indigo-500/20 text-indigo-400' },
  { value: 'General', label: 'General', icon: '📖', color: 'bg-gray-500/20 text-gray-400' }
];

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, date, sessionId }) => {
  const { sessions, addSession, updateSession, deleteSession } = useStudyStore();
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [studyReason, setStudyReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'template'>('manual');

  const existingSession = sessionId ? sessions.find(s => s.id === sessionId) : null;

  useEffect(() => {
    if (existingSession) {
      const totalMinutes = existingSession.duration;
      setHours(Math.floor(totalMinutes / 60).toString());
      setMinutes((totalMinutes % 60).toString());
      setDescription(existingSession.description || '');
      setCategory(existingSession.category || '');
      setStudyReason(existingSession.studyReason || '');
    } else {
      // Reset form when opening for new session
      setHours('0');
      setMinutes('0');
      setDescription('');
      setCategory('');
      setStudyReason('');
      setError(null);
      setActiveTab('manual');
    }
  }, [existingSession, isOpen]);

  // Apply template
  const applyTemplate = (template: typeof STUDY_TEMPLATES[0]) => {
    setDescription(template.description);
    setCategory(template.category);
    setHours(Math.floor(template.duration / 60).toString());
    setMinutes((template.duration % 60).toString());
    setStudyReason(`Quick template: ${template.name}`);
    setActiveTab('manual');
  };

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
    
    if (!description.trim()) {
      setError('Please describe what you studied');
      return false;
    }
    
    if (!category.trim()) {
      setError('Please select a study category');
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
          description: description.trim(),
          category: category.trim(),
          studyReason: studyReason.trim()
        });
      } else {
        const newSession = {
          date: sessionDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: totalMinutes,
          description: description.trim(),
          category: category.trim(),
          studyReason: studyReason.trim()
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

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-secondary/95 backdrop-blur-md rounded-2xl w-full max-w-lg mx-4 max-h-[95vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-secondary/95 backdrop-blur-md rounded-t-2xl p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {sessionId ? 'Edit Study Session' : 'Add Study Session'}
              </h2>
              <p className="text-gray-400 mt-1">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Navigation */}
          {!sessionId && (
            <div className="flex mb-6 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('template')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  activeTab === 'template'
                    ? 'bg-accent-blue/20 text-accent-blue'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🚀 Quick Templates
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  activeTab === 'manual'
                    ? 'bg-accent-blue/20 text-accent-blue'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ✏️ Manual Entry
              </button>
            </div>
          )}

          {/* Template Selection */}
          {activeTab === 'template' && !sessionId && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Choose a Study Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STUDY_TEMPLATES.map((template) => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => applyTemplate(template)}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-accent-blue/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h4 className="font-medium text-white">{template.name}</h4>
                        <p className="text-sm text-gray-400">{template.description}</p>
                        <p className="text-xs text-accent-blue mt-1">
                          {Math.floor(template.duration / 60)}h {template.duration % 60}m • {template.category}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
              >
                {error}
              </motion.div>
            )}

            {/* Time Input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ⏰ Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ⏱️ Minutes
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Study Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🎯 Why did you study this?
              </label>
              <input
                type="text"
                value={studyReason}
                onChange={(e) => {
                  setStudyReason(e.target.value);
                  setError(null);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all"
                placeholder="e.g., Preparing for interview, learning new skill, project requirement..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                📝 What did you study?
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError(null);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all h-24 resize-none"
                placeholder="Describe what you learned, topics covered, or activities performed..."
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🏷️ Study Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCategory(cat.value);
                      setError(null);
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      category === cat.value
                        ? 'border-accent-blue bg-accent-blue/20 text-accent-blue'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-white/10">
              {sessionId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  🗑️ Delete Session
                </motion.button>
              )}
              <div className="flex gap-3 ml-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-accent-blue/20 text-accent-blue border border-accent-blue hover:bg-accent-blue/30 transition-all font-medium"
                >
                  {sessionId ? '💾 Update Session' : '✨ Add Session'}
                </motion.button>
              </div>
            </div>
          </form>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-secondary/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-red-500/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🗑️</div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Study Session</h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete this study session? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="px-6 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                  >
                    Delete Session
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SessionModal; 