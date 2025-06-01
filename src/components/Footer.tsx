import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-8">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-2 md:mb-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <p>© {new Date().getFullYear()} Jason's JSON Toolbox</p>
            <div className="flex items-center gap-1 justify-center">
              <span className="text-xs text-gray-500">Made with</span>
              <Zap size={14} className="text-blue-500" />
              <span className="text-xs text-gray-500">Bolt</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>using React & Tailwind</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;