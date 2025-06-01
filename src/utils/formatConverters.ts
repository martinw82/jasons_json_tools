import yaml from 'js-yaml';
import TOML from '@iarna/toml';
import Papa from 'papaparse';

export const jsonToYaml = (json: string): string => {
  try {
    const obj = JSON.parse(json);
    return yaml.dump(obj);
  } catch (e) {
    throw new Error(`Invalid JSON: ${(e as Error).message}`);
  }
};

export const jsonToToml = (json: string): string => {
  try {
    const obj = JSON.parse(json);
    return TOML.stringify(obj);
  } catch (e) {
    if ((e as Error).message.includes('TOML')) {
      throw new Error('Failed to convert to TOML. Some complex objects may not be compatible with TOML format.');
    }
    throw new Error(`Invalid JSON: ${(e as Error).message}`);
  }
};

export const jsonToCsv = (json: string, options: { includeHeader?: boolean; delimiter?: string } = {}): string => {
  try {
    const obj = JSON.parse(json);
    
    if (!Array.isArray(obj)) {
      // If the object is not an array, wrap it in an array
      return Papa.unparse([obj], {
        header: options.includeHeader !== false,
        delimiter: options.delimiter || ','
      });
    }
    
    return Papa.unparse(obj, {
      header: options.includeHeader !== false,
      delimiter: options.delimiter || ','
    });
  } catch (e) {
    if ((e as Error).message.includes('JSON')) {
      throw new Error(`Invalid JSON: ${(e as Error).message}`);
    }
    throw new Error('Failed to convert to CSV. CSV format works best with arrays of flat objects.');
  }
};

export const yamlToJson = (yamlStr: string): string => {
  try {
    const obj = yaml.load(yamlStr);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    throw new Error(`Invalid YAML: ${(e as Error).message}`);
  }
};

export const tomlToJson = (tomlStr: string): string => {
  try {
    const obj = TOML.parse(tomlStr);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    throw new Error(`Invalid TOML: ${(e as Error).message}`);
  }
};

export const csvToJson = (csvStr: string, options: { header?: boolean; delimiter?: string } = {}): string => {
  try {
    const result = Papa.parse(csvStr, {
      header: options.header !== false,
      delimiter: options.delimiter || ',',
      skipEmptyLines: true
    });
    
    return JSON.stringify(result.data, null, 2);
  } catch (e) {
    throw new Error(`Invalid CSV: ${(e as Error).message}`);
  }
};