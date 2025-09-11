import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { tourManagementService, TourFormData, TourStepFormData } from '../services/tourManagementService';
import { Tour, TourStep, useTour } from '../contexts/TourContext';

interface TourManagementPageProps {
  onClose?: () => void;
}

const TourManagementPage: React.FC<TourManagementPageProps> = ({ onClose }) => {
  const { t } = useTranslations();
  
  // Make resilient to missing TourProvider
  let tourContext = null;
  try {
    tourContext = useTour();
  } catch (error) {
    console.warn('TourProvider not available, tour management will work without tour integration');
  }
  
  const { getAvailableTours } = tourContext || { getAvailableTours: () => [] };
  const [tours, setTours] = useState<Tour[]>([]);
  const [defaultTours, setDefaultTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(-1);
  const [formData, setFormData] = useState<TourFormData>({
    id: '',
    name: '',
    description: '',
    category: 'onboarding',
    requiredRole: 'any',
    estimatedDuration: 3,
    steps: []
  });
  const [stepFormData, setStepFormData] = useState<TourStepFormData>({
    id: '',
    target: '',
    title: '',
    content: '',
    position: 'top',
    action: undefined,
    actionTarget: '',
    waitTime: undefined,
    requiredView: '',
    skipIfNotFound: false
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showImportExport, setShowImportExport] = useState(false);
  const [importData, setImportData] = useState('');

  const loadTours = useCallback(() => {
    const allTours = getAvailableTours();
    const defaultToursList = allTours.filter(tour => 
      ['welcome-tour', 'admin-tour', 'attendance-tour', 'cinematic-demo', 'help-tour'].includes(tour.id)
    );
    setDefaultTours(defaultToursList);
    
    const allToursForManagement = tourManagementService.getAllToursForManagement(defaultToursList);
    setTours(allToursForManagement);
  }, [getAvailableTours]);

  // Load tours on component mount
  useEffect(() => {
    loadTours();
  }, [loadTours]);

  const handleCreateTour = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      category: 'onboarding',
      requiredRole: 'any',
      estimatedDuration: 3,
      steps: []
    });
    setSelectedTour(null);
    setIsCreating(true);
    setIsEditing(false);
    setValidationErrors([]);
  };

  const handleEditTour = (tour: Tour) => {
    setFormData({
      id: tour.id,
      name: tour.name,
      description: tour.description,
      category: tour.category || 'onboarding',
      requiredRole: tour.requiredRole || 'any',
      estimatedDuration: tour.estimatedDuration || 3,
      steps: tour.steps
    });
    setSelectedTour(tour);
    setIsEditing(true);
    setIsCreating(false);
    setValidationErrors([]);
  };

  const handleSaveTour = () => {
    const validation = tourManagementService.validateTour(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    let savedTour: Tour | null = null;
    
    if (isCreating) {
      savedTour = tourManagementService.createTour({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        requiredRole: formData.requiredRole,
        estimatedDuration: formData.estimatedDuration,
        steps: formData.steps
      });
    } else if (isEditing && selectedTour) {
      savedTour = tourManagementService.updateTour(selectedTour.id, formData);
    }

    if (savedTour) {
      loadTours();
      setIsCreating(false);
      setIsEditing(false);
      setSelectedTour(null);
      setValidationErrors([]);
    }
  };

  const handleDeleteTour = (tourId: string) => {
    if (window.confirm(t('tourAdminConfirmDelete'))) {
      if (tourManagementService.deleteTour(tourId)) {
        loadTours();
        if (selectedTour?.id === tourId) {
          setSelectedTour(null);
          setIsEditing(false);
        }
      }
    }
  };

  const handleDuplicateTour = (tour: Tour) => {
    const duplicated = tourManagementService.duplicateTour(tour.id);
    if (duplicated) {
      loadTours();
    }
  };

  const handleAddStep = () => {
    setStepFormData({
      id: '',
      target: '',
      title: '',
      content: '',
      position: 'top',
      action: undefined,
      actionTarget: '',
      waitTime: undefined,
      requiredView: '',
      skipIfNotFound: false
    });
    setEditingStepIndex(-1);
    setShowStepEditor(true);
  };

  const handleEditStep = (stepIndex: number) => {
    const step = formData.steps[stepIndex];
    setStepFormData({
      id: step.id,
      target: step.target,
      title: step.title,
      content: step.content,
      position: step.position || 'top',
      action: step.action,
      actionTarget: step.actionTarget || '',
      actionData: step.actionData,
      waitTime: step.waitTime,
      requiredView: step.requiredView || '',
      skipIfNotFound: step.skipIfNotFound || false
    });
    setEditingStepIndex(stepIndex);
    setShowStepEditor(true);
  };

  const handleSaveStep = () => {
    if (!stepFormData.title || !stepFormData.content || !stepFormData.target) {
      return;
    }

    const newStep: TourStep = {
      id: stepFormData.id || `step-${Date.now()}`,
      target: stepFormData.target,
      title: stepFormData.title,
      content: stepFormData.content,
      position: stepFormData.position,
      action: stepFormData.action,
      actionTarget: stepFormData.actionTarget,
      actionData: stepFormData.actionData,
      waitTime: stepFormData.waitTime,
      requiredView: stepFormData.requiredView,
      skipIfNotFound: stepFormData.skipIfNotFound
    };

    const updatedSteps = [...formData.steps];
    if (editingStepIndex >= 0) {
      updatedSteps[editingStepIndex] = newStep;
    } else {
      updatedSteps.push(newStep);
    }

    setFormData({ ...formData, steps: updatedSteps });
    setShowStepEditor(false);
    setEditingStepIndex(-1);
  };

  const handleDeleteStep = (stepIndex: number) => {
    const updatedSteps = formData.steps.filter((_, index) => index !== stepIndex);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...formData.steps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleExport = () => {
    const data = tourManagementService.exportTours();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tours-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (tourManagementService.importTours(importData)) {
      loadTours();
      setImportData('');
      setShowImportExport(false);
    }
  };

  const stats = tourManagementService.getTourStats();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t('tourAdminTitle')}</h1>
            <p className="text-slate-600 mt-2">{t('tourAdminSubtitle')}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {t('tourAdminClose')}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">{t('tourAdminTotalTours')}</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.totalTours}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">{t('tourAdminTotalSteps')}</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.totalSteps}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">{t('tourAdminAvgSteps')}</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.averageStepsPerTour.toFixed(1)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">{t('tourAdminCategories')}</h3>
            <p className="text-2xl font-bold text-slate-900">{Object.keys(stats.toursByCategory).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tours List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">{t('tourAdminToursList')}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowImportExport(true)}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    {t('tourAdminImportExport')}
                  </button>
                  <button
                    onClick={handleCreateTour}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('tourAdminCreateTour')}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {tours.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">{t('tourAdminNoTours')}</p>
                  <button
                    onClick={handleCreateTour}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('tourAdminCreateFirstTour')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tours.map((tour) => {
                    const isDefault = tourManagementService.isDefaultTour(tour.id, defaultTours);
                    return (
                      <div
                        key={tour.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTour?.id === tour.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedTour(tour)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-slate-900">{tour.name}</h3>
                              {isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {t('tourAdminDefault')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{tour.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                {tour.category}
                              </span>
                              <span className="text-xs text-slate-500">
                                {tour.steps.length} {t('tourAdminSteps')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {tour.estimatedDuration} {t('tourAdminMinutes')}
                              </span>
                            </div>
                          </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTour(tour);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title={t('tourAdminEdit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateTour(tour);
                            }}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title={t('tourAdminDuplicate')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTour(tour.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title={t('tourAdminDelete')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tour Editor */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-slate-900">
                {isCreating ? t('tourAdminCreateTour') : isEditing ? t('tourAdminEditTour') : t('tourAdminSelectTour')}
              </h2>
            </div>
            <div className="p-6">
              {(isCreating || isEditing) ? (
                <div className="space-y-6">
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">{t('tourAdminValidationErrors')}</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tour Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('tourAdminTourName')}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                        placeholder={t('tourAdminTourNamePlaceholder')}
                        style={{ pointerEvents: 'auto' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('tourAdminTourDescription')}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                        rows={3}
                        placeholder={t('tourAdminTourDescriptionPlaceholder')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('tourAdminCategory')}
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                        >
                          <option value="onboarding">{t('tourAdminCategoryOnboarding')}</option>
                          <option value="feature">{t('tourAdminCategoryFeature')}</option>
                          <option value="admin">{t('tourAdminCategoryAdmin')}</option>
                          <option value="user">{t('tourAdminCategoryUser')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('tourAdminRequiredRole')}
                        </label>
                        <select
                          value={formData.requiredRole}
                          onChange={(e) => setFormData({ ...formData, requiredRole: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                        >
                          <option value="any">{t('tourAdminRoleAny')}</option>
                          <option value="admin">{t('tourAdminRoleAdmin')}</option>
                          <option value="user">{t('tourAdminRoleUser')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('tourAdminEstimatedDuration')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Steps Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-slate-900">{t('tourAdminSteps')}</h3>
                      <button
                        onClick={handleAddStep}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t('tourAdminAddStep')}
                      </button>
                    </div>

                    {formData.steps.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                        <p className="text-slate-500 mb-4">{t('tourAdminNoSteps')}</p>
                        <button
                          onClick={handleAddStep}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          {t('tourAdminAddFirstStep')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.steps.map((step, index) => (
                          <div key={step.id} className="p-4 border border-slate-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900">{step.title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{step.content}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                    {step.position}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {step.target}
                                  </span>
                                  {step.action && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                      {step.action}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                {index > 0 && (
                                  <button
                                    onClick={() => handleMoveStep(index, index - 1)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                    title={t('tourAdminMoveUp')}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                )}
                                {index < formData.steps.length - 1 && (
                                  <button
                                    onClick={() => handleMoveStep(index, index + 1)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                    title={t('tourAdminMoveDown')}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditStep(index)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title={t('tourAdminEdit')}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteStep(index)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title={t('tourAdminDelete')}
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

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-6 border-t">
                    <button
                      onClick={handleSaveTour}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isCreating ? t('tourAdminCreate') : t('tourAdminSave')}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                        setSelectedTour(null);
                        setValidationErrors([]);
                      }}
                      className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {t('tourAdminCancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500">{t('tourAdminSelectTourToEdit')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Editor Modal */}
        {showStepEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingStepIndex >= 0 ? t('tourAdminEditStep') : t('tourAdminAddStep')}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('tourAdminStepTitle')}
                  </label>
                  <input
                    type="text"
                    value={stepFormData.title}
                    onChange={(e) => setStepFormData({ ...stepFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('tourAdminStepTitlePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('tourAdminStepContent')}
                  </label>
                  <textarea
                    value={stepFormData.content}
                    onChange={(e) => setStepFormData({ ...stepFormData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder={t('tourAdminStepContentPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('tourAdminStepTarget')}
                  </label>
                  <input
                    type="text"
                    value={stepFormData.target}
                    onChange={(e) => setStepFormData({ ...stepFormData, target: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="[data-tour='example']"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('tourAdminStepPosition')}
                    </label>
                    <select
                      value={stepFormData.position}
                      onChange={(e) => setStepFormData({ ...stepFormData, position: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="top">{t('tourAdminPositionTop')}</option>
                      <option value="bottom">{t('tourAdminPositionBottom')}</option>
                      <option value="left">{t('tourAdminPositionLeft')}</option>
                      <option value="right">{t('tourAdminPositionRight')}</option>
                      <option value="center">{t('tourAdminPositionCenter')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('tourAdminStepAction')}
                    </label>
                    <select
                      value={stepFormData.action || ''}
                      onChange={(e) => setStepFormData({ ...stepFormData, action: e.target.value as any || undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('tourAdminActionNone')}</option>
                      <option value="click">{t('tourAdminActionClick')}</option>
                      <option value="wait">{t('tourAdminActionWait')}</option>
                      <option value="navigate">{t('tourAdminActionNavigate')}</option>
                      <option value="scroll">{t('tourAdminActionScroll')}</option>
                    </select>
                  </div>
                </div>

                {stepFormData.action === 'wait' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('tourAdminWaitTime')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stepFormData.waitTime || ''}
                      onChange={(e) => setStepFormData({ ...stepFormData, waitTime: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2000"
                    />
                  </div>
                )}

                {(stepFormData.action === 'navigate' || stepFormData.action === 'click') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('tourAdminActionTarget')}
                    </label>
                    <input
                      type="text"
                      value={stepFormData.actionTarget}
                      onChange={(e) => setStepFormData({ ...stepFormData, actionTarget: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={stepFormData.action === 'navigate' ? 'trainings' : '[data-tour="button"]'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('tourAdminRequiredView')}
                  </label>
                  <input
                    type="text"
                    value={stepFormData.requiredView}
                    onChange={(e) => setStepFormData({ ...stepFormData, requiredView: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="public, trainings, users, attendance"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="skipIfNotFound"
                    checked={stepFormData.skipIfNotFound}
                    onChange={(e) => setStepFormData({ ...stepFormData, skipIfNotFound: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="skipIfNotFound" className="ml-2 block text-sm text-slate-700">
                    {t('tourAdminSkipIfNotFound')}
                  </label>
                </div>
              </div>
              <div className="p-6 border-t flex space-x-4">
                <button
                  onClick={handleSaveStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStepIndex >= 0 ? t('tourAdminSave') : t('tourAdminAdd')}
                </button>
                <button
                  onClick={() => setShowStepEditor(false)}
                  className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('tourAdminCancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import/Export Modal */}
        {showImportExport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-slate-900">{t('tourAdminImportExport')}</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-4">{t('tourAdminExport')}</h4>
                  <p className="text-sm text-slate-600 mb-4">{t('tourAdminExportDescription')}</p>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('tourAdminExportTours')}
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-slate-900 mb-4">{t('tourAdminImport')}</h4>
                  <p className="text-sm text-slate-600 mb-4">{t('tourAdminImportDescription')}</p>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={8}
                    placeholder={t('tourAdminImportPlaceholder')}
                  />
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={handleImport}
                      disabled={!importData.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('tourAdminImportTours')}
                    </button>
                    <button
                      onClick={() => {
                        setImportData('');
                        setShowImportExport(false);
                      }}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {t('tourAdminCancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourManagementPage;
