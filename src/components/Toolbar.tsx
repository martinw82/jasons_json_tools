import React from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Code, 
  Shuffle, 
  Database, 
  GitCompare 
} from 'lucide-react';
import { ToolOption, ToolType } from '../types';

const tools: ToolOption[] = [
  {
    id: 'validator',
    name: 'Validate',
    description: 'Verify if your JSON is valid',
    icon: 'CheckCircle'
  },
  {
    id: 'formatter',
    name: 'Format',
    description: 'Pretty-print or minify JSON',
    icon: 'Code'
  },
  {
    id: 'converter',
    name: 'Convert',
    description: 'Transform JSON to other formats',
    icon: 'Shuffle'
  },
  {
    id: 'generator',
    name: 'Generate',
    description: 'Create fake JSON data',
    icon: 'Database'
  },
  {
    id: 'diff',
    name: 'Diff/Merge',
    description: 'Compare or merge JSON files',
    icon: 'GitCompare'
  }
];

const Toolbar: React.FC = () => {
  const { currentTool, setCurrentTool } = useApp();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle':
        return <CheckCircle size={20} />;
      case 'Code':
        return <Code size={20} />;
      case 'Shuffle':
        return <Shuffle size={20} />;
      case 'Database':
        return <Database size={20} />;
      case 'GitCompare':
        return <GitCompare size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Choose a Tool</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              className={`p-3 rounded-lg border ${
                currentTool === tool.id
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              } transition-all flex flex-col items-center text-center`}
              onClick={() => setCurrentTool(tool.id as ToolType)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`mb-2 ${currentTool === tool.id ? 'text-primary-500' : 'text-gray-500'}`}>
                {getIcon(tool.icon)}
              </div>
              <span className="font-medium text-sm">{tool.name}</span>
              <span className="text-xs mt-1 text-gray-500 hidden md:block">{tool.description}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;