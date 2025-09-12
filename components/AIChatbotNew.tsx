import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import { helpService, type HelpSection } from '../services/helpService';
import { GoogleGenAI } from '@google/genai';
import { getAllSourcesAsText, searchSourcesByKeyword } from '../services/aiKnowledgeService';
import { aiManagementService } from '../services/aiManagementService';
import { useUserInteraction } from '../contexts/UserInteractionContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  onClose: () => void;
  initialMessage?: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onClose, initialMessage }) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const { context } = useUserInteraction();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [helpSections, setHelpSections] = useState<HelpSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get additional knowledge sources from database
  const [additionalSourcesText, setAdditionalSourcesText] = useState<string>('');
  
  // Load knowledge sources on component mount
  useEffect(() => {
    const loadKnowledgeSources = async () => {
      try {
        const sources = await getAllSourcesAsText();
        setAdditionalSourcesText(sources);
      } catch (error) {
        console.error('Error loading knowledge sources:', error);
        setAdditionalSourcesText('');
      }
    };
    
    loadKnowledgeSources();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load help sections on mount
  useEffect(() => {
    const loadHelpSections = async () => {
      try {
        const sections = await helpService.getHelpSections();
        setHelpSections(sections);
      } catch (error) {
        console.error('Error loading help sections:', error);
      }
    };
    
    loadHelpSections();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: language === 'sv' 
          ? 'Hej! Jag är din AI-assistent för träningshanteringssystemet. Hur kan jag hjälpa dig idag?'
          : 'Hello! I\'m your AI assistant for the training management system. How can I help you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [context, helpSections, messages.length, t]);

  // Prepare context for AI using centralized service
  const prepareContext = async (): Promise<string> => {
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

    // Add additional sources from database
    contextString += '## Additional System Knowledge\n\n';
    contextString += additionalSourcesText;

    // Add current context
    if (context) {
      let contextDetails = `## Current Context\n\nUser is currently on screen: **${context.screen}**\nLast action: **${context.action}**\n\n`;
      
      // Add context-specific guidance
      if (context.screen === 'Användarhantering' || context.screen === 'User Management') {
        contextDetails += `**CONTEXT INTERPRETATION:** When the user asks questions like "how to create", "how to add", "how to make", they are most likely asking about creating users, adding users, or user management tasks.\n\n`;
      } else if (context.screen === 'Träningshantering' || context.screen === 'Training Management') {
        contextDetails += `**CONTEXT INTERPRETATION:** When the user asks questions like "how to create", "how to add", "how to make", they are most likely asking about creating training sessions, adding training sessions, or training management tasks.\n\n`;
      } else if (context.screen === 'Incheckning' || context.screen === 'Attendance') {
        contextDetails += `**CONTEXT INTERPRETATION:** When the user asks questions like "how to create", "how to add", "how to make", they are most likely asking about creating attendance records, adding attendance, or attendance management tasks.\n\n`;
      } else if (context.screen === 'Anmälan' || context.screen === 'Public Subscription Page') {
        contextDetails += `**CONTEXT INTERPRETATION:** When the user asks questions like "how to create", "how to add", "how to make", they are most likely asking about creating subscriptions, adding subscriptions, or subscription management tasks.\n\n`;
      }
      
      if (Object.keys(context.data).length > 0) {
        contextDetails += `Current form data:\n\`\`\`json\n${JSON.stringify(context.data, null, 2)}\n\`\`\`\n\n`;
      }
      contextString += contextDetails;
    }

    return contextString;
  };

  // Generate contextual relevance explanation
  const generateContextualRelevance = (userQuestion: string, aiResponse: string): string => {
    if (!context) {
      return language === 'sv' 
        ? 'Detta svar är baserat på allmän systemkunskap.'
        : 'This answer is based on general system knowledge.';
    }

    const { screen, action } = context;
    
    if (language === 'sv') {
      if (screen === 'Användarhantering' || screen === 'User Management') {
        return `Detta svar är relevant eftersom du för närvarande arbetar med användarhantering (${action}).`;
      } else if (screen === 'Träningshantering' || screen === 'Training Management') {
        return `Detta svar är relevant eftersom du för närvarande arbetar med träningshantering (${action}).`;
      } else if (screen === 'Incheckning' || screen === 'Attendance') {
        return `Detta svar är relevant eftersom du för närvarande arbetar med incheckning (${action}).`;
      } else if (screen === 'Anmälan' || screen === 'Public Subscription Page') {
        return `Detta svar är relevant eftersom du för närvarande arbetar med träningsanmälningar (${action}).`;
      } else {
        return `Detta svar är relevant eftersom du för närvarande arbetar med ${screen} (${action}).`;
      }
    } else {
      if (screen === 'Användarhantering' || screen === 'User Management') {
        return `This answer is relevant because you are currently working with user management (${action}).`;
      } else if (screen === 'Träningshantering' || screen === 'Training Management') {
        return `This answer is relevant because you are currently working with training management (${action}).`;
      } else if (screen === 'Incheckning' || screen === 'Attendance') {
        return `This answer is relevant because you are currently working with attendance (${action}).`;
      } else if (screen === 'Anmälan' || screen === 'Public Subscription Page') {
        return `This answer is relevant because you are currently working with training subscriptions (${action}).`;
      } else {
        return `This answer is relevant because you are currently working with ${screen} (${action}).`;
      }
    }
  };

  // Format message content with basic markdown
  const formatMessageContent = (content: string): string => {
    // Convert markdown italic to HTML
    return content
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
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

      const contextString = await prepareContext();
      console.log('🔍 Prepared context:', contextString);
      
      // Get system prompt from centralized service
      const systemPrompt = await aiManagementService.compileSystemPrompt({ context: contextString });

      console.log('🤖 System Prompt:', systemPrompt);
      console.log('📋 Prepared Context:', contextString);
      console.log('🎯 Context Available:', !!context);
      console.log('📊 Context Details:', context);

      const model = ai.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        systemInstruction: systemPrompt
      });

      const result = await model.generateContent(content.trim());
      const response = await result.response;
      let text = response.text();

      console.log('🤖 AI Response:', text);

      // Generate contextual relevance text
      const relevanceText = generateContextualRelevance(content, text);
      console.log('💡 Contextual relevance text:', relevanceText);

      // Append relevance text to the response
      text += `\n\n*${relevanceText}*`;

      // Process AI actions
      const actionRegex = /\[action:([^\]]+)\]/g;
      const actions = [];
      let match;
      while ((match = actionRegex.exec(text)) !== null) {
        const actionString = match[1];
        const [actionType, ...params] = actionString.split(' ');
        const actionData: any = { type: actionType };
        params.forEach(param => {
          if (param.includes('=')) {
            const [key, value] = param.split('=');
            actionData[key] = value.replace(/"/g, '');
          }
        });
        actions.push(actionData);
      }
      console.log('📋 Actions found:', actions);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute AI actions
      actions.forEach(action => {
        console.log('🚀 Executing action:', action);
        const event = new CustomEvent('ai-action', { detail: action });
        window.dispatchEvent(event);
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: language === 'sv' 
          ? 'Tyvärr uppstod ett fel. Försök igen senare.'
          : 'Sorry, an error occurred. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'sv' ? 'AI-assistent' : 'AI Assistant'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(message.content)
                  }}
                />
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'sv' ? 'Skriv ditt meddelande...' : 'Type your message...'}
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
