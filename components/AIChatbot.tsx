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
        content: t('aiChatWelcome', { context: context.screen }),
        timestamp: new Date(),
        sources: []
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
        ? 'Detta svar är baserat på allmän systemkunskap och dokumentation.'
        : 'This answer is based on general system knowledge and documentation.';
    }

    const screen = context.screen;
    const action = context.action;
    
    // Generate relevance explanation based on context
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
    let formatted = content
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    
    // Handle external source links - convert [text](URL) to clickable links that open in new tabs
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      // Check if this is an external source by looking for common external patterns
      const isExternal = url.startsWith('http') && !url.includes(window.location.hostname);
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      const externalClass = isExternal ? ' class="external-source-link"' : '';
      
      return `<a href="${url}"${target}${externalClass}>${text}</a>`;
    });
    
    return formatted;
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
      
      const systemPrompt = `Du är en hjälpsam AI-assistent för ett träningshanteringssystem. Använd följande information för att svara på användarens frågor:

${contextString}

VIKTIGA INSTRUKTIONER:
- Svara på svenska om användaren skriver på svenska, annars på engelska
- Var hjälpsam, vänlig och professionell
- ANVÄND ALLTID KONTEXTINFORMATIONEN för att förstå vad användaren menar
- BÖRJA ALLTID med att förklara din tolkning av kontexten innan du ger svaret
- Om användaren är på "Användarhantering" och frågar "hur skapar jag" → börja med "Eftersom du är på användarhanteringssidan antar jag att du vill veta hur man skapar en användare. Låt mig hjälpa dig:"
- Om användaren är på "Träningshantering" och frågar "hur skapar jag" → börja med "Eftersom du är på träningshanteringssidan antar jag att du vill veta hur man skapar ett träningspass. Låt mig hjälpa dig:"
- Om användaren är på "Incheckning" och frågar "hur skapar jag" → börja med "Eftersom du är på incheckningssidan antar jag att du vill veta hur man skapar en incheckning. Låt mig hjälpa dig:"
- Om användaren är på "Anmälan" och frågar "hur skapar jag" → börja med "Eftersom du är på anmälningssidan antar jag att du vill veta hur man skapar en anmälan. Låt mig hjälpa dig:"

FÖR ENGELSKA FRÅGOR:
- Om användaren är på "User Management" och frågar "how to create" → börja med "Since you're on the User Management page, I assume you want to know how to create a user. Let me help you:"
- Om användaren är på "Training Management" och frågar "how to create" → börja med "Since you're on the Training Management page, I assume you want to know how to create a training session. Let me help you:"
- Om användaren är på "Attendance" och frågar "how to create" → börja med "Since you're on the Attendance page, I assume you want to know how to create an attendance record. Let me help you:"
- Om användaren är på "Public Subscription Page" och frågar "how to create" → börja med "Since you're on the Subscription page, I assume you want to know how to create a subscription. Let me help you:"
- Fråga INTE om förtydligande om kontexten redan ger tydlig information om vad användaren vill göra

EXEMPEL PÅ KONTEXTBASERADE SVAR:
- Användare på "Användarhantering" + fråga "hur skapar jag" = "Eftersom du är på användarhanteringssidan antar jag att du vill veta hur man skapar en användare. Låt mig hjälpa dig: [svar]"
- Användare på "Träningshantering" + fråga "hur lägger jag till" = "Eftersom du är på träningshanteringssidan antar jag att du vill veta hur man lägger till ett träningspass. Låt mig hjälpa dig: [svar]"
- Användare på "Incheckning" + fråga "hur gör jag" = "Eftersom du är på incheckningssidan antar jag att du vill veta hur man gör en incheckning. Låt mig hjälpa dig: [svar]"
- Användare på "Anmälan" + fråga "hur anmäler jag" = "Eftersom du är på anmälningssidan antar jag att du vill veta hur man anmäler sig. Låt mig hjälpa dig: [svar]"

ENGLISH EXAMPLES:
- User on "User Management" + question "how to create" = "Since you're on the User Management page, I assume you want to know how to create a user. Let me help you: [answer]"
- User on "Training Management" + question "how to add" = "Since you're on the Training Management page, I assume you want to know how to add a training session. Let me help you: [answer]"
- User on "Attendance" + question "how to do" = "Since you're on the Attendance page, I assume you want to know how to create an attendance record. Let me help you: [answer]"
- User on "Public Subscription Page" + question "how to subscribe" = "Since you're on the Subscription page, I assume you want to know how to create a subscription. Let me help you: [answer]"

- Ge praktiska exempel när det är lämpligt
- Citera relevanta delar av dokumentationen när det hjälper
- Om du verkligen inte vet svaret, säg det tydligt

VIKTIGT - Interaktiva åtgärder (AI actions):
- Efter ditt svar, om det är relevant, lägg till en eller flera åtgärdshints på separata rader i formatet [action:NAMN nyckel=värde ...]
- Stödda åtgärder:
  - navigate view=public|admin|attendance|users|trainings|tour-management|shoutout-management
  - open_help id=overview|vouchers|user-management|training-management|subscriptions|attendance|troubleshooting
  - start_tour tourId="tour-id" (starta en guidad rundtur)
  - add_user (öppna formuläret för att lägga till användare)
  - add_training (öppna formuläret för att lägga till träning)
  - create_tour (öppna formuläret för att skapa rundtur)
  - create_shoutout (öppna formuläret för att skapa shoutout)
- När du förklarar hur man skapar något, lägg alltid till en följdfråga som "Vill du att jag gör det åt dig?" (svenska) eller "Do you want me to do this for you?" (engelska)
- Exempel: [action:add_user] eller [action:add_training]

Viktigt: Skriv alltid din naturliga text först. Lägg därefter (om relevant) till åtgärdshints på egna rader.

Användarens fråga: ${content}`;

      // Debug: Log the system prompt
      console.log('📝 System prompt:', systemPrompt);

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: systemPrompt,
      });

      const text = result.text.trim();
      
      // Debug: Log the AI response
      console.log('🤖 AI Response:', text);
      console.log('🔍 Looking for action tags in response...');

      // Process AI actions
      const actionRegex = /\[action:([^\]]+)\]/g;
      const actions = [];
      let match;
      while ((match = actionRegex.exec(text)) !== null) {
        const actionString = match[1];
        const [actionType, ...params] = actionString.split(' ');
        const actionData: any = { type: actionType };
        
        // Parse parameters
        params.forEach(param => {
          if (param.includes('=')) {
            const [key, value] = param.split('=');
            actionData[key] = value.replace(/"/g, '');
          }
        });
        
        actions.push(actionData);
      }
      
      console.log('📋 Actions found:', actions);

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

      // Generate contextual relevance explanation
      const relevanceText = generateContextualRelevance(content, text);
      
      // Combine AI response with contextual relevance
      const fullContent = `${text}\n\n*${relevanceText}*`;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fullContent,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Execute AI actions
      actions.forEach(action => {
        console.log('🚀 Executing action:', action);
        const event = new CustomEvent('ai-action', {
          detail: action
        });
        window.dispatchEvent(event);
      });
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
      <style>
        {`
          .external-source-link {
            color: #059669 !important;
            font-weight: 600;
            text-decoration: underline;
            position: relative;
          }
          .external-source-link:hover {
            color: #047857 !important;
          }
          .external-source-link::after {
            content: " ↗";
            font-size: 0.8em;
            opacity: 0.7;
          }
        `}
      </style>
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
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                />
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
              title={`${t('aiHelpContextTitle')}\n- ${t('aiHelpContextScreen')}: ${context.screen}\n- ${t('aiHelpContextAction')}: ${context.action}${Object.keys(context.data).length > 0 ? `\n- Data: ${JSON.stringify(context.data)}` : ''}`}
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
