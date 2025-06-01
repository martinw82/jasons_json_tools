import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToolType } from '../types';

interface CharacterMascotProps {
  toolType: ToolType;
}

const mascotTips: Record<ToolType, string[]> = {
  validator: [
    'Make sure your JSON has matching brackets and quotes!',
    'Trailing commas aren\'t allowed in standard JSON.',
    'Need help? Double-check your syntax for common errors.'
  ],
  formatter: [
    'Pretty-printing makes your JSON easier to read!',
    'Minifying removes whitespace to save bytes.',
    'Try different indentation levels for your preferred style.'
  ],
  converter: [
    'Converting to CSV works best with flat or 2-level objects.',
    'YAML is great for configuration files!',
    'TOML is becoming popular for config files too.'
  ],
  generator: [
    'Generate sample data to test your applications!',
    'You can customize the schema for more specific data.',
    'Try different data types to see what works best for you.'
  ],
  diff: [
    'Spot differences between two JSON structures easily!',
    'The merge tool combines two JSON objects intelligently.',
    'Visual diff highlights additions, removals, and changes.'
  ]
};

const getRandomTip = (tips: string[]) => {
  return tips[Math.floor(Math.random() * tips.length)];
};

const CharacterMascot: React.FC<CharacterMascotProps> = ({ toolType }) => {
  const [tip, setTip] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Update tip when tool changes
  useEffect(() => {
    setIsVisible(false);
    setTimeout(() => {
      setTip(getRandomTip(mascotTips[toolType]));
      setIsVisible(true);
    }, 500);
  }, [toolType]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 right-4 flex items-end gap-3 z-10 max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="speech-bubble speech-bubble-left bg-white p-3 text-sm text-gray-700 rounded-xl shadow-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {tip}
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            animate={{ 
              y: [0, -8, 0], 
            }}
            transition={{ 
              y: { 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut",
              },
            }}
          >
            <img 
              src="/Jason_the_JSON_Helper_transparent.png" 
              alt="Jason the JSON Helper" 
              className="w-20 h-20 object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CharacterMascot;