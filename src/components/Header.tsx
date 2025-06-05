import React from 'react';
import { Leaf, Brain, ArrowRight } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
}

const Header = ({ darkMode }: HeaderProps) => {
  return (
    <header className={`relative overflow-hidden min-h-[240px] flex items-center justify-center transition-colors duration-500 ${
      darkMode
        ? 'bg-gradient-to-br from-stone-900 via-emerald-900 to-slate-900'
        : 'bg-gradient-to-br from-stone-50 via-emerald-50 to-slate-50'
    }`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.07] bg-[radial-gradient(#2c3e2c_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-tr ${
        darkMode
          ? 'from-emerald-900/20 via-stone-900/20 to-slate-900/20'
          : 'from-emerald-100/20 via-stone-100/20 to-slate-100/20'
      }`} />
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${
              darkMode ? 'text-white' : 'text-stone-900'
            }`}>
              EcoQuest
            </h1>
            <p className={`text-lg md:text-xl font-medium mb-6 ${
              darkMode ? 'text-stone-200' : 'text-stone-700'
            }`}>
              Your AI-Powered Guide to Sustainable Living
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                darkMode 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Leaf className="mr-2" size={16} />
                Eco-Friendly
              </span>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                darkMode 
                  ? 'bg-teal-500/20 text-teal-300' 
                  : 'bg-teal-100 text-teal-700'
              }`}>
                <Brain className="mr-2" size={16} />
                AI-Powered
              </span>
            </div>
          </div>
          
          {/* Right Content - Decorative Element */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full ${
              darkMode 
                ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/20' 
                : 'bg-gradient-to-tr from-emerald-200/50 to-teal-200/50'
            } blur-2xl`} />
            <div className={`relative p-6 rounded-full ${
              darkMode 
                ? 'bg-stone-800/50 border border-stone-700/50' 
                : 'bg-white/50 border border-stone-200/50'
            } backdrop-blur-sm`}>
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500">
                <Leaf className="text-white" size={40} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;