import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import { helpService, type HelpSection } from '../services/helpService';
import { GoogleGenAI } from '@google/genai';
import { getAllSourcesAsText, searchSourcesByKeyword } from '../services/aiKnowledgeSources';
import { useUserInteraction } from '../contexts/UserInteractionContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  helpSections?: HelpSection[];
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ 
  isOpen, 
  onClose, 
  helpSections = [] 
}) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const { context } = useUserInteraction();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get additional knowledge sources from external configuration
  const additionalSourcesText = getAllSourcesAsText();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with context if provided
  useEffect(() => {
    if (context && helpSections.length > 0 && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: t('aiChatWelcome', { context }),
        timestamp: new Date(),
        sources: []
      };
      setMessages([welcomeMessage]);
    }
  }, [context, helpSections, messages.length, t, context]);

  // Prepare context for AI
  const prepareContext = (): string => {
    let contextString = '';

    // Add help sections content
    if (helpSections.length > 0) {
      contextString += '## Help Documentation\n\n';
      helpSections.forEach(section => {
        contextString += `### ${section.title}\n`;
        contextString += `Category: ${section.category}\n`;
        contextString += `Keywords: ${section.keywords.join(', ')}\n`;
        contextString += `${section.content}\n\n`;
      });
    }

    // Add additional sources
    contextString += '## Additional System Knowledge\n\n';
    contextString += additionalSourcesText;

    // Add current context
    if (context) {
      contextString += `## Current Context\n\nUser is currently working with: ${context}\n\n`;
    }

    return contextString;
  };

  // Send message to AI
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `Du är en hjälpsam AI-assistent för ett träningshanteringssystem. Använd följande information för att svara på användarens frågor:

${prepareContext()}

Instruktioner:
- Svara på svenska om användaren skriver på svenska, annars på engelska
- Var hjälpsam, vänlig och professionell
- Använd informationen från dokumentationen och systemkunskapen
- Om du inte vet svaret, säg det tydligt
- Ge praktiska exempel när det är lämpligt
- Citera relevanta delar av dokumentationen när det hjälper

Användarens fråga: ${content}`;

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: systemPrompt,
      });

      const text = result.text.trim();

      // Extract sources from response (simple keyword matching)
      const sources = [];
      const allKeywords = [
        ...helpSections.flatMap(s => s.keywords)
      ];
      
      // Search for sources in additional knowledge
      const relevantSources = searchSourcesByKeyword(text);
      relevantSources.forEach(source => {
        if (!sources.includes(source.name)) {
          sources.push(source.name);
        }
      });
      
      // Also check help sections
      allKeywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          const source = helpSections.find(s => s.keywords.includes(keyword))?.title;
          if (source && !sources.includes(source)) {
            sources.push(source);
          }
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: text,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: t('aiChatError'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  // Handle Enter key (with Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div key={language} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('aiChatTitle')}</h2>
            <p className="text-slate-600">{t('aiChatDescription')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* User Context Display */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <div className="font-medium mb-1">{t('aiHelpContextTitle')}</div>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>{t('aiHelpContextScreen')}:</strong> {context.screen}</li>
              <li><strong>{t('aiHelpContextAction')}:</strong> {context.action}</li>
            </ul>
          </div>
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs opacity-75">{t('aiChatSourcesTitle')}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.sources.map((source, index) => (
                        <span
                          key={index}
                          className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs opacity-75 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-slate-500">{t('aiChatTyping')}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aiChatPlaceholder')}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          
          <div className="mt-3 text-xs text-slate-500 text-center">
            {t('aiChatFooter')}
          </div>
        </div>
      </div>
    </div>
  );
};
