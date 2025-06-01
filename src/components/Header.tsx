import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Settings, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/10 p-1 rounded-lg flex items-center justify-center">
            <img 
              src="/Jason_the_JSON_Helper_transparent.png" 
              alt="Jason the JSON Helper" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Jason's JSON Toolbox</h1>
            <p className="text-xs md:text-sm text-white/80">The playful way to handle your JSON data</p>
          </div>
        </motion.div>
        
        <motion.nav 
          className="flex items-center gap-4 mt-4 md:mt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/90 hover:text-white flex items-center gap-1 text-sm"
          >
            <Github size={16} />
            <span className="hidden md:inline">GitHub</span>
          </a>
          <a 
            href="#" 
            className="text-white/90 hover:text-white flex items-center gap-1 text-sm"
          >
            <Settings size={16} />
            <span className="hidden md:inline">Settings</span>
          </a>
        </motion.nav>
      </div>
    </header>
  );
};

export default Header;