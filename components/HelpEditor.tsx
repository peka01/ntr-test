import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import { helpService, type HelpSection } from '../services/helpService';
import sv from '../locales/sv.json';
import en from '../locales/en.json';

// Create translation type from the imported locale files
type TranslationKey = keyof typeof sv;

interface HelpEditorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSection?: string;
  isAdmin?: boolean;
}

interface UITextVariable {
  key: string;
  value: string;
}

interface GitBranch {
  name: string;
  isDefault: boolean;
}

interface FileOperation {
  type: 'rename' | 'move';
  original: string;
  target: string;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  appliedChanges?: {
    type: string;
    oldContent: string;
    newContent: string;
    diff?: string;
  };
}

export const HelpEditor: React.FC<HelpEditorProps> = ({
  isOpen,
  onClose,
  selectedSection,
  isAdmin = false
}) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  
  // Content state tracking
  const [currentSection, setCurrentSection] = useState<HelpSection | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>(''); // Track original content
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editor state
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [showDiffInPreview, setShowDiffInPreview] = useState(false);
  const [showOriginalInPreview, setShowOriginalInPreview] = useState(false);
  const [diffGranularity, setDiffGranularity] = useState<'line' | 'sentence' | 'word'>('line');
  
  // Panel state
  const [activeLeftPanel, setActiveLeftPanel] = useState<'none' | 'ui-text' | 'ai'>('none');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [uiTextVariables, setUiTextVariables] = useState<UITextVariable[]>([]);
  const [filteredVariables, setFilteredVariables] = useState<UITextVariable[]>([]);
  const [variableSearch, setVariableSearch] = useState<string>('');
  
  // AI state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // File operations state
  const [fileOperations, setFileOperations] = useState<FileOperation | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFilePath, setNewFilePath] = useState<string>('');
  
  // Sync selectedLanguage with language prop when it changes
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);
  // Git state
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  
  // Generate suggested commit message
  const generateCommitMessage = (): string => {
    const fileName = selectedSection || 'help-content';
    const languageLabel = selectedLanguage === 'sv' ? 'Swedish' : 'English';
    return `Help text update in ${fileName} (${languageLabel})`;
  };
  
  const [commitMessage, setCommitMessage] = useState<string>(generateCommitMessage());
  const [isCommitting, setIsCommitting] = useState(false);
  
  // Modal positioning and sizing state
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [modalSize, setModalSize] = useState({ width: 80, height: 80 }); // in viewport units
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastCursorPositionRef = useRef<number>(0);
  const isInsertingTextRef = useRef<boolean>(false);

  // Load current section content
  useEffect(() => {
    if (isOpen && selectedSection) {
      loadSectionContent(selectedSection);
    }
  }, [isOpen, selectedSection, language]);

  // Update commit message when section or language changes
  useEffect(() => {
    setCommitMessage(generateCommitMessage());
  }, [selectedSection, selectedLanguage]);

  // Load UI text variables
  useEffect(() => {
    if (activeLeftPanel === 'ui-text') {
      loadUITextVariables();
    }
  }, [activeLeftPanel, selectedLanguage]);

  // Load initial variables if UI text panel is opened on first render
  useEffect(() => {
    if (isOpen && activeLeftPanel === 'ui-text') {
      loadUITextVariables();
    }
  }, [isOpen]);

  // Filter UI text variables
  useEffect(() => {
    if (variableSearch.trim()) {
      const filtered = uiTextVariables.filter(variable =>
        variable.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
        variable.value.toLowerCase().includes(variableSearch.toLowerCase())
      );
      setFilteredVariables(filtered);
    } else {
      setFilteredVariables(uiTextVariables);
    }
  }, [uiTextVariables, variableSearch]);

  // Load section content (force refresh from GitHub to get latest)
  const loadSectionContent = async (sectionId: string, forceRefresh: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      // Always force refresh to get the latest content from GitHub
      const section = await helpService.getSection(sectionId, language, forceRefresh);
      if (section) {
        setCurrentSection(section);
        setMarkdownContent(section.content);
        setOriginalContent(section.content); // Store original for diff comparison
        setHasUnsavedChanges(false);
        setNewFileName(section.title);
        setNewFilePath(section.id);
      } else {
        setError(`Section ${sectionId} not found`);
      }
    } catch (err) {
      console.error('Error loading section:', err);
      setError(err instanceof Error ? err.message : 'Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  // Track content changes
  const updateContent = (newContent: string) => {
    setMarkdownContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);
  };

  // Load UI text variables from locale files
  const loadUITextVariables = async () => {
    try {
      // Use imported locale files instead of fetching
      const translations = selectedLanguage === 'sv' ? sv : en;
      const variables: UITextVariable[] = Object.entries(translations).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      console.log(`Loaded ${variables.length} UI text variables for language: ${selectedLanguage}`);
      setUiTextVariables(variables);
    } catch (err) {
      console.error('Error loading UI text variables:', err);
    }
  };

  // Handle cursor position changes
  const handleCursorPositionChange = useCallback(() => {
    if (editorRef.current && !isInsertingTextRef.current) {
      const position = editorRef.current.selectionStart;
      setCursorPosition(position);
      lastCursorPositionRef.current = position;
    }
  }, []);

  // Restore cursor position after content changes (only during text insertion)
  useEffect(() => {
    if (isInsertingTextRef.current && editorRef.current) {
      // This runs after React has updated the textarea content
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.setSelectionRange(lastCursorPositionRef.current, lastCursorPositionRef.current);
          isInsertingTextRef.current = false;
        }
      });
    }
  }, [markdownContent]);

  // Insert text at cursor position
  const insertAtCursor = useCallback((text: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const scrollTop = editor.scrollTop;
      
      // Mark that we're inserting text to prevent cursor jumping
      isInsertingTextRef.current = true;
      
      // Calculate new cursor position
      const newPosition = start + text.length;
      lastCursorPositionRef.current = newPosition;
      
      // Update content
      const currentContent = markdownContent;
      const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
      setMarkdownContent(newContent);
      
      // Preserve scroll position and focus
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.scrollTop = scrollTop;
          editorRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
          isInsertingTextRef.current = false;
        }
      });
    }
  }, [markdownContent]);

  // Format selection with markdown
  const formatSelection = useCallback((before: string, after: string = before) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const selectedText = markdownContent.substring(start, end);
      
      if (selectedText.length > 0) {
        // There's selected text, wrap it
        const newText = before + selectedText + after;
        insertAtCursor(newText);
        
        // After insertion, select the original text (now wrapped in formatting)
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const newStart = start + before.length;
            const newEnd = newStart + selectedText.length;
            editorRef.current.setSelectionRange(newStart, newEnd);
          }
        });
      } else {
        // No selection, just insert the markers and position cursor between them
        const newText = before + after;
        insertAtCursor(newText);
        
        // Position cursor between the markers
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const cursorPos = start + before.length;
            editorRef.current.setSelectionRange(cursorPos, cursorPos);
          }
        });
      }
    }
  }, [markdownContent, insertAtCursor]);

  // AI conversation
  const sendAIMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsAiLoading(true);
    const userMessage: AIMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');

    try {
      // Load application context for better AI suggestions
      const appContext = await loadApplicationContext();
      const response = await mockAIResponse(message, markdownContent, appContext);
      
      // Execute AI actions and get the message with applied changes
      const aiMessage = executeAIActions(response);
      console.log('AI Response:', response);
      console.log('Applied Changes:', aiMessage.appliedChanges);
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending AI message:', err);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Create a simple diff visualization for the preview pane
  const createDiffView = (): string => {
    // Normalize whitespace for comparison - collapse multiple spaces, normalize line endings
    const normalizeWhitespace = (text: string): string => {
      return text
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\r/g, '\n')    // Normalize line endings
        .replace(/[ \t]+/g, ' ') // Collapse multiple spaces/tabs to single space
        .replace(/\n+/g, '\n')   // Collapse multiple newlines to single newline
        .trim();                 // Remove leading/trailing whitespace
    };

    const normalizedOriginal = normalizeWhitespace(originalContent);
    const normalizedCurrent = normalizeWhitespace(markdownContent);

    if (normalizedOriginal === normalizedCurrent) {
      return '<div class="text-slate-500 italic">No content changes to show (only whitespace differences)</div>';
    }

    // Choose tokenization strategy based on granularity
    const tokenize = (text: string): string[] => {
      switch (diffGranularity) {
        case 'line':
          return text.split('\n');
        case 'sentence':
          // Split on sentence boundaries but keep the delimiters
          return text.split(/([.!?]+\s+)/g).filter(token => token.length > 0);
        case 'word':
        default:
          // Split primarily on whitespace to preserve whole words including Swedish characters
          return text.split(/(\s+)/).filter(token => token.length > 0);
      }
    };

    const oldTokens = tokenize(normalizedOriginal);
    const newTokens = tokenize(normalizedCurrent);
    
    // Simple LCS-like algorithm for token-level diffing
    const changes: Array<{type: 'same' | 'removed' | 'added', content: string}> = [];
    
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldTokens.length || newIndex < newTokens.length) {
      if (oldIndex >= oldTokens.length) {
        // Only new tokens left
        changes.push({type: 'added', content: newTokens.slice(newIndex).join('')});
        break;
      } else if (newIndex >= newTokens.length) {
        // Only old tokens left  
        changes.push({type: 'removed', content: oldTokens.slice(oldIndex).join('')});
        break;
      } else if (oldTokens[oldIndex] === newTokens[newIndex]) {
        // Tokens match
        changes.push({type: 'same', content: oldTokens[oldIndex]});
        oldIndex++;
        newIndex++;
      } else {
        // Tokens differ - look ahead to find next matching point
        let foundMatch = false;
        const lookAhead = diffGranularity === 'line' ? 5 : 10;
        
        // Look for the old token in upcoming new tokens (deletion case)
        for (let i = newIndex + 1; i < Math.min(newIndex + lookAhead, newTokens.length); i++) {
          if (oldTokens[oldIndex] === newTokens[i]) {
            // Found the old token later - tokens in between were added
            changes.push({type: 'added', content: newTokens.slice(newIndex, i).join('')});
            newIndex = i;
            foundMatch = true;
            break;
          }
        }
        
        if (!foundMatch) {
          // Look for the new token in upcoming old tokens (insertion case)
          for (let i = oldIndex + 1; i < Math.min(oldIndex + lookAhead, oldTokens.length); i++) {
            if (newTokens[newIndex] === oldTokens[i]) {
              // Found the new token later - tokens in between were removed
              changes.push({type: 'removed', content: oldTokens.slice(oldIndex, i).join('')});
              oldIndex = i;
              foundMatch = true;
              break;
            }
          }
        }
        
        if (!foundMatch) {
          // No match found nearby - treat as replacement
          changes.push({type: 'removed', content: oldTokens[oldIndex]});
          changes.push({type: 'added', content: newTokens[newIndex]});
          oldIndex++;
          newIndex++;
        }
      }
    }
    
    // Group consecutive changes for better display
    const groupedChanges: Array<{type: 'same' | 'removed' | 'added', content: string}> = [];
    let currentGroup = {type: changes[0]?.type || 'same', content: ''};
    
    for (const change of changes) {
      if (change.type === currentGroup.type) {
        currentGroup.content += change.content;
      } else {
        if (currentGroup.content) {
          groupedChanges.push({...currentGroup});
        }
        currentGroup = {type: change.type, content: change.content};
      }
    }
    if (currentGroup.content) {
      groupedChanges.push(currentGroup);
    }
    
    // Render the diff
    let diffHtml = '<div class="space-y-2">';
    
    for (const group of groupedChanges) {
      const escapedContent = group.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
        
      if (group.type === 'same') {
        // Show context around changes (truncate if too long)
        const maxContextLength = diffGranularity === 'line' ? 500 : 200;
        if (group.content.length > maxContextLength) {
          const start = group.content.substring(0, maxContextLength / 2);
          const end = group.content.substring(group.content.length - maxContextLength / 2);
          diffHtml += `<div class="text-slate-600 text-sm">
            <span>${start.replace(/\n/g, '<br>')}</span>
            <span class="text-slate-400 italic"> ... (${group.content.length - maxContextLength} chars omitted) ... </span>
            <span>${end.replace(/\n/g, '<br>')}</span>
          </div>`;
        } else {
          diffHtml += `<div class="text-slate-600 text-sm">${escapedContent}</div>`;
        }
      } else if (group.type === 'removed') {
        diffHtml += `<div class="bg-red-100 text-red-800 px-3 py-2 rounded border-l-4 border-red-400">
          <span class="font-bold text-red-600 mr-2">−</span>
          <span class="font-mono">${escapedContent}</span>
        </div>`;
      } else if (group.type === 'added') {
        diffHtml += `<div class="bg-green-100 text-green-800 px-3 py-2 rounded border-l-4 border-green-400">
          <span class="font-bold text-green-600 mr-2">+</span>
          <span class="font-mono">${escapedContent}</span>
        </div>`;
      }
    }
    
    diffHtml += '</div>';
    
    // Add summary
    const addedChars = groupedChanges.filter(g => g.type === 'added').reduce((sum, g) => sum + g.content.length, 0);
    const removedChars = groupedChanges.filter(g => g.type === 'removed').reduce((sum, g) => sum + g.content.length, 0);
    
    diffHtml = `<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
      <div class="text-sm text-blue-800">
        <strong>Changes Summary (${diffGranularity} level):</strong> 
        <span class="text-green-600">+${addedChars} chars added</span>, 
        <span class="text-red-600">-${removedChars} chars removed</span>
      </div>
    </div>` + diffHtml;
    
    return diffHtml;
  };

  // Apply AI changes directly with diff tracking
  const applyAIChange = (type: string, newContent: string, description?: string) => {
    const oldContent = markdownContent;
    let finalContent = '';
    
    console.log('Applying AI change:', { type, oldLength: oldContent.length, newLength: newContent.length });
    
    switch (type) {
      case 'REPLACE_CONTENT':
        finalContent = newContent;
        break;
      case 'INSERT_AT_CURSOR':
        if (editorRef.current) {
          const start = editorRef.current.selectionStart;
          finalContent = oldContent.substring(0, start) + newContent + oldContent.substring(start);
        } else {
          finalContent = oldContent + '\n\n' + newContent;
        }
        break;
      case 'APPEND_CONTENT':
        finalContent = oldContent + '\n\n' + newContent;
        break;
      case 'PREPEND_CONTENT':
        finalContent = newContent + '\n\n' + oldContent;
        break;
      default:
        finalContent = newContent;
    }
    
    // Update content and mark as changed
    updateContent(finalContent);
    
    // Return change info
    return {
      type,
      oldContent,
      newContent: finalContent,
      timestamp: new Date()
    };
  };
  // Execute AI actions on editor content - now applies changes automatically
  const executeAIActions = (aiResponse: string): AIMessage => {
    const actions = parseAIActions(aiResponse);
    let appliedChanges = null;
    
    // Apply the first action found (most common case)
    if (actions.length > 0) {
      const action = actions[0];
      appliedChanges = applyAIChange(action.type, action.content);
    } else {
      // If no specific action markers found, check if response contains substantial content
      // that could be treated as a content suggestion
      const responseLines = aiResponse.split('\n').filter(line => line.trim());
      const hasSubstantialContent = responseLines.length > 2 && 
                                   aiResponse.length > 100 &&
                                   (aiResponse.includes('#') || aiResponse.includes('```') || aiResponse.includes('##'));
      
      if (hasSubstantialContent && aiResponse.toLowerCase().includes('suggest') === false) {
        // Treat the entire response as a content replacement if it looks like markdown content
        appliedChanges = applyAIChange('REPLACE_CONTENT', aiResponse);
      }
    }
    
    // Return the message with applied changes info
    return {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      appliedChanges
    };
  };

  // Parse AI response for action commands
  const parseAIActions = (response: string): Array<{ type: string; content: string }> => {
    const actions: Array<{ type: string; content: string }> = [];
    const actionRegex = /\[(REPLACE_CONTENT|INSERT_AT_CURSOR|APPEND_CONTENT|PREPEND_CONTENT)\]\s*([\s\S]*?)(?=\[|$)/g;
    
    let match;
    while ((match = actionRegex.exec(response)) !== null) {
      const type = match[1];
      let content = match[2].trim();
      
      // Clean up content - remove any following action markers or excessive whitespace
      content = content.replace(/\[(?:REPLACE_CONTENT|INSERT_AT_CURSOR|APPEND_CONTENT|PREPEND_CONTENT)\][\s\S]*$/, '').trim();
      
      if (content) {
        actions.push({ type, content });
      }
    }
    
    return actions;
  };

  // Apply AI suggestion with confirmation
  const applyAISuggestion = (action: { type: string; content: string }) => {
    const confirmMessage = `Apply AI suggestion?\n\nAction: ${action.type}\nContent: ${action.content.substring(0, 100)}${action.content.length > 100 ? '...' : ''}`;
    
    if (confirm(confirmMessage)) {
      switch (action.type) {
        case 'REPLACE_CONTENT':
          setMarkdownContent(action.content);
          break;
        case 'INSERT_AT_CURSOR':
          insertAtCursor(action.content);
          break;
        case 'APPEND_CONTENT':
          setMarkdownContent(prev => prev + '\n\n' + action.content);
          break;
        case 'PREPEND_CONTENT':
          setMarkdownContent(prev => action.content + '\n\n' + prev);
          break;
      }
    }
  };
  const loadApplicationContext = async (): Promise<string> => {
    try {
      let context = '';
      
      // Add current help section context
      if (currentSection) {
        context += `Current Help Section: ${currentSection.title}\n`;
        context += `Category: ${currentSection.category}\n`;
        context += `Keywords: ${currentSection.keywords.join(', ')}\n\n`;
      }
      
      // Add UI text variables context
      if (uiTextVariables.length > 0) {
        context += `Available UI Text Variables (${uiTextVariables.length} total):\n`;
        const sampleVariables = uiTextVariables.slice(0, 20).map(v => `{{${v.key}}} = "${v.value}"`).join('\n');
        context += sampleVariables + '\n...\n\n';
      }
      
      // Add component structure context (mock - in real app, this could fetch from file system)
      context += `Application Structure:\n`;
      context += `- Admin Panel: User management, training creation, voucher management\n`;
      context += `- Public View: Training subscription, user registration\n`;
      context += `- Attendance: Check-in system, kiosk mode\n`;
      context += `- Help System: Multi-language help documentation\n`;
      context += `- Tour System: Guided tours for features\n`;
      context += `- Shoutout System: User notifications and announcements\n\n`;
      
      // Add current language context
      context += `Current Language: ${language}\n`;
      context += `Available Languages: English (en), Swedish (sv)\n\n`;
      
      return context;
    } catch (error) {
      console.error('Error loading application context:', error);
      return 'Application context unavailable.';
    }
  };

  // Mock AI response (replace with actual AI integration)
  const mockAIResponse = async (message: string, content: string, appContext: string): Promise<string> => {
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Import GoogleGenAI dynamically to avoid build issues
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      // Create comprehensive context for the AI
      const systemPrompt = `You are an expert technical writer helping to create and improve help documentation for a training management system.

Application Context:
${appContext}

Current Help Content:
${content}

CRITICAL INSTRUCTIONS:
1. You MUST use action markers for ANY content changes
2. Never just suggest changes - ALWAYS include the action marker and new content
3. Even for small edits, use the appropriate action marker

Your role:
- When user asks to rewrite/improve: Use [REPLACE_CONTENT] with the complete new version
- When user asks to add something: Use [APPEND_CONTENT] or [PREPEND_CONTENT] 
- When user asks to insert at cursor: Use [INSERT_AT_CURSOR]
- Always follow action markers with the actual content

MANDATORY ACTION MARKERS:
- [REPLACE_CONTENT] - Replace all content with new version
- [INSERT_AT_CURSOR] - Insert content at cursor position  
- [APPEND_CONTENT] - Add content to the end
- [PREPEND_CONTENT] - Add content to the beginning

EXAMPLE RESPONSE:
User: "Rewrite this to be clearer"
Your response: "I'll rewrite this content for better clarity:

[REPLACE_CONTENT]
# Clear Help Section
This section explains the feature in simple terms...
(rest of the new content)"

ALWAYS use action markers - never just provide suggestions without them!`;

      const conversationContents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...aiMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: conversationContents,
      });

      const response = result.text.trim();
      
      // Auto-execute actions when using real AI
      // executeAIActions(response);
      
      return response;
    } catch (error) {
      console.error('Error with AI service:', error);
      throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
    }
  };

  // Render markdown preview
  const renderMarkdownPreview = useCallback((content: string): string => {
    console.log('Rendering preview for content:', content.substring(0, 100) + '...');
    
    let html = content;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded">$1</code>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-cyan-600 hover:underline">$1</a>');
    
    // Lists
    const lines = html.split('\n');
    let inList = false;
    let listItems: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- ')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.substring(2));
      } else {
        if (inList && listItems.length > 0) {
          const listHtml = `<ul class="list-disc ml-6 mb-4">${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`;
          lines[i - listItems.length] = listHtml;
          for (let j = i - listItems.length + 1; j < i; j++) {
            lines[j] = '';
          }
          inList = false;
          listItems = [];
        }
        if (line && !line.startsWith('<')) {
          lines[i] = `<p class="mb-4">${line}</p>`;
        }
      }
    }
    
    // Handle remaining list
    if (inList && listItems.length > 0) {
      const listHtml = `<ul class="list-disc ml-6 mb-4">${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`;
      lines[lines.length - listItems.length] = listHtml;
      for (let j = lines.length - listItems.length + 1; j < lines.length; j++) {
        lines[j] = '';
      }
    }
    
    html = lines.join('\n');
    
    // Replace UI variables like {{variableName}}
    html = html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
      const variable = uiTextVariables.find(v => v.key === key);
      if (variable) {
        return `<span class="bg-cyan-100 text-cyan-800 px-1 rounded" title="${key}">${variable.value}</span>`;
      }
      // Fallback: try to get from current translation system
      try {
        const value = t(key as TranslationKey);
        if (value !== key) {
          return `<span class="bg-cyan-100 text-cyan-800 px-1 rounded" title="${key}">${value}</span>`;
        }
      } catch {}
      return match;
    });
    
    return html;
  }, [uiTextVariables]);

  // File operations
  const handleRename = () => {
    if (newFileName && currentSection) {
      setFileOperations({
        type: 'rename',
        original: currentSection.title,
        target: newFileName
      });
    }
  };

  const handleMove = () => {
    if (newFilePath && currentSection) {
      setFileOperations({
        type: 'move',
        original: currentSection.id,
        target: newFilePath
      });
    }
  };

  // Commit changes with real git integration
  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    setIsCommitting(true);
    try {
      // Get GitHub token from environment or prompt user
      const token = (import.meta as any).env?.VITE_GITHUB_TOKEN || prompt('Enter GitHub token with write access to peka01/ntr-test:');
      
      if (!token) {
        alert('GitHub token is required for committing changes. Please set VITE_GITHUB_TOKEN environment variable.');
        return;
      }

      // Use internal API to commit changes (solves CORS issues)
      const apiUrl = '/api/help/commit';
      console.log(`� Committing via internal API for section: ${selectedSection}`);
      
      const commitResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sectionId: selectedSection,
          language: selectedLanguage,
          content: markdownContent,
          commitMessage: commitMessage.trim(),
          token: token
        })
      });
      
      if (!commitResponse.ok) {
        const errorData = await commitResponse.json();
        throw new Error(`API error: ${commitResponse.status} - ${errorData.error || 'Unknown error'}\n${errorData.details || ''}`);
      }
      
      const result = await commitResponse.json();
      console.log(`✅ Successfully committed via API:`, result);
      
      // Success! Reset commit state and prepare for refresh
      setCommitMessage('');
      setOriginalContent(markdownContent);
      
      // Show success message
      alert(`✅ Changes committed successfully!\n\nFile: ${result.path || 'help content'}\nCommit: ${result.commit?.sha?.substring(0, 7) || 'success'}\n\nThe help content will refresh automatically.`);
      
      // Force clear all caches before closing
      await helpService.clearAllCaches();
      
      // Add a small delay to ensure GitHub has propagated the changes
      console.log('⏳ Waiting 2 seconds for GitHub propagation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Close the editor - this will trigger the refresh from GitHub
      onClose();
      
    } catch (err) {
      console.error('Error committing to GitHub:', err);
      alert(`❌ Commit failed: ${err.message}\n\nPlease check your GitHub token has write access to peka01/ntr-test repository.`);
    } finally {
      setIsCommitting(false);
    }
  };

  // Drag and resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y
      });
    } else {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      });
    }
  }, [modalPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - (modalSize.width * window.innerWidth / 100);
      const maxY = window.innerHeight - (modalSize.height * window.innerHeight / 100);
      
      setModalPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(400, resizeStart.width + deltaX); // Min 400px
      const newHeight = Math.max(300, resizeStart.height + deltaY); // Min 300px
      
      // Convert to viewport units
      const newWidthVw = Math.min(95, (newWidth / window.innerWidth) * 100); // Max 95vw
      const newHeightVh = Math.min(95, (newHeight / window.innerHeight) * 100); // Max 95vh
      
      setModalSize({
        width: newWidthVw,
        height: newHeightVh
      });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, modalSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners for drag/resize
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection during drag/resize

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Center modal initially
  useEffect(() => {
    if (isOpen && modalPosition.x === 0 && modalPosition.y === 0) {
      const centerX = (window.innerWidth - (modalSize.width * window.innerWidth / 100)) / 2;
      const centerY = (window.innerHeight - (modalSize.height * window.innerHeight / 100)) / 2;
      setModalPosition({ x: centerX, y: centerY });
    }
  }, [isOpen, modalPosition, modalSize]);

  // Reset modal position and size with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && e.ctrlKey && isOpen) {
        e.preventDefault();
        setModalSize({ width: 80, height: 80 });
        const centerX = (window.innerWidth - (80 * window.innerWidth / 100)) / 2;
        const centerY = (window.innerHeight - (80 * window.innerHeight / 100)) / 2;
        setModalPosition({ x: centerX, y: centerY });
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl flex flex-col absolute"
        style={{
          width: `${modalSize.width}vw`,
          height: `${modalSize.height}vh`,
          left: `${modalPosition.x}px`,
          top: `${modalPosition.y}px`,
          minWidth: '400px',
          minHeight: '300px',
          maxWidth: '95vw',
          maxHeight: '95vh'
        }}
      >
        {/* Header - Draggable */}
        <div 
          className="flex items-center justify-between p-4 border-b border-slate-200 cursor-move bg-slate-50 rounded-t-lg select-none"
          onMouseDown={(e) => handleMouseDown(e, 'drag')}
          title="Drag to move • Ctrl+Esc to reset position and size"
        >
          <div className="flex items-center space-x-4">
            {/* Drag indicator */}
            <div className="flex flex-col space-y-1">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              </div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-slate-800">
              {t('helpEditor')}
            </h2>
            {currentSection && (
              <span className="text-sm text-slate-600">
                {currentSection.title}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2" onMouseDown={(e) => e.stopPropagation()}>
            {/* File operations */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder={t('helpEditorFileName')}
                className="px-2 py-1 text-sm border border-slate-300 rounded"
              />
              <button
                onClick={handleRename}
                className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                title={t('helpEditorRename')}
              >
                {t('helpEditorRename')}
              </button>
              <input
                type="text"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                placeholder={t('helpEditorFilePath')}
                className="px-2 py-1 text-sm border border-slate-300 rounded"
              />
              <button
                onClick={handleMove}
                className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                title={t('helpEditorMove')}
              >
                {t('helpEditorMove')}
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <div className={`border-r border-slate-200 transition-all duration-300 ${
            activeLeftPanel === 'none' ? 'w-0' : 'w-80'
          } overflow-hidden`}>
            {activeLeftPanel === 'ui-text' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">{t('helpEditorUITextVariables')}</h3>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="en">English</option>
                      <option value="sv">Svenska</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                    placeholder={t('helpEditorSearchVariables')}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {filteredVariables.length === 0 && variableSearch.trim() === '' ? (
                      <div className="text-center text-slate-500 py-4">
                        <p>Loading variables...</p>
                        <p className="text-xs mt-2">
                          Total loaded: {uiTextVariables.length} | Language: {selectedLanguage}
                        </p>
                      </div>
                    ) : filteredVariables.length === 0 ? (
                      <div className="text-center text-slate-500 py-4">
                        <p>No variables match your search</p>
                        <p className="text-xs mt-2">
                          Total available: {uiTextVariables.length}
                        </p>
                      </div>
                    ) : (
                      filteredVariables.map((variable) => (
                        <div
                          key={variable.key}
                          className="p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50"
                          onDoubleClick={() => insertAtCursor(`{{${variable.key}}}`)}
                          title={t('helpEditorDoubleClickInsert')}
                        >
                          <div className="font-mono text-sm text-cyan-600">
                            {variable.key}
                          </div>
                          <div className="text-sm text-slate-600 truncate">
                            {variable.value}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeLeftPanel === 'ai' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{t('helpEditorAIAssistant')}</h3>
                    <button
                      onClick={() => setAiMessages([])}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 flex items-center space-x-1"
                      title="Clear chat history"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Clear</span>
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        const alignPrompt = `[REPLACE_CONTENT]
Align this content with Spiris tone and voice guidelines:

TONE REQUIREMENTS:
- ENKLA (Simple): Use everyday language, avoid technical jargon, be intuitive and direct
- ENGAGERADE (Engaging): Be helpful, encouraging, and accessible like a knowledgeable colleague  
- MÄNSKLIGA (Human): Write conversationally, focus on real benefits, acknowledge life outside work

TERMINOLOGY:
- Use "funktioner" instead of "produkt/system/program/applikation"
- Use "plattform/ekonomiplattform" for the software
- Use "abonnemang" instead of "avtal/licens"
- Use "bokföringen/bokföring" instead of "Visma eEkonomi"
- Replace "Visma/Visma Spcs" with "Spiris"

Please rewrite to match these guidelines while keeping the same information and structure.`;
                        
                        await sendAIMessage(alignPrompt);
                      }}
                      disabled={isAiLoading || !markdownContent.trim()}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📝 Align with tone guidelines
                    </button>
                    {selectedLanguage !== 'sv' && (
                      <button
                        onClick={async () => {
                          const syncPrompt = `[REPLACE_CONTENT]
Sync this ${selectedLanguage === 'en' ? 'English' : selectedLanguage} content with the Swedish version.

Please translate the Swedish version of this help content to ${selectedLanguage === 'en' ? 'English' : selectedLanguage}, maintaining:
- The same structure and formatting
- Spiris tone and voice (simple, engaging, human)  
- Proper terminology for the target language
- Cultural appropriateness for the target audience

Keep all markdown formatting, headings, lists, and UI element references intact.`;
                          
                          await sendAIMessage(syncPrompt);
                        }}
                        disabled={isAiLoading || !markdownContent.trim()}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🌐 Sync with Swedish version
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {aiMessages.map((message, index) => (
                      <div key={index}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-100 text-blue-800 ml-4'
                              : 'bg-slate-100 text-slate-800 mr-4'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          
                          {/* Show applied changes indicator */}
                          {message.appliedChanges && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-700 text-xs font-medium">
                                  Applied: {message.appliedChanges.type.replace('_', ' ').toLowerCase()}
                                </span>
                                <span className="text-green-600 text-xs">
                                  {Math.abs(message.appliedChanges.newContent.length - message.appliedChanges.oldContent.length)} chars changed
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Keep action buttons for manual application as backup */}
                        {message.role === 'assistant' && !message.appliedChanges && (() => {
                          const actions = parseAIActions(message.content);
                          return actions.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2 mr-4">
                              {actions.map((action, actionIndex) => (
                                <button
                                  key={actionIndex}
                                  onClick={() => applyAISuggestion(action)}
                                  className="px-3 py-1 bg-cyan-500 text-white rounded text-xs hover:bg-cyan-600 transition-colors"
                                  title={`Apply ${action.type}: ${action.content.substring(0, 50)}...`}
                                >
                                  Apply {action.type.replace('_', ' ').toLowerCase()}
                                </button>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="bg-slate-100 text-slate-800 mr-4 p-3 rounded-lg">
                        <div className="animate-pulse">{t('helpEditorThinking')}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-slate-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendAIMessage(aiInput);
                    }}
                    className="flex space-x-2"
                  >
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder={t('helpEditorAIPlaceholder')}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                      disabled={isAiLoading}
                    />
                    <button
                      type="submit"
                      disabled={isAiLoading || !aiInput.trim()}
                      className="px-4 py-2 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600 disabled:opacity-50"
                    >
                      {t('helpEditorSend')}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Center - Editor and Preview */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor */}
            <div className={`flex flex-col transition-all duration-300 ${
              isPreviewVisible ? 'w-1/2' : 'w-full'
            }`}>
              {/* Editor Toolbar */}
              <div className="p-2 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => formatSelection('**')}
                    className="p-2 hover:bg-slate-100 rounded"
                    title="Bold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 010 8H6m0-8v8m0 0h8a4 4 0 010 8H6" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => formatSelection('*')}
                    className="p-2 hover:bg-slate-100 rounded"
                    title="Italic"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4v16m2-16v16" />
                    </svg>
                  </button>
                  
                  <div className="w-px h-6 bg-slate-300 mx-2"></div>
                  
                  <button
                    onClick={() => insertAtCursor('# ')}
                    className="p-2 hover:bg-slate-100 rounded text-sm font-semibold"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  
                  <button
                    onClick={() => insertAtCursor('## ')}
                    className="p-2 hover:bg-slate-100 rounded text-sm font-semibold"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  
                  <button
                    onClick={() => insertAtCursor('### ')}
                    className="p-2 hover:bg-slate-100 rounded text-sm font-semibold"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  
                  <div className="w-px h-6 bg-slate-300 mx-2"></div>
                  
                  <button
                    onClick={() => insertAtCursor('[Link text](URL)')}
                    className="p-2 hover:bg-slate-100 rounded"
                    title="Link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => insertAtCursor('![Alt text](image-url)')}
                    className="p-2 hover:bg-slate-100 rounded"
                    title="Image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  <div className="w-px h-6 bg-slate-300 mx-2"></div>
                  
                  <button
                    onClick={() => insertAtCursor('- ')}
                    className="p-2 hover:bg-slate-100 rounded"
                    title="Bullet List"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => insertAtCursor('1. ')}
                    className="p-2 hover:bg-slate-100 rounded"
                    title="Numbered List"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => insertAtCursor('| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n')}
                    className="p-2 hover:bg-slate-100 rounded"
                    title="Table"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex-1"></div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveLeftPanel(activeLeftPanel === 'ui-text' ? 'none' : 'ui-text')}
                    className={`p-2 rounded ${
                      activeLeftPanel === 'ui-text'
                        ? 'bg-cyan-100 text-cyan-600'
                        : 'hover:bg-slate-100'
                    }`}
                    title={t('helpEditorUITextVariables')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setActiveLeftPanel(activeLeftPanel === 'ai' ? 'none' : 'ai')}
                    className={`p-2 rounded ${
                      activeLeftPanel === 'ai'
                        ? 'bg-cyan-100 text-cyan-600'
                        : 'hover:bg-slate-100'
                    }`}
                    title={t('helpEditorAIAssistant')}
                  >
                    <span className="text-cyan-500 text-lg">✨</span>
                  </button>
                  
                  {/* Test Diff Button for debugging */}
                  <button
                    onClick={() => {
                      if (markdownContent.trim() === '') {
                        // If editor is empty, add some sample content first
                        setMarkdownContent(`# Help Section\n\nThis is sample content for testing.\n\n## Getting Started\n1. Step one\n2. Step two\n3. Step three`);
                      } else {
                        // Apply a small test change to existing content
                        const testChange = applyAIChange('APPEND_CONTENT', `\n\n## AI Test Addition\n\nThis section was added by the AI diff test.\n\n- Feature A\n- Feature B\n- Feature C`);
                      }
                    }}
                    className="p-2 rounded bg-orange-100 text-orange-600 hover:bg-orange-200"
                    title="Test Diff System (adds content instead of replacing)"
                  >
                    🔍
                  </button>
                  
                  {/* Reload Original Content Button */}
                  <button
                    onClick={() => {
                      if (selectedSection) {
                        loadSectionContent(selectedSection);
                      }
                    }}
                    className="p-2 rounded bg-green-100 text-green-600 hover:bg-green-200"
                    title="Reload original help content"
                  >
                    🔄
                  </button>
                  
                  <button
                    onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                    className={`p-2 rounded ${
                      isPreviewVisible
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-slate-100'
                    }`}
                    title={t('helpEditorTogglePreview')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-600">
                    <div className="text-center">
                      <p className="mb-2">{t('helpEditorErrorLoading')}</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                ) : (
                  <textarea
                    ref={editorRef}
                    value={markdownContent}
                    onChange={(e) => updateContent(e.target.value)}
                    onSelect={handleCursorPositionChange}
                    onClick={handleCursorPositionChange}
                    onKeyUp={handleCursorPositionChange}
                    placeholder={t('helpEditorMarkdownPlaceholder')}
                    className="w-full h-full p-4 border-none outline-none resize-none font-mono text-sm"
                  />
                )}
              </div>
            </div>
            
            {/* Preview */}
            {isPreviewVisible && (
              <div className="w-1/2 border-l border-slate-200 flex flex-col">
                <div className="p-2 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{t('helpEditorPreview')}</h3>
                    <div className="flex items-center space-x-2">
                      {hasUnsavedChanges && (
                        <div className="flex rounded-md border border-slate-300 overflow-hidden">
                          <button
                            onClick={() => {
                              setShowDiffInPreview(false);
                              setShowOriginalInPreview(false);
                            }}
                            className={`px-2 py-1 text-xs ${
                              !showDiffInPreview && !showOriginalInPreview
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            📄 Current
                          </button>
                          <button
                            onClick={() => {
                              setShowDiffInPreview(false);
                              setShowOriginalInPreview(true);
                            }}
                            className={`px-2 py-1 text-xs border-l border-slate-300 ${
                              showOriginalInPreview
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            📋 Original
                          </button>
                          <button
                            onClick={() => {
                              setShowDiffInPreview(true);
                              setShowOriginalInPreview(false);
                            }}
                            className={`px-2 py-1 text-xs border-l border-slate-300 ${
                              showDiffInPreview
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            🔍 Diff
                          </button>
                        </div>
                      )}
                      {showDiffInPreview && hasUnsavedChanges && (
                        <div className="flex rounded-md border border-slate-300 overflow-hidden ml-2">
                          <button
                            onClick={() => setDiffGranularity('line')}
                            className={`px-2 py-1 text-xs ${
                              diffGranularity === 'line'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                            title="Line-by-line diff (best for large changes)"
                          >
                            📝 Lines
                          </button>
                          <button
                            onClick={() => setDiffGranularity('sentence')}
                            className={`px-2 py-1 text-xs border-l border-slate-300 ${
                              diffGranularity === 'sentence'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                            title="Sentence-level diff (balanced view)"
                          >
                            📖 Sentences
                          </button>
                          <button
                            onClick={() => setDiffGranularity('word')}
                            className={`px-2 py-1 text-xs border-l border-slate-300 ${
                              diffGranularity === 'word'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                            title="Word-by-word diff (detailed view)"
                          >
                            🔤 Words
                          </button>
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        {markdownContent.length} chars
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {markdownContent.trim() === '' ? (
                    <div className="text-slate-500 italic">
                      Start writing content in the editor to see the preview...
                    </div>
                  ) : showOriginalInPreview ? (
                    <div>
                      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        📋 <strong>Original Content</strong> - This is how the content looked when you opened the editor
                      </div>
                      <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdownPreview(originalContent)
                        }}
                      />
                    </div>
                  ) : showDiffInPreview && hasUnsavedChanges ? (
                    <div>
                      <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                        🔍 <strong>Changes</strong> - Showing differences between original and current content
                      </div>
                      <div
                        className="max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: createDiffView()
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      {hasUnsavedChanges && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                          📄 <strong>Current Content</strong> - This is your edited version with unsaved changes
                        </div>
                      )}
                      <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdownPreview(markdownContent)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {fileOperations && (
                <div className="text-sm text-slate-600">
                  {t('helpEditorPendingOperation')}: {fileOperations.type} "{fileOperations.original}" → "{fileOperations.target}"
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded text-sm"
              >
                <option value="main">main</option>
                <option value="develop">develop</option>
                <option value="feature/help-updates">feature/help-updates</option>
              </select>
              
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder={t('helpEditorCommitMessage')}
                className="px-3 py-1 border border-slate-300 rounded text-sm w-64"
              />
              
              <button
                onClick={handleCommit}
                disabled={!commitMessage.trim() || isCommitting}
                className="px-4 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {isCommitting ? t('helpEditorCommitting') : t('helpEditorCommit')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
          style={{
            background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, #94a3b8 40%, #94a3b8 60%, transparent 60%)'
          }}
          title="Drag to resize"
        />
      </div>
    </div>
  );
};