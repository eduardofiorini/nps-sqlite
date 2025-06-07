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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
    initialForm?.fields || [
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
    setFields(fields.filter(field => field.id !== id));
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
    const form: CampaignForm = {
      id: initialForm?.id || crypto.randomUUID(),
      campaignId,
      fields: fields.map((field, index) => ({ ...field, order: index })),
    };
    
    onSave(form);
  };
  
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFields(items.map((item, index) => ({ ...item, order: index })));
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Form Builder</h2>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4 mb-6"
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border rounded-md p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div {...provided.dragHandleProps} className="mr-2 cursor-grab text-gray-400 hover:text-gray-600">
                            <GripVertical size={20} />
                          </div>
                          <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {getFieldIcon(field.type)}
                            <span className="ml-1">
                              {field.type === 'nps' 
                                ? 'NPS Question' 
                                : field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="mr-2">
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  handleFieldChange(field.id, { required: e.target.checked })
                                }
                                className="mr-1"
                              />
                              Required
                            </label>
                          </div>
                          
                          {fields.length > 1 && field.type !== 'nps' && (
                            <button
                              onClick={() => handleRemoveField(field.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          handleFieldChange(field.id, { label: e.target.value })
                        }
                        placeholder="Question text"
                        fullWidth
                      />
                      
                      {(field.type === 'select' || field.type === 'radio') && field.options && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
                          <div className="space-y-2">
                            {field.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center">
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(field.id, optionIndex, e.target.value)
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="flex-1 mr-2"
                                />
                                <button
                                  onClick={() => handleOptionRemove(field.id, optionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                  disabled={field.options?.length === 1}
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<PlusCircle size={14} />}
                            onClick={() => handleOptionAdd(field.id)}
                            className="mt-2 text-sm"
                          >
                            Add Option
                          </Button>
                        </div>
                      )}
                      
                      {field.type === 'nps' && (
                        <div className="mt-4 bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500 mb-2">Preview:</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">0</span>
                            <div className="flex-1 flex justify-between mx-2">
                              {Array.from({ length: 11 }, (_, i) => (
                                <div 
                                  key={i} 
                                  className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-200 border border-gray-300"
                                >
                                  {i}
                                </div>
                              ))}
                            </div>
                            <span className="text-sm">10</span>
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
      
      <div className="my-4 relative">
        <Button 
          variant="outline" 
          icon={<Plus size={18} />}
          onClick={() => setShowFieldOptions(!showFieldOptions)}
          className="w-full"
        >
          Add Question
          <ChevronDown size={16} className="ml-2" />
        </Button>
        
        {showFieldOptions && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAddField('text')}
            >
              <MessageSquare size={16} className="mr-2" />
              Text Question
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAddField('select')}
            >
              <List size={16} className="mr-2" />
              Dropdown Selection
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAddField('radio')}
            >
              <CheckSquare size={16} className="mr-2" />
              Multiple Choice
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-8">
        <Button variant="primary" onClick={handleSave}>
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