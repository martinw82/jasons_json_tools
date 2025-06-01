import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'framer-motion';
import { Copy, Download } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FormatterOptions } from '../../types';

const JsonFormatter: React.FC = () => {
  const { jsonInput, addToHistory, showToast } = useApp();
  const [options, setOptions] = useState<FormatterOptions>({
    indent: 2,
    sortKeys: false,
  });
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'pretty' | 'minify'>('pretty');
  
  useEffect(() => {
    formatJson();
  }, [jsonInput, options, mode]);
  
  const formatJson = () => {
    if (!jsonInput.trim()) {
      setFormattedJson('');
      setIsValid(null);
      return;
    }
    
    try {
      let parsed = JSON.parse(jsonInput);
      let result = '';
      
      if (mode === 'pretty') {
        if (options.sortKeys) {
          parsed = sortObjectKeys(parsed);
        }
        result = JSON.stringify(parsed, null, options.indent);
      } else {
        result = JSON.stringify(parsed);
      }
      
      setFormattedJson(result);
      setIsValid(true);
      setErrorMessage(null);
      
      // Add to history
      addToHistory(jsonInput, result, 'formatter');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setFormattedJson('');
    }
  };
  
  const sortObjectKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }
    
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
      }, {} as Record<string, any>);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson);
    showToast('Copied to clipboard!', 'success');
  };
  
  const downloadJson = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON file downloaded!', 'success');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <button
            className={`btn-sm ${mode === 'pretty' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('pretty')}
          >
            Pretty Print
          </button>
          <button
            className={`btn-sm ${mode === 'minify' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('minify')}
          >
            Minify
          </button>
        </div>
        
        {mode === 'pretty' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="indent" className="text-sm whitespace-nowrap">
                Indent:
              </label>
              <select
                id="indent"
                className="input py-1 px-2"
                value={options.indent}
                onChange={(e) => setOptions({ ...options, indent: Number(e.target.value) })}
              >
                {[2, 4, 6, 8].map((value) => (
                  <option key={value} value={value}>
                    {value} spaces
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="sortKeys"
                type="checkbox"
                checked={options.sortKeys}
                onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="sortKeys" className="text-sm">
                Sort Keys Alphabetically
              </label>
            </div>
          </div>
        )}
      </div>
      
      {isValid === false && (
        <motion.div 
          className="mb-4 p-3 bg-error-50 text-error-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>Invalid JSON: {errorMessage}</p>
        </motion.div>
      )}
      
      <div className="relative flex-grow">
        {isValid && (
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-sm btn-secondary flex items-center gap-1"
              onClick={copyToClipboard}
            >
              <Copy size={14} />
              <span>Copy</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-sm btn-primary flex items-center gap-1"
              onClick={downloadJson}
            >
              <Download size={14} />
              <span>Download</span>
            </motion.button>
          </div>
        )}
        
        <div className="h-full overflow-auto border border-gray-200 rounded-md">
          <SyntaxHighlighter
            language="json"
            style={docco}
            customStyle={{ margin: 0, height: '100%', fontSize: '0.9rem' }}
          >
            {formattedJson || '// Formatted JSON will appear here'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;