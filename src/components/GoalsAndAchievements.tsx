import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGoalsStore } from '../store/goalsStore';
import { format } from 'date-fns';

type GoalType = 'daily' | 'weekly' | 'monthly';

const GoalsAndAchievements = () => {
  const { goals, achievements, addGoal } = useGoalsStore();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'daily' as GoalType,
    targetMinutes: 60,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleAddGoal = () => {
    addGoal(newGoal);
    setShowAddGoal(false);
    setNewGoal({
      type: 'daily',
      targetMinutes: 60,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="space-y-8">
      {/* Goals Section */}
      <div className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Goals</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-accent-blue/20 text-accent-blue border border-accent-blue"
            onClick={() => setShowAddGoal(true)}
          >
            Add Goal
          </motion.button>
        </div>

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-glass rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-medium capitalize">{goal.type} Goal</h3>
                    <p className="text-sm text-gray-400">
                      {format(new Date(goal.startDate), 'MMM d')} -{' '}
                      {format(new Date(goal.endDate), 'MMM d')}
                    </p>
                  </div>
                  <span className="text-accent-blue">
                    {Math.round((goal.progress / goal.targetMinutes) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.progress / goal.targetMinutes) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-4">
            No goals set. Add a goal to start tracking your progress!
          </p>
        )}
      </div>

      {/* Achievements Section */}
      <div className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass">
        <h2 className="text-xl font-bold mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                bg-glass rounded-lg p-4
                ${achievement.unlockedAt ? 'border border-accent-purple' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-accent-purple mt-1">
                      Unlocked on {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                {!achievement.unlockedAt && (
                  <div className="text-sm text-gray-400">
                    {achievement.progress}/{achievement.target}
                  </div>
                )}
              </div>
              {!achievement.unlockedAt && (
                <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent-purple"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(achievement.progress / achievement.target) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowAddGoal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-secondary/90 backdrop-blur-md rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Add New Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Goal Type
                </label>
                <select
                  value={newGoal.type}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, type: e.target.value as GoalType })
                  }
                  className="w-full bg-glass rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-blue outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Target Minutes
                </label>
                <input
                  type="number"
                  min="1"
                  value={newGoal.targetMinutes}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetMinutes: parseInt(e.target.value) })
                  }
                  className="w-full bg-glass rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-blue outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="w-full bg-glass rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.endDate}
                    onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="w-full bg-glass rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-accent-blue outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddGoal}
                  className="px-4 py-2 rounded-lg bg-accent-blue/20 text-accent-blue border border-accent-blue hover:bg-accent-blue/30"
                >
                  Add Goal
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GoalsAndAchievements; 