import { motion } from 'framer-motion';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
  ];

  return (
    <nav className="bg-secondary/30 backdrop-blur-xs border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <img src="/code.svg" alt="StudyTracker Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold gradient-text">
              StudyTracker
            </span>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-4 py-2 rounded-lg transition-all duration-300
                  flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 