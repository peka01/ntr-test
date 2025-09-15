import React, { useState, useEffect, useCallback } from 'react';
import { elementScannerService, ScannableElement } from '../services/elementScannerService';
import { useTranslations } from '../hooks/useTranslations';

interface ElementPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selector: string) => void;
  currentSelector?: string;
}

export const ElementPicker: React.FC<ElementPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentSelector
}) => {
  const { t } = useTranslations();
  const [elements, setElements] = useState<ScannableElement[]>([]);
  const [filteredElements, setFilteredElements] = useState<ScannableElement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ScannableElement | null>(null);

  // Scan for elements when picker opens
  useEffect(() => {
    if (isOpen) {
      scanElements();
    }
  }, [isOpen]);

  // Filter elements based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredElements(elements);
    } else {
      const filtered = elements.filter(element => 
        element.selector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.textContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.tagName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.className?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredElements(filtered);
    }
  }, [searchTerm, elements]);

  const scanElements = useCallback(async () => {
    setIsScanning(true);
    try {
      const scannedElements = elementScannerService.scanForElements();
      setElements(scannedElements);
      setFilteredElements(scannedElements);
    } catch (error) {
      console.error('Error scanning elements:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleElementClick = (element: ScannableElement) => {
    setSelectedElement(element);
    elementScannerService.highlightElement(element.selector);
  };

  const handleSelect = () => {
    if (selectedElement) {
      onSelect(selectedElement.selector);
      onClose();
    }
  };

  const handleRefresh = () => {
    scanElements();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t('elementPickerTitle')}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t('elementPickerDescription')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('elementPickerSearchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isScanning ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('scanning')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('refresh')}</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Elements List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Elements List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="text-sm text-slate-600 mb-4">
                  {t('elementPickerFoundElements', { count: filteredElements.length })}
                </div>
                
                {filteredElements.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {searchTerm ? t('elementPickerNoResults') : t('elementPickerNoElements')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredElements.map((element, index) => (
                      <div
                        key={`${element.selector}-${index}`}
                        onClick={() => handleElementClick(element)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedElement?.selector === element.selector
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                {element.tagName}
                              </span>
                              {element.id && (
                                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  #{element.id}
                                </span>
                              )}
                              {element['data-tour'] && (
                                <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                                  data-tour
                                </span>
                              )}
                            </div>
                            
                            <div className="font-mono text-sm text-slate-700 mb-1">
                              {element.selector}
                            </div>
                            
                            {element.textContent && (
                              <div className="text-sm text-slate-600 truncate">
                                "{element.textContent}"
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              <span>{element.position.width}×{element.position.height}px</span>
                              <span className={`px-2 py-1 rounded ${
                                element.visible ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {element.visible ? t('visible') : t('notVisible')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                elementScannerService.highlightElement(element.selector);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {t('highlight')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Element Preview */}
            {selectedElement && (
              <div className="w-80 border-l border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900 mb-4">
                  {t('elementPickerPreview')}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('selector')}
                    </label>
                    <div className="font-mono text-sm bg-white p-2 border rounded">
                      {selectedElement.selector}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('elementType')}
                    </label>
                    <div className="text-sm text-slate-600">
                      {selectedElement.tagName}
                    </div>
                  </div>
                  
                  {selectedElement.textContent && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('textContent')}
                      </label>
                      <div className="text-sm text-slate-600">
                        "{selectedElement.textContent}"
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('dimensions')}
                    </label>
                    <div className="text-sm text-slate-600">
                      {selectedElement.position.width} × {selectedElement.position.height}px
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('position')}
                    </label>
                    <div className="text-sm text-slate-600">
                      {Math.round(selectedElement.position.top)}, {Math.round(selectedElement.position.left)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('visibility')}
                    </label>
                    <div className={`text-sm px-2 py-1 rounded inline-block ${
                      selectedElement.visible ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedElement.visible ? t('visible') : t('notVisible')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            {t('elementPickerTip')}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedElement}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('select')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
