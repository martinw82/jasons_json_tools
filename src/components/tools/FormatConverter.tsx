import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'framer-motion';
import { Copy, Download, RefreshCcw } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ConverterOptions } from '../../types';
import yaml from 'js-yaml';
import TOML from '@iarna/toml';
import Papa from 'papaparse';

const FormatConverter: React.FC = () => {
  const { jsonInput, addToHistory, showToast } = useApp();
  const [options, setOptions] = useState<ConverterOptions>({
    format: 'json',
    includeHeader: true,
    delimiter: ','
  });
  const [converted, setConverted] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    convertJson();
  }, [jsonInput, options]);
  
  const convertJson = () => {
    if (!jsonInput.trim()) {
      setConverted('');
      setIsValid(null);
      return;
    }
    
    try {
      const parsed = JSON.parse(jsonInput);
      let result = '';
      
      switch (options.format) {
        case 'json':
          result = JSON.stringify(parsed, null, 2);
          break;
        case 'yaml':
          result = yaml.dump(parsed);
          break;
        case 'toml':
          try {
            result = TOML.stringify(parsed);
          } catch (error) {
            throw new Error('Could not convert to TOML. TOML has limitations for complex objects.');
          }
          break;
        case 'csv':
          try {
            if (Array.isArray(parsed)) {
              result = Papa.unparse(parsed, {
                header: options.includeHeader,
                delimiter: options.delimiter
              });
            } else {
              // For simple objects, convert to array with one row
              result = Papa.unparse([parsed], {
                header: options.includeHeader,
                delimiter: options.delimiter
              });
            }
          } catch (error) {
            throw new Error('Could not convert to CSV. CSV works best with arrays of flat objects.');
          }
          break;
      }
      
      setConverted(result);
      setIsValid(true);
      setErrorMessage(null);
      
      // Add to history
      addToHistory(jsonInput, result, 'converter');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setConverted('');
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(converted);
    showToast('Copied to clipboard!', 'success');
  };
  
  const downloadFile = () => {
    const extensions: Record<string, string> = {
      json: 'json',
      yaml: 'yaml',
      toml: 'toml',
      csv: 'csv'
    };
    
    const mimeTypes: Record<string, string> = {
      json: 'application/json',
      yaml: 'text/yaml',
      toml: 'text/plain',
      csv: 'text/csv'
    };
    
    const blob = new Blob([converted], { type: mimeTypes[options.format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${extensions[options.format]}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${options.format.toUpperCase()} file downloaded!`, 'success');
  };
  
  const getLanguage = () => {
    switch (options.format) {
      case 'json': return 'json';
      case 'yaml': return 'yaml';
      case 'toml': return 'ini';
      case 'csv': return 'csv';
      default: return 'text';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
            Convert To:
          </label>
          <select
            id="format"
            className="input"
            value={options.format}
            onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
          >
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="toml">TOML</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        
        {options.format === 'csv' && (
          <>
            <div>
              <label htmlFor="includeHeader" className="block text-sm font-medium text-gray-700 mb-1">
                Include Headers:
              </label>
              <div className="flex items-center h-9 mt-1">
                <input
                  id="includeHeader"
                  type="checkbox"
                  checked={options.includeHeader}
                  onChange={(e) => setOptions({ ...options, includeHeader: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="includeHeader" className="ml-2 text-sm text-gray-700">
                  Include column headers
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="delimiter" className="block text-sm font-medium text-gray-700 mb-1">
                Delimiter:
              </label>
              <select
                id="delimiter"
                className="input"
                value={options.delimiter}
                onChange={(e) => setOptions({ ...options, delimiter: e.target.value })}
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </>
        )}
        
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-1 h-9"
            onClick={convertJson}
          >
            <RefreshCcw size={16} />
            <span>Convert</span>
          </motion.button>
        </div>
      </div>
      
      {isValid === false && (
        <motion.div 
          className="mb-4 p-3 bg-error-50 text-error-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>Error: {errorMessage}</p>
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
              onClick={downloadFile}
            >
              <Download size={14} />
              <span>Download</span>
            </motion.button>
          </div>
        )}
        
        <div className="h-full overflow-auto border border-gray-200 rounded-md">
          <SyntaxHighlighter
            language={getLanguage()}
            style={docco}
            customStyle={{ margin: 0, height: '100%', fontSize: '0.9rem' }}
          >
            {converted || `// Converted ${options.format.toUpperCase()} will appear here`}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default FormatConverter;