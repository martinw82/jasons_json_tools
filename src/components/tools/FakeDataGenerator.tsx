import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'framer-motion';
import { Copy, Download, RefreshCcw, Plus, Trash2 } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { GeneratorOptions } from '../../types';
import { faker } from '@faker-js/faker';

const FakeDataGenerator: React.FC = () => {
  const { jsonInput, addToHistory, showToast } = useApp();
  const [options, setOptions] = useState<GeneratorOptions>({
    type: 'person',
    count: 5,
    schema: undefined
  });
  const [generated, setGenerated] = useState<string>('');
  const [customSchema, setCustomSchema] = useState<string>('');
  const [customFields, setCustomFields] = useState<{ name: string; type: string }[]>([]);
  
  useEffect(() => {
    if (options.type !== 'custom') {
      generateData();
    }
  }, [options.type, options.count]);
  
  useEffect(() => {
    try {
      if (jsonInput && options.type === 'custom') {
        const parsed = JSON.parse(jsonInput);
        if (typeof parsed === 'object') {
          setOptions({ ...options, schema: parsed });
        }
      }
    } catch (error) {
      console.error('Error parsing JSON input for schema', error);
    }
  }, [jsonInput]);
  
  const generateData = () => {
    try {
      let result: any[] = [];
      
      for (let i = 0; i < options.count; i++) {
        let item: Record<string, any> = {};
        
        switch (options.type) {
          case 'person':
            item = {
              id: faker.string.uuid(),
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              email: faker.internet.email(),
              phone: faker.phone.number(),
              avatar: faker.image.avatar(),
              address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country()
              },
              jobTitle: faker.person.jobTitle(),
              department: faker.person.jobArea()
            };
            break;
            
          case 'product':
            item = {
              id: faker.string.uuid(),
              name: faker.commerce.productName(),
              price: parseFloat(faker.commerce.price()),
              description: faker.commerce.productDescription(),
              category: faker.commerce.department(),
              image: faker.image.url(),
              inStock: faker.datatype.boolean(),
              attributes: {
                color: faker.color.human(),
                weight: `${faker.number.float({ min: 0.1, max: 10, precision: 0.1 })} kg`,
                material: faker.commerce.productMaterial()
              },
              reviews: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
                id: faker.string.uuid(),
                rating: faker.number.int({ min: 1, max: 5 }),
                comment: faker.lorem.sentence(),
                user: faker.person.fullName()
              }))
            };
            break;
            
          case 'address':
            item = {
              id: faker.string.uuid(),
              street: faker.location.streetAddress(),
              city: faker.location.city(),
              state: faker.location.state(),
              zipCode: faker.location.zipCode(),
              country: faker.location.country(),
              latitude: parseFloat(faker.location.latitude()),
              longitude: parseFloat(faker.location.longitude()),
              timeZone: faker.location.timeZone(),
              countryCode: faker.location.countryCode()
            };
            break;
            
          case 'company':
            item = {
              id: faker.string.uuid(),
              name: faker.company.name(),
              slogan: faker.company.catchPhrase(),
              description: faker.company.buzzPhrase(),
              industry: faker.company.buzzNoun(),
              website: faker.internet.url(),
              logo: faker.image.url(),
              employees: faker.number.int({ min: 5, max: 5000 }),
              founded: faker.date.past({ years: 30 }).getFullYear(),
              address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country()
              },
              contact: {
                email: faker.internet.email(),
                phone: faker.phone.number()
              }
            };
            break;
            
          case 'custom':
            if (options.schema && typeof options.schema === 'object') {
              item = generateFromSchema(options.schema);
            } else if (customFields.length > 0) {
              customFields.forEach(field => {
                item[field.name] = generateValueByType(field.type);
              });
            }
            break;
        }
        
        result.push(item);
      }
      
      // If only one item is requested, don't wrap in array
      const outputData = options.count === 1 ? result[0] : result;
      const output = JSON.stringify(outputData, null, 2);
      
      setGenerated(output);
      addToHistory('', output, 'generator');
      
    } catch (error) {
      showToast(`Error generating data: ${(error as Error).message}`, 'error');
    }
  };
  
  const generateFromSchema = (schema: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    
    Object.entries(schema).forEach(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        result[key] = generateFromSchema(value);
      } else if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        const fakerPath = value.slice(2, -2).trim();
        result[key] = evaluateFakerPath(fakerPath);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          result[key] = [];
        } else {
          const template = value[0];
          const count = faker.number.int({ min: 1, max: 5 });
          result[key] = Array.from({ length: count }, () => {
            if (typeof template === 'object') {
              return generateFromSchema(template);
            } else if (typeof template === 'string' && template.startsWith('{{') && template.endsWith('}}')) {
              const fakerPath = template.slice(2, -2).trim();
              return evaluateFakerPath(fakerPath);
            }
            return template;
          });
        }
      } else {
        result[key] = value;
      }
    });
    
    return result;
  };
  
  const evaluateFakerPath = (path: string): any => {
    const parts = path.split('.');
    let result: any = faker;
    
    for (const part of parts) {
      if (result[part]) {
        result = result[part];
      } else {
        return `{{${path}}}`;
      }
    }
    
    return typeof result === 'function' ? result() : result;
  };
  
  const generateValueByType = (type: string): any => {
    switch (type) {
      case 'name': return faker.person.fullName();
      case 'firstName': return faker.person.firstName();
      case 'lastName': return faker.person.lastName();
      case 'email': return faker.internet.email();
      case 'phone': return faker.phone.number();
      case 'address': return faker.location.streetAddress();
      case 'city': return faker.location.city();
      case 'country': return faker.location.country();
      case 'company': return faker.company.name();
      case 'jobTitle': return faker.person.jobTitle();
      case 'uuid': return faker.string.uuid();
      case 'number': return faker.number.int({ min: 1, max: 1000 });
      case 'price': return parseFloat(faker.commerce.price());
      case 'product': return faker.commerce.productName();
      case 'sentence': return faker.lorem.sentence();
      case 'paragraph': return faker.lorem.paragraph();
      case 'date': return faker.date.recent().toISOString();
      case 'boolean': return faker.datatype.boolean();
      case 'imageUrl': return faker.image.url();
      default: return faker.lorem.word();
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated);
    showToast('Copied to clipboard!', 'success');
  };
  
  const downloadJson = () => {
    const blob = new Blob([generated], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON file downloaded!', 'success');
  };
  
  const addCustomField = () => {
    setCustomFields([...customFields, { name: '', type: 'string' }]);
  };
  
  const updateCustomField = (index: number, field: { name: string; type: string }) => {
    const newFields = [...customFields];
    newFields[index] = field;
    setCustomFields(newFields);
  };
  
  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Data Type:
          </label>
          <select
            id="type"
            className="input"
            value={options.type}
            onChange={(e) => setOptions({ ...options, type: e.target.value as any })}
          >
            <option value="person">Person</option>
            <option value="product">Product</option>
            <option value="address">Address</option>
            <option value="company">Company</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Items:
          </label>
          <input
            id="count"
            type="number"
            min="1"
            max="100"
            className="input"
            value={options.count}
            onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) || 1 })}
          />
        </div>
        
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-1 h-9"
            onClick={generateData}
          >
            <RefreshCcw size={16} />
            <span>Generate</span>
          </motion.button>
        </div>
      </div>
      
      {options.type === 'custom' && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium">Custom Fields</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-sm btn-secondary flex items-center gap-1"
              onClick={addCustomField}
            >
              <Plus size={14} />
              <span>Add Field</span>
            </motion.button>
          </div>
          
          {customFields.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Add custom fields or paste a JSON schema in the input area
            </div>
          ) : (
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Field name"
                    className="input flex-1"
                    value={field.name}
                    onChange={(e) => updateCustomField(index, { ...field, name: e.target.value })}
                  />
                  <select
                    className="input w-1/3"
                    value={field.type}
                    onChange={(e) => updateCustomField(index, { ...field, type: e.target.value })}
                  >
                    <option value="name">Full Name</option>
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="city">City</option>
                    <option value="country">Country</option>
                    <option value="company">Company</option>
                    <option value="jobTitle">Job Title</option>
                    <option value="uuid">UUID</option>
                    <option value="number">Number</option>
                    <option value="price">Price</option>
                    <option value="product">Product</option>
                    <option value="sentence">Sentence</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="imageUrl">Image URL</option>
                  </select>
                  <button
                    onClick={() => removeCustomField(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="relative flex-grow">
        {generated && (
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
            {generated || '// Generated JSON will appear here'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default FakeDataGenerator;