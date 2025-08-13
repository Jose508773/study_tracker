import { motion } from 'framer-motion';
import { useState } from 'react';
import Timer from './components/Timer';
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,245,255,0.1),rgba(157,78,221,0.1))]" />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Timer Section */}
            <motion.div
              className="lg:col-span-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-secondary/50 backdrop-blur-xs rounded-2xl p-6 shadow-glass border border-white/10">
                <Timer />
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-secondary/50 backdrop-blur-xs rounded-2xl p-6 shadow-glass border border-white/10">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'calendar' && <Calendar />}
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
          <p>Built with ❤️ for students using React, Three.js, and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

export default App; 