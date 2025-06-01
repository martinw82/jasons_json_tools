export type ToolType = 
  | 'validator' 
  | 'formatter' 
  | 'converter' 
  | 'generator' 
  | 'diff';

export interface ToolOption {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
}

export interface FormatterOptions {
  indent: number;
  sortKeys: boolean;
}

export interface ConverterOptions {
  format: 'json' | 'csv' | 'yaml' | 'toml';
  includeHeader?: boolean;
  delimiter?: string;
}

export interface GeneratorOptions {
  type: 'person' | 'product' | 'address' | 'company' | 'custom';
  count: number;
  schema?: Record<string, any>;
}

export interface DiffOptions {
  mode: 'diff' | 'merge';
  visualDiff: boolean;
}