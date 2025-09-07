import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Ring } from '@react-three/drei';
import { useStudyStore } from '../store/codingStore';

interface TimerProps {}

const Timer: React.FC<TimerProps> = () => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [displayTime, setDisplayTime] = useState(0);
  const { addSession } = useStudyStore();
  const startTimestampRef = useRef<number | null>(null);
  const pauseTimestampRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time timer update
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (startTimestampRef.current !== null) {
          const currentTime = Date.now();
          const sessionTime = Math.floor((currentTime - startTimestampRef.current) / 1000);
          const totalTime = elapsed + sessionTime - totalPausedTimeRef.current;
          setDisplayTime(Math.max(0, totalTime));
        }
      }, 100); // Update every 100ms for smooth display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, elapsed]);

  // Update display time when not running
  useEffect(() => {
    if (!isRunning) {
      setDisplayTime(elapsed);
    }
  }, [isRunning, elapsed]);

  const toggleTimer = () => {
    if (isRunning) {
      // Stop the timer
      if (startTimestampRef.current !== null) {
        const now = Date.now();
        const sessionSeconds = Math.floor((now - startTimestampRef.current) / 1000);
        const totalSeconds = elapsed + sessionSeconds - totalPausedTimeRef.current;
        
        // Update elapsed time
        setElapsed(totalSeconds);
        
        // Only save session if it's at least 1 minute
        if (totalSeconds >= 60) {
          const nowDate = new Date();
          const startDate = new Date(now - sessionSeconds * 1000);
          
          addSession({
            date: nowDate.toISOString().split('T')[0],
            startTime: startDate.toISOString(),
            endTime: nowDate.toISOString(),
            duration: Math.round(totalSeconds / 60), // Convert seconds to minutes
            description: description || 'Study session',
            category: category || 'General',
          });
        }
        
        setDescription('');
        setCategory('');
      }
      startTimestampRef.current = null;
      totalPausedTimeRef.current = 0;
      setIsPaused(false);
    } else {
      // Start the timer
      startTimestampRef.current = Date.now();
    }
    setIsRunning(!isRunning);
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume
      if (pauseTimestampRef.current !== null) {
        const pauseDuration = Date.now() - pauseTimestampRef.current;
        totalPausedTimeRef.current += Math.floor(pauseDuration / 1000);
        pauseTimestampRef.current = null;
      }
      // Update start timestamp to account for pause time
      if (startTimestampRef.current !== null) {
        startTimestampRef.current = Date.now();
      }
    } else {
      // Pause
      pauseTimestampRef.current = Date.now();
    }
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setElapsed(0);
    setDisplayTime(0);
    setIsRunning(false);
    setIsPaused(false);
    setDescription('');
    setCategory('');
    startTimestampRef.current = null;
    pauseTimestampRef.current = null;
    totalPausedTimeRef.current = 0;
    
    // Clear any running intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-2xl font-bold text-accent-blue">Study Timer</h2>
      
      {/* 3D Timer Ring */}
      <div className="w-48 h-48">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Ring
            args={[1, 1.2, 64]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
          >
            <meshStandardMaterial
              color="#00F5FF"
              emissive="#00F5FF"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </Ring>
        </Canvas>
      </div>

      {/* Timer Display */}
      <motion.div
        className="text-4xl font-mono font-bold text-white"
        animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {formatTime(displayTime)}
      </motion.div>

      {/* Session Description and Category */}
      {!isRunning && (
        <div className="w-full max-w-md space-y-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you studying?"
            className="w-full px-4 py-2 rounded-lg bg-glass text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-blue outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-glass text-white focus:ring-2 focus:ring-accent-blue outline-none"
          >
            <option value="">Select Category</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="Language">Language</option>
            <option value="History">History</option>
            <option value="Programming">Programming</option>
            <option value="Art">Art</option>
            <option value="Music">Music</option>
            <option value="General">General</option>
          </select>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 rounded-full ${
            isRunning
              ? 'bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30'
              : 'bg-accent-blue/20 text-accent-blue border border-accent-blue hover:bg-accent-blue/30'
          }`}
          onClick={toggleTimer}
        >
          {isRunning ? 'Stop' : 'Start'}
        </motion.button>
        
        {isRunning && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full ${
              isPaused
                ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal hover:bg-accent-teal/30'
                : 'bg-accent-purple/20 text-accent-purple border border-accent-purple hover:bg-accent-purple/30'
            }`}
            onClick={togglePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500 hover:bg-gray-500/30 transition-colors"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Reset
        </motion.button>
      </div>

      {/* Delete Confirmation Modal */}
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
            <h3 className="text-xl font-bold mb-4">Reset Timer</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to reset the timer? This will clear the current session time.
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
                onClick={() => {
                  resetTimer();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30"
              >
                Reset
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Timer; 