import { motion } from 'framer-motion';
import { BookOpen, LogOut } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: 'home' | 'about') => void;
  onLogout: () => void;
}

const Header = ({ onNavigate, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-2 cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onNavigate('home')}
        >
          <div className="bg-primary-600 text-white p-2 rounded-md">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LectureIQ</h1>
            <p className="text-xs text-gray-500">Video to MCQ Generator</p>
          </div>
        </motion.div>
        
        <motion.nav 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center space-x-6"
        >
          <ul className="flex space-x-6">
            <li>
              <button 
                onClick={() => onNavigate('home')}
                className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
              >
                About
              </button>
            </li>
          </ul>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </motion.nav>
      </div>
    </header>
  );
};

export default Header;