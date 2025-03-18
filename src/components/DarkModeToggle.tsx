"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { theme, toggleDarkMode } = useTheme();
  const isDarkMode = theme.darkMode;

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
          : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
      } ${className}`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <>
          <Sun size={18} />
          <span className="text-sm">Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={18} />
          <span className="text-sm">Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;