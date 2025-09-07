import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudyStore } from '../store/codingStore';
import { format } from 'date-fns';

interface DashboardWidget {
  id: string;
  type: 'stats' | 'chart' | 'recent' | 'goals';
  title: string;
  enabled: boolean;
  position: number;
}

interface CustomizableDashboardProps {
  onClose: () => void;
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ onClose }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'stats', type: 'stats', title: 'Statistics', enabled: true, position: 0 },
    { id: 'chart', type: 'chart', title: 'Weekly Chart', enabled: true, position: 1 },
    { id: 'recent', type: 'recent', title: 'Recent Activity', enabled: true, position: 2 },
    { id: 'goals', type: 'goals', title: 'Goals & Achievements', enabled: true, position: 3 },
  ]);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const { sessions, getTotalTime, getStreak } = useStudyStore();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions.filter(s => s.date === today);
  const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    if (!draggedWidget) return;

    setWidgets(prev => {
      const newWidgets = [...prev];
      const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget);
      const targetIndex = newWidgets.findIndex(w => w.position === targetPosition);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Swap positions
        const draggedWidget = newWidgets[draggedIndex];
        const targetWidget = newWidgets[targetIndex];
        
        newWidgets[draggedIndex] = { ...targetWidget, position: draggedWidget.position };
        newWidgets[targetIndex] = { ...draggedWidget, position: targetWidget.position };
      }

      return newWidgets;
    });

    setDraggedWidget(null);
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
  };

  const renderWidget = (widget: DashboardWidget) => {
    if (!widget.enabled) return null;

    switch (widget.type) {
      case 'stats':
        return (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
          >
            <h3 className="text-xl font-bold mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent-blue">{formatDuration(todayTotal)}</p>
                <p className="text-sm text-gray-400">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent-purple">{getStreak()}</p>
                <p className="text-sm text-gray-400">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent-teal">{formatDuration(getTotalTime())}</p>
                <p className="text-sm text-gray-400">Total Time</p>
              </div>
            </div>
          </motion.div>
        );

      case 'chart':
        return (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
          >
            <h3 className="text-xl font-bold mb-4">Weekly Overview</h3>
            <div className="h-32 flex items-end space-x-2">
              {Array.from({ length: 7 }, (_, i) => {
                const day = new Date();
                day.setDate(day.getDate() - (6 - i));
                const dateStr = format(day, 'yyyy-MM-dd');
                const daySessions = sessions.filter(s => s.date === dateStr);
                const dayTotal = daySessions.reduce((sum, s) => sum + s.duration, 0);
                const height = Math.min((dayTotal / 120) * 100, 100); // Max 2 hours for 100% height
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-accent-blue/20 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400 mt-2">
                      {format(day, 'EEE')}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'recent':
        return (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
          >
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {sessions.slice(-3).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-glass rounded-lg">
                  <div>
                    <p className="font-medium">{session.description}</p>
                    <p className="text-sm text-gray-400">{format(new Date(session.date), 'MMM d')}</p>
                  </div>
                  <span className="text-accent-blue">{formatDuration(session.duration)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'goals':
        return (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 backdrop-blur-xs rounded-xl p-6 shadow-glass"
          >
            <h3 className="text-xl font-bold mb-4">Quick Goals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Daily Goal (2h)</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-blue transition-all duration-500"
                    style={{ width: `${Math.min((todayTotal / 120) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Weekly Goal (10h)</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-purple transition-all duration-500"
                    style={{ width: `${Math.min((getTotalTime() / 600) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

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
        className="bg-secondary/90 backdrop-blur-md rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customize Dashboard</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </motion.button>
        </div>

        {/* Widget Controls */}
        <div className="mb-6 p-4 bg-glass rounded-lg">
          <h3 className="text-lg font-medium mb-3">Widget Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {widgets.map((widget) => (
              <motion.label
                key={widget.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={widget.enabled}
                  onChange={() => toggleWidget(widget.id)}
                  className="w-4 h-4 text-accent-blue bg-glass border-gray-600 rounded focus:ring-accent-blue"
                />
                <span className="text-sm">{widget.title}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Dashboard Preview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgets
              .filter(w => w.enabled)
              .sort((a, b) => a.position - b.position)
              .map((widget) => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, widget.position)}
                  className={`cursor-move transition-all duration-200 ${
                    draggedWidget === widget.id ? 'opacity-50' : ''
                  }`}
                >
                  {renderWidget(widget)}
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-accent-blue/20 text-accent-blue border border-accent-blue hover:bg-accent-blue/30"
          >
            Save Layout
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomizableDashboard;
