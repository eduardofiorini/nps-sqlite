import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Source, 
  Situation, 
  Group 
} from '../types';
import {
  getSources,
  saveSource,
  deleteSource,
  getSituations,
  saveSituation,
  deleteSituation,
  getGroups,
  saveGroup,
  deleteGroup,
} from '../utils/supabaseStorage';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Plus, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface EntityCrudProps {
  entityType: 'sources' | 'situations' | 'groups';
}

const EntityCrud: React.FC<EntityCrudProps> = ({ entityType }) => {
  const [entities, setEntities] = useState<(Source | Situation | Group)[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<Partial<Source | Situation | Group>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useLanguage();
  
  // Get entity name for display
  const getEntityName = () => {
    switch (entityType) {
      case 'sources':
        return t('settings.sources');
      case 'situations':
        return t('settings.situations');
      case 'groups':
        return t('settings.groups');
      default:
        return '';
    }
  };
  
  // Get entity description
  const getEntityDescription = () => {
    switch (entityType) {
      case 'sources':
        return t('settings.sourcesDesc');
      case 'situations':
        return t('settings.situationsDesc');
      case 'groups':
        return t('settings.groupsDesc');
      default:
        return '';
    }
  };
  
  const loadEntities = async () => {
    try {
      let loadedEntities;
      
      switch (entityType) {
        case 'sources':
          loadedEntities = await getSources();
          break;
        case 'situations':
          loadedEntities = await getSituations();
          break;
        case 'groups':
          loadedEntities = await getGroups();
          break;
        default:
          loadedEntities = [];
      }
      
      setEntities(loadedEntities);
    } catch (error) {
      console.error('Error loading entities:', error);
    }
    
    setEntities(loadedEntities);
  };
  
  useEffect(() => {
    loadEntities();
  }, [entityType]);
  
  const handleSave = async () => {
    if (!currentEntity.name) {
      alert('Name is required');
      return;
    }
    
    try {
      switch (entityType) {
        case 'sources':
          await saveSource(currentEntity as Source);
          break;
        case 'situations':
          await saveSituation(currentEntity as Situation);
          break;
        case 'groups':
          await saveGroup(currentEntity as Group);
          break;
        default:
          return;
      }
      
      await loadEntities();
      setModalOpen(false);
      setCurrentEntity({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving entity:', error);
      alert('Error saving. Please try again.');
    }
    
    loadEntities();
    setModalOpen(false);
    setCurrentEntity({});
    setIsEditing(false);
  };
  
  const handleEdit = (entity: Source | Situation | Group) => {
    setCurrentEntity(entity);
    setIsEditing(true);
    setModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        switch (entityType) {
          case 'sources':
            await deleteSource(id);
            break;
          case 'situations':
            await deleteSituation(id);
            break;
          case 'groups':
            await deleteGroup(id);
            break;
          default:
            return;
        }
        
        await loadEntities();
      } catch (error) {
        console.error('Error deleting entity:', error);
        alert('Error deleting. Please try again.');
      }
    }
  };
  
  const handleOpenModal = () => {
    setCurrentEntity({});
    setIsEditing(false);
    setModalOpen(true);
  };
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/settings">
          <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
            {t('common.back')}
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getEntityName()}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{getEntityDescription()}</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenModal}>
          {t('common.add')} {getEntityName().slice(0, -1)}
        </Button>
      </div>
      
      <Card>
        <CardHeader title={`${getEntityName()} List`} />
        <CardContent>
          {entities.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4 w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No {getEntityName()} Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1 mb-4">
                Click the button above to add your first {getEntityName().toLowerCase().slice(0, -1)}.
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-x-auto"
            >
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('common.name')}
                    </th>
                    {(entityType === 'sources' || entityType === 'situations') && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('common.color')}
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('common.description')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {entities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{entity.name}</div>
                      </td>
                      {(entityType === 'sources' || entityType === 'situations') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {'color' in entity && entity.color ? (
                            <div className="flex items-center">
                              <div 
                                className="w-6 h-6 rounded-full mr-2" 
                                style={{ backgroundColor: entity.color }}
                              ></div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{entity.color}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">No color</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {'description' in entity && entity.description ? entity.description : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(entity)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(entity.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${isEditing ? t('common.edit') : t('common.add')} ${getEntityName().slice(0, -1)}`}
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('common.name')}
            value={currentEntity.name || ''}
            onChange={(e) => setCurrentEntity({ ...currentEntity, name: e.target.value })}
            fullWidth
            required
          />
          
          {(entityType === 'sources' || entityType === 'situations') && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">{t('common.color')}</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={(currentEntity as Source | Situation).color || '#3B82F6'}
                  onChange={(e) => setCurrentEntity({ ...currentEntity, color: e.target.value })}
                  className="w-12 h-10 p-0 border-0 rounded"
                />
                <Input
                  value={(currentEntity as Source | Situation).color || '#3B82F6'}
                  onChange={(e) => setCurrentEntity({ ...currentEntity, color: e.target.value })}
                  className="ml-2"
                  placeholder="#HEX"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">{t('common.description')} ({t('common.optional')})</label>
            <textarea
              value={currentEntity.description || ''}
              onChange={(e) => setCurrentEntity({ ...currentEntity, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter a description"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EntityCrud;