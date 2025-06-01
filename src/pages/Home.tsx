import React from 'react';
import { motion } from 'framer-motion';
import Toolbar from '../components/Toolbar';
import JsonInput from '../components/JsonInput';
import OutputDisplay from '../components/OutputDisplay';
import CharacterMascot from '../components/CharacterMascot';
import { useApp } from '../contexts/AppContext';

const Home: React.FC = () => {
  const { currentTool } = useApp();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Toolbar />
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div 
          className="lg:col-span-5 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <JsonInput />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-7 flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <OutputDisplay />
        </motion.div>
      </div>
      
      <CharacterMascot toolType={currentTool} />
    </div>
  );
};

export default Home;