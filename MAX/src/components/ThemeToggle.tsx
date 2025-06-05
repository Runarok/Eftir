import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  icon: React.ReactNode;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ icon }) => {
  const { toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-300 dark:bg-gray-800 bg-white dark:text-white text-gray-800 dark:hover:bg-gray-700 hover:bg-gray-200 shadow-md"
      aria-label="Toggle theme"
    >
      {icon}
    </button>
  );
};

export default ThemeToggle;