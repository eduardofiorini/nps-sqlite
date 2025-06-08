import React, { useState } from 'react';
import { 
  FormField, 
  CampaignForm 
} from '../../types';
import Button from '../ui/Button';
import { 
  Plus, 
  X, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  GripVertical,
  Type,
  MessageSquare,
  CheckSquare,
  List
} from 'lucide-react';
import Input from '../ui/Input';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface FormBuilderProps {
  initialForm?: CampaignForm;
  campaignId: string;
  onSave: (form: CampaignForm) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  initialForm,
  campaignId,
  onSave,
}) => {
  const [fields, setFields] = useState<FormField[]>(
    initialForm?.fields?.sort((a, b) => a.order - b.order) || [
      {
        id: crypto.randomUUID(),
        type: 'nps',
        label: 'How likely are you to recommend our service to a friend or colleague?',
        required: true,
        order: 0,
      },
    ]
  );
  const [showFieldOptions, setShowFieldOptions] = useState(false);
  
  const handleAddField = (type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: getDefaultLabel(type),
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
      order: fields.length,
    };
    
    setFields([...fields, newField]);
    setShowFieldOptions(false);
  };
  
  const handleRemoveField = (id: string) => {
    const updatedFields = fields.filter(field => field.id !== id);
    // Reorder remaining fields
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index
    }));
    setFields(reorderedFields);
  };
  
  const handleFieldChange = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map(field => (field.id === id ? { ...field, ...updates } : field))
    );
  };
  
  const handleOptionAdd = (fieldId: string) => {
    setFields(
      fields.map(field => {
        if (field.id === fieldId && field.options) {
          return {
            ...field,
            options: [...field.options, `Option ${field.options.length + 1}`],
          };
        }
        return field;
      })
    );
  };
  
  const handleOptionChange = (fieldId: string, optionIndex: number, value: string) => {
    setFields(
      fields.map(field => {
        if (field.id === fieldId && field.options) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = value;
          return { ...field, options: newOptions };
        }
        return field;
      })
    );
  };
  
  const handleOptionRemove = (fieldId: string, optionIndex: number) => {
    setFields(
      fields.map(field => {
        if (field.id === fieldId && field.options) {
          return {
            ...field,
            options: field.options.filter((_, i) => i !== optionIndex),
          };
        }
        return field;
      })
    );
  };
  
  const handleSave = () => {
    // Ensure all fields have correct order before saving
    const fieldsWithCorrectOrder = fields.map((field, index) => ({
      ...field,
      order: index
    }));
    
    const form: CampaignForm = {
      id: initialForm?.id || crypto.randomUUID(),
      campaignId,
      fields: fieldsWithCorrectOrder,
    };
    
    onSave(form);
  };
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // Create a new array with the reordered fields
    const reorderedFields = Array.from(fields);
    const [movedField] = reorderedFields.splice(sourceIndex, 1);
    reorderedFields.splice(destinationIndex, 0, movedField);
    
    // Update order property for all fields to match their new positions
    const fieldsWithUpdatedOrder = reorderedFields.map((field, index) => ({
      ...field,
      order: index
    }));
    
    // Update the state with the new order
    setFields(fieldsWithUpdatedOrder);
  };
  
  const getDefaultLabel = (type: FormField['type']): string => {
    switch (type) {
      case 'nps':
        return 'How likely are you to recommend our service to a friend or colleague?';
      case 'text':
        return 'Please provide your feedback';
      case 'select':
        return 'Select an option';
      case 'radio':
        return 'Choose one option';
      default:
        return 'New Question';
    }
  };
  
  const getFieldIcon = (type: FormField['type']) => {
    switch (type) {
      case 'nps':
        return <BarChart3 size={16} />;
      case 'text':
        return <MessageSquare size={16} />;
      case 'select':
        return <List size={16} />;
      case 'radio':
        return <CheckSquare size={16} />;
      default:
        return <Type size={16} />;
    }
  };

  const getFieldTypeName = (type: FormField['type']): string => {
    switch (type) {
      case 'nps':
        return 'NPS Question';
      case 'text':
        return 'Text Question';
      case 'select':
        return 'Dropdown';
      case 'radio':
        return 'Multiple Choice';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Form Builder</h2>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="form-fields">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-4 mb-6 min-h-[100px] ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2' : ''
              }`}
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border rounded-lg p-4 bg-white dark:bg-gray-700 shadow-sm transition-all duration-200 ${
                        snapshot.isDragging 
                          ? 'shadow-lg rotate-2 border-blue-300 dark:border-blue-600' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div 
                            {...provided.dragHandleProps} 
                            className="mr-3 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <GripVertical size={20} />
                          </div>
                          <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                            {getFieldIcon(field.type)}
                            <span className="ml-2">
                              {getFieldTypeName(field.type)}
                            </span>
                          </div>
                          <span className="ml-3 text-xs text-gray-400 dark:text-gray-500">
                            #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) =>
                                handleFieldChange(field.id, { required: e.target.checked })
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 mr-2"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Required</span>
                          </label>
                          
                          {fields.length > 1 && field.type !== 'nps' && (
                            <button
                              onClick={() => handleRemoveField(field.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Remove field"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Question Text
                        </label>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            handleFieldChange(field.id, { label: e.target.value })
                          }
                          placeholder="Enter your question"
                          fullWidth
                        />
                      </div>
                      
                      {(field.type === 'select' || field.type === 'radio') && field.options && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Options</h4>
                          <div className="space-y-2">
                            {field.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <div className="flex-1">
                                  <Input
                                    value={option}
                                    onChange={(e) =>
                                      handleOptionChange(field.id, optionIndex, e.target.value)
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                    fullWidth
                                  />
                                </div>
                                <button
                                  onClick={() => handleOptionRemove(field.id, optionIndex)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  disabled={field.options?.length === 1}
                                  title="Remove option"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<PlusCircle size={14} />}
                            onClick={() => handleOptionAdd(field.id)}
                            className="mt-3 text-sm"
                          >
                            Add Option
                          </Button>
                        </div>
                      )}
                      
                      {field.type === 'nps' && (
                        <div className="mt-4 bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Preview:</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">0</span>
                            <div className="flex-1 flex justify-between mx-4">
                              {Array.from({ length: 11 }, (_, i) => (
                                <div 
                                  key={i} 
                                  className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
                                >
                                  {i}
                                </div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">10</span>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Not likely at all</span>
                            <span>Extremely likely</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="my-6 relative">
        <Button 
          variant="outline" 
          icon={<Plus size={18} />}
          onClick={() => setShowFieldOptions(!showFieldOptions)}
          className="w-full justify-center"
        >
          Add Question
          <ChevronDown size={16} className={`ml-2 transition-transform ${showFieldOptions ? 'rotate-180' : ''}`} />
        </Button>
        
        {showFieldOptions && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
            <button
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
              onClick={() => handleAddField('text')}
            >
              <MessageSquare size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Text Question</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Open-ended text response</div>
              </div>
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
              onClick={() => handleAddField('select')}
            >
              <List size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Dropdown Selection</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Single choice from dropdown</div>
              </div>
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
              onClick={() => handleAddField('radio')}
            >
              <CheckSquare size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Multiple Choice</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Single choice with radio buttons</div>
              </div>
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="primary" onClick={handleSave} className="px-8">
          Save Form
        </Button>
      </div>
    </div>
  );
};

const BarChart3: React.FC<{ size: number }> = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

export default FormBuilder;