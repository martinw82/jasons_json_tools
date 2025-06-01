import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToolType } from '../types';
import { toast } from 'react-toastify';

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  tool: ToolType;
  timestamp: number;
}

interface AppContextType {
  jsonInput: string;
  setJsonInput: (input: string) => void;
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  history: HistoryItem[];
  addToHistory: (input: string, output: string, tool: ToolType) => void;
  clearHistory: () => void;
  saveToLocalStorage: (key: string, data: any) => void;
  getFromLocalStorage: (key: string) => any;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [currentTool, setCurrentTool] = useState<ToolType>('validator');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('jsonToolboxHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history from localStorage', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jsonToolboxHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (input: string, output: string, tool: ToolType) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      input,
      output,
      tool,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  };

  const getFromLocalStorage = (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error getting from localStorage', e);
      return null;
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <AppContext.Provider
      value={{
        jsonInput,
        setJsonInput,
        currentTool,
        setCurrentTool,
        history,
        addToHistory,
        clearHistory,
        saveToLocalStorage,
        getFromLocalStorage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};