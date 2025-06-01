import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { RotateCw, Upload, History, Trash2 } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const SAMPLE_DATA = {
  validator: `{
  "name": "Jason",
  "profession": "JSON Enthusiast",
  "age": 25,
  "skills": ["JavaScript", "TypeScript", "React"],
  "contact": {
    "email": "jason@example.com",
    "phone": "123-456-7890"
  }
}`,
  formatter: `{"name":"Jason","profession":"JSON Enthusiast","age":25,"skills":["JavaScript","TypeScript","React"],"contact":{"email":"jason@example.com","phone":"123-456-7890"}}`,
  converter: `{
  "products": [
    {
      "id": 1,
      "name": "Widget A",
      "price": 10.99,
      "inStock": true
    },
    {
      "id": 2,
      "name": "Gadget B",
      "price": 24.99,
      "inStock": false
    }
  ]
}`,
  generator: `{
  "type": "person",
  "count": 3
}`,
  diff: `// JSON A
{
  "name": "Jason",
  "age": 25,
  "hobbies": ["coding", "gaming"]
}

// JSON B
{
  "name": "Jason",
  "age": 26,
  "hobbies": ["coding", "hiking"],
  "location": "San Francisco"
}`
};

const JsonInput: React.FC = () => {
  const { jsonInput, setJsonInput, currentTool, history } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  // Update input when tool changes
  useEffect(() => {
    if (!jsonInput) {
      setJsonInput(SAMPLE_DATA[currentTool]);
    }
  }, [currentTool, jsonInput, setJsonInput]);

  const loadSampleData = () => {
    setJsonInput(SAMPLE_DATA[currentTool]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setJsonInput(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadFromHistory = (input: string) => {
    setJsonInput(input);
    setShowHistory(false);
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Input JSON</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-sm btn-secondary flex items-center gap-1"
            onClick={loadSampleData}
          >
            <RotateCw size={14} />
            <span className="hidden md:inline">Sample</span>
          </motion.button>
          
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-sm btn-primary flex items-center gap-1 cursor-pointer"
          >
            <Upload size={14} />
            <span className="hidden md:inline">Upload</span>
            <input
              type="file"
              accept=".json,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </motion.label>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-sm btn-secondary flex items-center gap-1 relative"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={14} />
            <span className="hidden md:inline">History</span>
            {showHistory && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-10 p-2">
                <div className="text-sm font-medium p-2 border-b">Recent JSON Inputs</div>
                {history.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No history yet</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer text-xs border-b"
                        onClick={() => loadFromHistory(item.input)}
                      >
                        <div className="font-medium mb-1 flex justify-between">
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                          <span className="bg-primary-100 text-primary-800 px-1 rounded text-xs">
                            {item.tool}
                          </span>
                        </div>
                        <div className="truncate">{item.input.substring(0, 100)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.button>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <textarea
          value={jsonInput}
          onChange={handleInputChange}
          className="w-full h-64 md:h-full p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Paste your JSON here..."
        />
      </div>
    </div>
  );
};

export default JsonInput;