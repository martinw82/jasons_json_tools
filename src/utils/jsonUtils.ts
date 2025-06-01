export const isValidJson = (json: string): boolean => {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
};

export const formatJson = (json: string, indent: number = 2, sortKeys: boolean = false): string => {
  try {
    let parsed = JSON.parse(json);
    if (sortKeys) {
      parsed = sortObjectKeys(parsed);
    }
    return JSON.stringify(parsed, null, indent);
  } catch (e) {
    throw new Error(`Invalid JSON: ${(e as Error).message}`);
  }
};

export const minifyJson = (json: string): string => {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch (e) {
    throw new Error(`Invalid JSON: ${(e as Error).message}`);
  }
};

export const sortObjectKeys = (obj: any): any => {
  // If not an object or is null, return as is
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  // Create a new object with sorted keys
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {} as Record<string, any>);
};

export const getJsonErrorDetails = (e: Error, json: string): { message: string; position?: number } => {
  const errorMessage = e.message;
  
  // Extract position from error message if available
  const positionMatch = errorMessage.match(/position\s+(\d+)/i);
  const position = positionMatch ? parseInt(positionMatch[1], 10) : undefined;
  
  return {
    message: errorMessage,
    position
  };
};

export const highlightJsonErrorPosition = (json: string, position?: number): string => {
  if (position === undefined) return json;
  
  // Split the json into before error, error character, and after error
  const before = json.substring(0, position);
  const errorChar = json.substring(position, position + 1);
  const after = json.substring(position + 1);
  
  return `${before}<span class="bg-red-200 text-red-800 font-bold">${errorChar}</span>${after}`;
};