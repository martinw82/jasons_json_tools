import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'framer-motion';
import { Copy, Download, RefreshCcw } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { DiffOptions } from '../../types';
import { createPatch } from 'diff';

const JsonDiffMerge: React.FC = () => {
  const { jsonInput, addToHistory, showToast } = useApp();
  const [jsonA, setJsonA] = useState<string>('');
  const [jsonB, setJsonB] = useState<string>('');
  const [options, setOptions] = useState<DiffOptions>({
    mode: 'diff',
    visualDiff: true
  });
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Parse the input to extract JSON A and JSON B
    try {
      if (jsonInput) {
        const parts = jsonInput.split(/\/\/\s*JSON\s*B/i);
        
        if (parts.length >= 2) {
          // Extract JSON A
          const jsonAPart = parts[0].replace(/\/\/\s*JSON\s*A/i, '').trim();
          setJsonA(jsonAPart);
          
          // Extract JSON B
          const jsonBPart = parts[1].trim();
          setJsonB(jsonBPart);
        } else {
          // If only one part, use it as JSON A and leave B as is
          setJsonA(jsonInput);
        }
      }
    } catch (error) {
      console.error('Error parsing input', error);
    }
  }, [jsonInput]);
  
  const processJsons = () => {
    setError(null);
    
    try {
      // Parse both inputs
      const objectA = JSON.parse(jsonA);
      const objectB = JSON.parse(jsonB);
      
      if (options.mode === 'diff') {
        if (options.visualDiff) {
          // Generate diff using diff library
          const diffText = createPatch(
            'json',
            JSON.stringify(objectA, null, 2),
            JSON.stringify(objectB, null, 2),
            'JSON A',
            'JSON B'
          );
          setResult(diffText);
        } else {
          // Generate structural diff
          const diff = generateStructuralDiff(objectA, objectB);
          setResult(JSON.stringify(diff, null, 2));
        }
      } else {
        // Merge objects
        const merged = mergeObjects(objectA, objectB);
        setResult(JSON.stringify(merged, null, 2));
      }
      
      // Add to history
      addToHistory(jsonInput, result, 'diff');
    } catch (error) {
      setError(`Error processing JSON: ${(error as Error).message}`);
    }
  };
  
  const generateStructuralDiff = (a: any, b: any): any => {
    if (a === b) return { unchanged: a };
    
    if (typeof a !== typeof b) {
      return { 
        removed: a, 
        added: b 
      };
    }
    
    if (typeof a !== 'object' || a === null || b === null) {
      return { 
        removed: a, 
        added: b 
      };
    }
    
    const isArrayA = Array.isArray(a);
    const isArrayB = Array.isArray(b);
    
    if (isArrayA !== isArrayB) {
      return { 
        removed: a, 
        added: b 
      };
    }
    
    const diff: Record<string, any> = {};
    
    // Handle arrays
    if (isArrayA) {
      const commonLength = Math.min(a.length, b.length);
      const result = [];
      
      for (let i = 0; i < commonLength; i++) {
        result.push(generateStructuralDiff(a[i], b[i]));
      }
      
      if (a.length > b.length) {
        diff.arrayDiff = {
          result,
          removed: a.slice(commonLength)
        };
      } else if (b.length > a.length) {
        diff.arrayDiff = {
          result,
          added: b.slice(commonLength)
        };
      } else {
        diff.arrayDiff = { result };
      }
      
      return diff;
    }
    
    // Handle objects
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    
    allKeys.forEach(key => {
      if (!(key in a)) {
        diff[key] = { added: b[key] };
      } else if (!(key in b)) {
        diff[key] = { removed: a[key] };
      } else if (a[key] !== b[key]) {
        diff[key] = generateStructuralDiff(a[key], b[key]);
      }
    });
    
    return diff;
  };
  
  const mergeObjects = (a: any, b: any): any => {
    if (a === null || b === null) return b === null ? a : b;
    if (typeof a !== 'object' || typeof b !== 'object') return b;
    
    const isArrayA = Array.isArray(a);
    const isArrayB = Array.isArray(b);
    
    if (isArrayA !== isArrayB) return b;
    
    if (isArrayA) {
      return [...a, ...b.filter((item: any) => !a.includes(item))];
    }
    
    const result = { ...a };
    
    for (const key in b) {
      if (key in a && typeof a[key] === 'object' && typeof b[key] === 'object') {
        result[key] = mergeObjects(a[key], b[key]);
      } else {
        result[key] = b[key];
      }
    }
    
    return result;
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    showToast('Copied to clipboard!', 'success');
  };
  
  const downloadResult = () => {
    const blob = new Blob([result], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = options.mode === 'diff' ? 'diff-result.txt' : 'merged.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded!', 'success');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
            Mode:
          </label>
          <select
            id="mode"
            className="input"
            value={options.mode}
            onChange={(e) => setOptions({ ...options, mode: e.target.value as 'diff' | 'merge' })}
          >
            <option value="diff">Diff (Compare)</option>
            <option value="merge">Merge</option>
          </select>
        </div>
        
        {options.mode === 'diff' && (
          <div className="flex items-center">
            <input
              id="visualDiff"
              type="checkbox"
              checked={options.visualDiff}
              onChange={(e) => setOptions({ ...options, visualDiff: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="visualDiff" className="ml-2 text-sm text-gray-700">
              Show Visual Diff
            </label>
          </div>
        )}
        
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-1 h-9"
            onClick={processJsons}
          >
            <RefreshCcw size={16} />
            <span>{options.mode === 'diff' ? 'Compare' : 'Merge'}</span>
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            JSON A:
          </label>
          <textarea
            value={jsonA}
            onChange={(e) => setJsonA(e.target.value)}
            className="w-full h-32 p-3 font-mono text-sm border border-gray-300 rounded-md"
            placeholder="Paste your first JSON here..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            JSON B:
          </label>
          <textarea
            value={jsonB}
            onChange={(e) => setJsonB(e.target.value)}
            className="w-full h-32 p-3 font-mono text-sm border border-gray-300 rounded-md"
            placeholder="Paste your second JSON here..."
          />
        </div>
      </div>
      
      {error && (
        <motion.div 
          className="mb-4 p-3 bg-error-50 text-error-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{error}</p>
        </motion.div>
      )}
      
      <div className="relative flex-grow">
        {result && (
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
              onClick={downloadResult}
            >
              <Download size={14} />
              <span>Download</span>
            </motion.button>
          </div>
        )}
        
        <div className="h-full overflow-auto border border-gray-200 rounded-md">
          <SyntaxHighlighter
            language={options.mode === 'diff' && options.visualDiff ? 'diff' : 'json'}
            style={docco}
            customStyle={{ margin: 0, height: '100%', fontSize: '0.9rem' }}
          >
            {result || `// ${options.mode === 'diff' ? 'Diff' : 'Merged'} result will appear here`}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default JsonDiffMerge;