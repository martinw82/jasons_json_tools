import React from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { Download, Copy, Share } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JsonValidator from './tools/JsonValidator';
import JsonFormatter from './tools/JsonFormatter';
import FormatConverter from './tools/FormatConverter';
import FakeDataGenerator from './tools/FakeDataGenerator';
import JsonDiffMerge from './tools/JsonDiffMerge';

const OutputDisplay: React.FC = () => {
  const { currentTool, showToast } = useApp();

  const renderTool = () => {
    switch (currentTool) {
      case 'validator':
        return <JsonValidator />;
      case 'formatter':
        return <JsonFormatter />;
      case 'converter':
        return <FormatConverter />;
      case 'generator':
        return <FakeDataGenerator />;
      case 'diff':
        return <JsonDiffMerge />;
      default:
        return <div>Select a tool to get started</div>;
    }
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Output</h2>
      </div>
      <div className="p-4 flex-grow">
        {renderTool()}
      </div>
    </div>
  );
};

export default OutputDisplay;