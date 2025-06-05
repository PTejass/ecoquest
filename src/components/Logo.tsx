import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Brain } from 'lucide-react';

interface LogoProps {
  darkMode: boolean;
}

const Logo: React.FC<LogoProps> = ({ darkMode }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        darkMode 
          ? 'text-stone-300 hover:bg-stone-700/50' 
          : 'text-stone-600 hover:bg-stone-100'
      }`}
    >
      <div className="relative">
        <Leaf 
          size={24} 
          className={`${
            darkMode 
              ? 'text-emerald-400' 
              : 'text-emerald-600'
          }`}
        />
        <Brain 
          size={16} 
          className={`absolute -bottom-1 -right-1 ${
            darkMode 
              ? 'text-teal-400' 
              : 'text-teal-600'
          }`}
        />
      </div>
      <span className={`text-lg font-semibold ${
        darkMode 
          ? 'text-stone-100' 
          : 'text-stone-800'
      }`}>
        EcoQuest
      </span>
    </Link>
  );
};

export default Logo; 