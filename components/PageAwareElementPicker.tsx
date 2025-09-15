import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { elementScannerService, ScannableElement } from '../services/elementScannerService';

interface PageAwareElementPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (element: ScannableElement) => void;
  currentSelector?: string;
  tourContext?: any;
}

export const PageAwareElementPicker: React.FC<PageAwareElementPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentSelector,
  tourContext
}) => {
  const { t } = useTranslations();
  const [isScanning, setIsScanning] = useState(false);
  const [availableElements, setAvailableElements] = useState<ScannableElement[]>([]);
  const [highlightedElement, setHighlightedElement] = useState<ScannableElement | null>(null);

  // Scan for elements on the current page
  const scanCurrentPage = useCallback(async () => {
    setIsScanning(true);
    try {
      const elements = elementScannerService.scanForElements();
      setAvailableElements(elements);
      console.log('🎯 Found', elements.length, 'elements on current page');
    } catch (error) {
      console.error('Error scanning page:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Initialize when picker opens
  useEffect(() => {
    if (isOpen) {
      scanCurrentPage();
    }
  }, [isOpen, scanCurrentPage]);

  // Handle element selection
  const handleElementSelect = (element: ScannableElement) => {
    onSelect(element);
    onClose();
  };

  // Handle element hover for preview
  const handleElementHover = (element: ScannableElement) => {
    setHighlightedElement(element);
    elementScannerService.highlightElement(element.selector);
  };

  const handleElementLeave = () => {
    setHighlightedElement(null);
    // Remove highlight
    const element = document.querySelector(highlightedElement?.selector || '');
    if (element) {
      element.classList.remove('tour-highlight');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {t('pickElement')}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {t('pickElementDescription')}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isScanning ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">{t('scanningElements')}</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {availableElements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    {t('noElementsFound')}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {t('noElementsFoundDescription')}
                  </p>
                  <button
                    onClick={scanCurrentPage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('scanAgain')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900">
                      {t('availableElements')} ({availableElements.length})
                    </h3>
                    <button
                      onClick={scanCurrentPage}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t('refresh')}
                    </button>
                  </div>
                  
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {availableElements.map((element, index) => (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleElementSelect(element)}
                        onMouseEnter={() => handleElementHover(element)}
                        onMouseLeave={handleElementLeave}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 mb-1">
                              {element.text || element.selector}
                            </div>
                            <div className="text-sm text-slate-600 font-mono">
                              {element.selector}
                            </div>
                            {element.type && (
                              <div className="text-xs text-slate-500 mt-1">
                                {t('type')}: {element.type}
                              </div>
                            )}
                          </div>
                          <div className="text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {t('pickElementHint')}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
