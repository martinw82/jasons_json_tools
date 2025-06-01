import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Copy } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const JsonValidator: React.FC = () => {
  const { jsonInput, addToHistory, showToast } = useApp();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formattedJson, setFormattedJson] = useState<string>('');
  
  useEffect(() => {
    validateJson();
  }, [jsonInput]);
  
  const validateJson = () => {
    if (!jsonInput.trim()) {
      setIsValid(null);
      setErrorMessage(null);
      setFormattedJson('');
      return;
    }
    
    try {
      const parsed = JSON.parse(jsonInput);
      setIsValid(true);
      setErrorMessage(null);
      
      // Format the valid JSON nicely
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
      
      // Add to history
      addToHistory(jsonInput, JSON.stringify({ isValid: true }), 'validator');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setFormattedJson('');
      
      // Add to history
      addToHistory(jsonInput, JSON.stringify({ isValid: false, error: (error as Error).message }), 'validator');
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson);
    showToast('Copied to clipboard!', 'success');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4 gap-2">
        {isValid === null ? (
          <div className="text-gray-500">Enter JSON to validate</div>
        ) : isValid ? (
          <motion.div 
            className="flex items-center gap-2 p-2 bg-success-50 text-success-700 rounded-md"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <CheckCircle className="text-success-500" size={20} />
            <span>Valid JSON</span>
          </motion.div>
        ) : (
          <motion.div 
            className="flex items-center gap-2 p-2 bg-error-50 text-error-700 rounded-md"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <XCircle className="text-error-500" size={20} />
            <span>Invalid JSON: {errorMessage}</span>
          </motion.div>
        )}
      </div>
      
      {isValid && (
        <div className="relative flex-grow">
          <div className="absolute top-2 right-2 z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-sm btn-secondary flex items-center gap-1"
              onClick={copyToClipboard}
            >
              <Copy size={14} />
              <span>Copy</span>
            </motion.button>
          </div>
          
          <div className="h-full overflow-auto border border-gray-200 rounded-md">
            <SyntaxHighlighter
              language="json"
              style={docco}
              customStyle={{ margin: 0, height: '100%' }}
            >
              {formattedJson}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
      
      {isValid === false && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium mb-2">Common JSON Errors:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Missing or extra commas</li>
            <li>Unclosed brackets or braces</li>
            <li>Missing quotes around property names</li>
            <li>Trailing commas (not allowed in JSON)</li>
            <li>Invalid escape sequences in strings</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default JsonValidator;