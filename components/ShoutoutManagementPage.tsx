import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { helpSystemService, HelpShoutout } from '../services/helpSystemService';
import { useTour } from '../contexts/TourContext';
import { ShoutoutFeature } from '../contexts/ShoutoutContext';

interface ShoutoutManagementPageProps {
  onClose: () => void;
}

interface ShoutoutFormData {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
  tourId?: string;
  category: 'feature' | 'improvement' | 'announcement' | 'bugfix';
  priority: 'low' | 'medium' | 'high';
  language: 'en' | 'sv';
  releaseDate: string;
  expireDate?: string;
  isNew: boolean;
}

export const ShoutoutManagementPage: React.FC<ShoutoutManagementPageProps> = ({ onClose }) => {
  const { t } = useTranslations();
  
  // Optional tour integration - handle cases where TourProvider might not be available
  let tourContext = null;
  try {
    tourContext = useTour();
  } catch (error) {
    // TourProvider not available, continue without tour functionality
    console.warn('TourProvider not available, shoutout management will work without tour integration');
  }
  const [shoutouts, setShoutouts] = useState<ShoutoutFeature[]>([]);
  const [selectedShoutout, setSelectedShoutout] = useState<ShoutoutFeature | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [formData, setFormData] = useState<ShoutoutFormData>({
    id: '',
    title: '',
    description: '',
    image: '',
    icon: '',
    tourId: '',
    category: 'feature',
    priority: 'medium',
    language: 'en',
    releaseDate: new Date().toISOString().split('T')[0],
    expireDate: undefined,
    isNew: true
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importData, setImportData] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'sv'>('all');

  // Filter shoutouts based on selected language
  const filteredShoutouts = useMemo(() => {
    if (languageFilter === 'all') {
      return shoutouts;
    }
    return shoutouts.filter(shoutout => shoutout.language === languageFilter);
  }, [shoutouts, languageFilter]);

  // Check if a shoutout is a default one (not admin-created)
  const isDefaultShoutout = useCallback((shoutoutId: string): boolean => {
    const defaultIds = ['tour-system', 'admin-tours', 'cinematic-tours', 'performance-improvements', 'attendance-page-fix'];
    return defaultIds.includes(shoutoutId);
  }, []);

  const loadShoutouts = useCallback(async () => {
    try {
      // Get shoutouts from database for all languages (admin view)
      const [enShoutouts, svShoutouts] = await Promise.all([
        helpSystemService.getShoutouts('en'),
        helpSystemService.getShoutouts('sv')
      ]);
      
      // Combine all shoutouts
      const allShoutouts = [...enShoutouts, ...svShoutouts];
      
      // Convert database format to ShoutoutFeature format
      const shoutouts: ShoutoutFeature[] = allShoutouts.map(dbShoutout => ({
        id: dbShoutout.id,
        title: dbShoutout.title,
        description: dbShoutout.description,
        image: dbShoutout.image,
        icon: dbShoutout.icon,
        tourId: dbShoutout.tour_id,
        category: dbShoutout.category,
        priority: dbShoutout.priority,
        language: dbShoutout.language,
        releaseDate: dbShoutout.release_date,
        expireDate: dbShoutout.expire_date,
        isNew: dbShoutout.is_new,
      }));
      
      setShoutouts(shoutouts);
    } catch (error) {
      console.error('Error loading shoutouts:', error);
      setShoutouts([]);
    }
  }, []);

  // Load shoutouts on mount
  useEffect(() => {
    const loadData = async () => {
      await loadShoutouts();
    };
    loadData();
  }, [loadShoutouts]);

  // Handle Esc key to close management page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCreateShoutout = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedShoutout(null);
    setFormData({
      id: '',
      title: '',
      description: '',
      image: '',
      icon: '',
      tourId: '',
      category: 'feature',
      priority: 'medium',
      releaseDate: new Date().toISOString().split('T')[0],
      expireDate: undefined,
      isNew: true
    });
    setValidationErrors([]);
  };

  const handleEditShoutout = (shoutout: ShoutoutFeature) => {
    setSelectedShoutout(shoutout);
    setIsEditing(true);
    setIsCreating(false);
    setFormData({
      id: shoutout.id,
      title: shoutout.title,
      description: shoutout.description,
      image: shoutout.image || '',
      icon: shoutout.icon || '',
      tourId: shoutout.tourId || '',
      category: shoutout.category,
      priority: shoutout.priority,
      language: shoutout.language || 'en',
      releaseDate: shoutout.releaseDate,
      expireDate: shoutout.expireDate,
      isNew: shoutout.isNew || false
    });
    setValidationErrors([]);
  };

  const handleDuplicateShoutout = async (shoutout: ShoutoutFeature) => {
    try {
      // Create a duplicate with a new title
      const duplicateData: Omit<HelpShoutout, 'id' | 'created_at' | 'updated_at'> = {
        title: `${shoutout.title} (Copy)`,
        description: shoutout.description,
        image: shoutout.image,
        icon: shoutout.icon,
        tour_id: shoutout.tourId,
        category: shoutout.category,
        priority: shoutout.priority,
        language: shoutout.language || 'en',
        release_date: new Date().toISOString().split('T')[0],
        expire_date: shoutout.expireDate,
        is_new: true,
        is_active: true,
        created_by: 'admin',
        updated_by: 'admin'
      };
      
      const result = await helpSystemService.createShoutout(duplicateData);
      if (result) {
        await loadShoutouts();
      }
    } catch (error) {
      console.error('Error duplicating shoutout:', error);
      alert('Failed to duplicate shoutout. Please try again.');
    }
  };

  const handleDeleteShoutout = async (shoutout: ShoutoutFeature) => {
    if (window.confirm(t('shoutoutAdminConfirmDelete'))) {
      try {
        const success = await helpSystemService.deleteShoutout(shoutout.id);
        if (success) {
          await loadShoutouts();
          if (selectedShoutout?.id === shoutout.id) {
            setSelectedShoutout(null);
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error('Error deleting shoutout:', error);
        alert('Failed to delete shoutout. Please try again.');
      }
    }
  };

  const handleSaveShoutout = async () => {
    console.log('Saving shoutout with data:', formData);
    
    // Basic validation
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.priority) errors.push('Priority is required');
    if (!formData.releaseDate) errors.push('Release date is required');
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (isCreating) {
        console.log('Creating new shoutout');
        const createData: Omit<HelpShoutout, 'id' | 'created_at' | 'updated_at'> = {
          title: formData.title,
          description: formData.description,
          image: formData.image,
          icon: formData.icon,
          tour_id: formData.tourId,
          category: formData.category,
          priority: formData.priority,
          language: formData.language,
          release_date: formData.releaseDate,
          expire_date: formData.expireDate,
          is_new: formData.isNew,
          is_active: true,
          created_by: 'admin',
          updated_by: 'admin'
        };
        const result = await helpSystemService.createShoutout(createData);
        console.log('Created shoutout:', result);
      } else if (selectedShoutout) {
        console.log('Updating existing shoutout:', selectedShoutout.id);
        const updateData: Partial<HelpShoutout> = {
          title: formData.title,
          description: formData.description,
          image: formData.image,
          icon: formData.icon,
          tour_id: formData.tourId,
          category: formData.category,
          priority: formData.priority,
          language: formData.language,
          release_date: formData.releaseDate,
          expire_date: formData.expireDate,
          is_new: formData.isNew,
          updated_by: 'admin'
        };
        const result = await helpSystemService.updateShoutout(selectedShoutout.id, updateData);
        console.log('Updated shoutout:', result);
      }

      await loadShoutouts();
      setIsCreating(false);
      setIsEditing(false);
      setSelectedShoutout(null);
      setValidationErrors([]);
      console.log('Shoutout saved successfully');
    } catch (error) {
      console.error('Error saving shoutout:', error);
      setValidationErrors(['Failed to save shoutout. Please try again.']);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedShoutout(null);
    setValidationErrors([]);
  };

  const handleExport = async () => {
    try {
      // Get all shoutouts from database
      const [enShoutouts, svShoutouts] = await Promise.all([
        helpSystemService.getShoutouts('en'),
        helpSystemService.getShoutouts('sv')
      ]);
      
      const allShoutouts = [...enShoutouts, ...svShoutouts];
      const data = JSON.stringify(allShoutouts, null, 2);
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shoutouts.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting shoutouts:', error);
      alert('Failed to export shoutouts. Please try again.');
    }
  };

  const handleImport = async () => {
    try {
      const importShoutouts = JSON.parse(importData);
      
      if (!Array.isArray(importShoutouts)) {
        alert('Invalid import data. Expected an array of shoutouts.');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const shoutout of importShoutouts) {
        try {
          // Convert imported data to the correct format
          const importData: Omit<HelpShoutout, 'id' | 'created_at' | 'updated_at'> = {
            title: shoutout.title || 'Imported Shoutout',
            description: shoutout.description || '',
            image: shoutout.image,
            icon: shoutout.icon,
            tour_id: shoutout.tour_id,
            category: shoutout.category || 'feature',
            priority: shoutout.priority || 'medium',
            language: shoutout.language || 'en',
            release_date: shoutout.release_date || new Date().toISOString().split('T')[0],
            expire_date: shoutout.expire_date,
            is_new: shoutout.is_new !== undefined ? shoutout.is_new : true,
            is_active: shoutout.is_active !== undefined ? shoutout.is_active : true,
            created_by: 'admin',
            updated_by: 'admin'
          };
          
          await helpSystemService.createShoutout(importData);
          successCount++;
        } catch (error) {
          console.error('Error importing shoutout:', error);
          errorCount++;
        }
      }
      
      await loadShoutouts();
      setImportData('');
      setShowImportExport(false);
      
      if (errorCount > 0) {
        alert(`Import completed with ${successCount} successful imports and ${errorCount} errors.`);
      } else {
        alert(`Successfully imported ${successCount} shoutouts.`);
      }
    } catch (error) {
      console.error('Error parsing import data:', error);
      alert('Invalid JSON format. Please check your import data.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableTours = tourContext ? tourContext.getAvailableTours() : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('shoutoutAdminTitle')}</h2>
            <p className="text-gray-600 mt-1">{t('shoutoutAdminSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Shoutouts List */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('shoutoutAdminShoutoutsList')}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowImportExport(!showImportExport)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
                  >
                    {t('shoutoutAdminImportExport')}
                  </button>
                  <button
                    onClick={handleCreateShoutout}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    {t('shoutoutAdminCreateShoutout')}
                  </button>
                </div>
              </div>
              
              {/* Language Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shoutoutAdminFilterByLanguage')}
                </label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value as 'all' | 'en' | 'sv')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('shoutoutAdminAllLanguages')}</option>
                  <option value="en">{t('shoutoutAdminEnglish')}</option>
                  <option value="sv">{t('shoutoutAdminSwedish')}</option>
                </select>
              </div>

              {/* Import/Export Panel */}
              {showImportExport && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="space-y-3">
                    <div>
                      <button
                        onClick={handleExport}
                        className="w-full px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                      >
                        {t('shoutoutAdminExport')}
                      </button>
                    </div>
                    <div>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder={t('shoutoutAdminImportPlaceholder')}
                        className="w-full h-20 p-2 text-sm border border-gray-300 rounded-md resize-none"
                      />
                      <button
                        onClick={handleImport}
                        className="w-full mt-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                      >
                        {t('shoutoutAdminImport')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="font-semibold text-blue-900">{filteredShoutouts.length}</div>
                  <div className="text-blue-600">{t('shoutoutAdminTotalShoutouts')}</div>
                </div>
                <div className="bg-green-50 p-2 rounded text-center">
                  <div className="font-semibold text-green-900">
                    {filteredShoutouts.filter(s => s.isNew).length}
                  </div>
                  <div className="text-green-600">{t('shoutoutAdminNewShoutouts')}</div>
                </div>
                <div className="bg-purple-50 p-2 rounded text-center">
                  <div className="font-semibold text-purple-900">
                    {filteredShoutouts.filter(s => s.tourId).length}
                  </div>
                  <div className="text-purple-600">{t('shoutoutAdminWithTours')}</div>
                </div>
              </div>
            </div>

            {/* Shoutouts List */}
            <div className="flex-1 overflow-y-auto">
              {filteredShoutouts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-4">🎁</div>
                  <div className="text-lg font-medium mb-2">{t('shoutoutAdminNoShoutouts')}</div>
                  <div className="text-sm mb-4">{t('shoutoutAdminCreateFirstShoutout')}</div>
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    <strong>{t('shoutoutAdminSystemNote')}:</strong> {t('shoutoutAdminSystemNoteTextUpdated')}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredShoutouts.map((shoutout) => (
                    <div
                      key={shoutout.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedShoutout?.id === shoutout.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedShoutout(shoutout)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{shoutout.icon}</span>
                            <h4 className="font-medium text-gray-900">{shoutout.title}</h4>
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {shoutout.language?.toUpperCase() || 'EN'}
                            </span>
                            {isDefaultShoutout(shoutout.id) && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {t('shoutoutAdminDefault')}
                              </span>
                            )}
                            {shoutout.isNew && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                {t('shoutoutAdminNewShoutouts')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {shoutout.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(shoutout.category)}`}>
                              {t(`shoutoutCategory${shoutout.category.charAt(0).toUpperCase() + shoutout.category.slice(1)}`)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(shoutout.priority)}`}>
                              {shoutout.priority}
                            </span>
                            {shoutout.tourId && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {t('shoutoutHasTour')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditShoutout(shoutout);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            title={t('shoutoutAdminEdit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateShoutout(shoutout);
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                            title={t('shoutoutAdminDuplicate')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteShoutout(shoutout);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            title={t('shoutoutAdminDelete')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-1/2 flex flex-col">
            {!isEditing && !isCreating ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <div className="text-lg font-medium mb-2">{t('shoutoutAdminSelectShoutoutToEdit')}</div>
                  <div className="text-sm">{t('shoutoutAdminSelectShoutoutDescription')}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {isCreating ? t('shoutoutAdminCreateShoutout') : t('shoutoutAdminEditShoutout')}
                  </h3>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-sm text-red-800">
                        <div className="font-medium mb-1">{t('shoutoutAdminValidationErrors')}:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('shoutoutAdminShoutoutTitle')}
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('shoutoutAdminShoutoutTitlePlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('shoutoutAdminShoutoutDescription')}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('shoutoutAdminShoutoutDescriptionPlaceholder')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('shoutoutAdminIcon')}
                        </label>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="🎯"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('shoutoutAdminCategory')}
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="feature">{t('shoutoutCategoryFeature')}</option>
                          <option value="improvement">{t('shoutoutCategoryImprovement')}</option>
                          <option value="announcement">{t('shoutoutCategoryAnnouncement')}</option>
                          <option value="bugfix">{t('shoutoutCategoryBugfix')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('shoutoutAdminLanguage')}
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'sv' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="en">{t('shoutoutAdminEnglish')}</option>
                          <option value="sv">{t('shoutoutAdminSwedish')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('shoutoutAdminPriority')}
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">{t('shoutoutAdminPriorityLow')}</option>
                          <option value="medium">{t('shoutoutAdminPriorityMedium')}</option>
                          <option value="high">{t('shoutoutAdminPriorityHigh')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('shoutoutAdminReleaseDate')}
                        </label>
                        <input
                          type="date"
                          value={formData.releaseDate}
                          onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('shoutoutAdminExpireDate')}
                        </label>
                        <input
                          type="date"
                          value={formData.expireDate || ''}
                          onChange={(e) => setFormData({ ...formData, expireDate: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={t('shoutoutAdminExpireDatePlaceholder')}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {t('shoutoutAdminExpireDateHelp')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('shoutoutAdminTourId')}
                      </label>
                      <select
                        value={formData.tourId}
                        onChange={(e) => setFormData({ ...formData, tourId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">{t('shoutoutAdminNoTour')}</option>
                        {availableTours.map((tour) => (
                          <option key={tour.id} value={tour.id}>
                            {tour.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNew"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isNew" className="ml-2 block text-sm text-gray-700">
                        {t('shoutoutAdminIsNew')}
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleSaveShoutout}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      {isCreating ? t('shoutoutAdminCreate') : t('shoutoutAdminSave')}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      {t('shoutoutAdminCancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoutoutManagementPage;
