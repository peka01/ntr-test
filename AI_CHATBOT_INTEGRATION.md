# AI Chatbot Integration

This document explains how to use and extend the AI chatbot that integrates with your help system and external documentation repository.

## Overview

The AI chatbot provides intelligent assistance by combining:
1. **Help Documentation**: All content from your external repository
2. **Additional Knowledge Sources**: System architecture, business rules, technical details
3. **Context Awareness**: Understands what the user is currently working on
4. **Multi-language Support**: Responds in Swedish or English based on user input

## Features

- 🤖 **Intelligent Responses**: Uses Gemini AI to provide contextual answers
- 📚 **Comprehensive Knowledge**: Accesses all help docs + additional sources
- 🔍 **Source Attribution**: Shows which sources were used for each answer
- 🌍 **Multi-language**: Supports Swedish and English
- 📱 **Responsive Design**: Works on all device sizes
- ⚡ **Real-time**: Instant responses with typing indicators

## Setup

### 1. Environment Variables

Add your Gemini API key to `.env`:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Dependencies

The system uses the `@google/genai` package. Install it if not already present:

```bash
npm install @google/genai
```

### 3. Integration

The chatbot is automatically integrated into your `HelpSystem` component. Users can access it via the AI button (lightbulb icon) in the help window header.

## Usage

### For Users

1. **Open Help System**: Click the help button (?) anywhere in the app
2. **Access AI Chat**: Click the AI button (💡) in the help window header
3. **Ask Questions**: Type your question in natural language
4. **Get Answers**: Receive intelligent responses with source citations

### Example Questions

- "Hur skapar jag en ny träningssession?"
- "Vad händer om jag avbokar en session?"
- "Hur fungerar klippkortssystemet?"
- "Vilka behörigheter har admin-användare?"
- "Hur löser jag problem med inloggning?"

### For Developers

#### Adding New Knowledge Sources

Edit `services/aiKnowledgeSources.ts` to add new sources:

```typescript
export const additionalKnowledgeSources: KnowledgeSource[] = [
  // ... existing sources ...
  {
    name: 'New Feature Name',
    content: `Detailed description of the new feature:
- Point 1
- Point 2
- Point 3`,
    keywords: ['keyword1', 'keyword2', 'feature'],
    category: 'business', // or 'system', 'technical', 'user-guide'
    priority: 8 // Higher number = higher priority
  }
];
```

#### Categories

- **system**: Core system functionality, roles, permissions
- **business**: Business rules, workflows, processes
- **technical**: Architecture, implementation details, APIs
- **user-guide**: User experience, troubleshooting, tips

#### Priority System

- **10**: Critical system information
- **9**: Important business rules
- **8**: Core features
- **7**: User guidance
- **6**: Technical details

#### Extending the Chatbot

You can modify `components/AIChatbot.tsx` to:

- Add new AI models
- Implement conversation memory
- Add file upload capabilities
- Integrate with other services
- Customize the UI/UX

## Architecture

### Components

1. **AIChatbot**: Main chatbot interface
2. **HelpSystem**: Integrated help system with AI button
3. **aiKnowledgeSources**: Configurable knowledge base
4. **helpService**: External documentation access

### Data Flow

```
User Question → AIChatbot → Context Preparation → Gemini AI → Response + Sources
```

### Context Preparation

The system prepares context by combining:

1. **Help Documentation**: All sections from external repository
2. **Additional Sources**: System knowledge from `aiKnowledgeSources.ts`
3. **Current Context**: What the user is currently working on
4. **User Language**: Swedish or English preference

## Customization

### Styling

The chatbot uses Tailwind CSS classes. You can customize:

- Colors: Modify `bg-cyan-500`, `text-slate-600`, etc.
- Layout: Adjust `max-w-4xl`, `h-[80vh]`, etc.
- Animations: Modify `animate-bounce`, `animate-spin`, etc.

### AI Model

Change the Gemini model in `AIChatbot.tsx`:

```typescript
const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
// Available models: gemini-2.0-flash-exp, gemini-2.0-flash, gemini-1.5-flash
```

### System Prompt

Customize the AI behavior by modifying the `systemPrompt` in `AIChatbot.tsx`:

```typescript
const systemPrompt = `Du är en hjälpsam AI-assistent för ett träningshanteringssystem...

// Add your custom instructions here
`;
```

## Best Practices

### Knowledge Sources

1. **Be Specific**: Use clear, descriptive content
2. **Keywords**: Include relevant search terms
3. **Structure**: Use bullet points and clear formatting
4. **Priority**: Set appropriate priority levels
5. **Categories**: Use consistent categorization

### Content Updates

1. **Regular Updates**: Keep knowledge sources current
2. **Version Control**: Track changes in your repository
3. **Testing**: Verify AI responses after updates
4. **User Feedback**: Incorporate common questions

### Performance

1. **API Limits**: Monitor Gemini API usage
2. **Caching**: Consider implementing response caching
3. **Rate Limiting**: Add user rate limiting if needed
4. **Error Handling**: Graceful fallbacks for API failures

## Troubleshooting

### Common Issues

1. **API Key Error**: Check `VITE_GEMINI_API_KEY` environment variable
2. **No Response**: Verify internet connection and API status
3. **Poor Answers**: Review and update knowledge sources
4. **Language Issues**: Check language context and prompts

### Debug Mode

Enable console logging by checking the browser console for:

- API requests and responses
- Context preparation details
- Source extraction results
- Error messages and stack traces

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **User Input**: Sanitize user input before sending to AI
3. **Data Privacy**: Ensure no sensitive data is sent to external APIs
4. **Rate Limiting**: Implement appropriate usage limits

## Future Enhancements

### Planned Features

- [ ] Conversation history persistence
- [ ] File upload and analysis
- [ ] Voice input/output
- [ ] Integration with user analytics
- [ ] Custom AI model training

### Integration Opportunities

- **Analytics**: Track common questions and user satisfaction
- **Feedback System**: Allow users to rate AI responses
- **Knowledge Gaps**: Identify areas needing documentation
- **User Onboarding**: Guided tours and tutorials

## Support

For technical support or questions about the AI chatbot integration:

1. Check this documentation
2. Review the code comments
3. Check browser console for errors
4. Verify API key and permissions
5. Test with simple questions first

## Contributing

To contribute to the AI chatbot system:

1. Follow the existing code structure
2. Add comprehensive documentation
3. Include relevant test cases
4. Update this README as needed
5. Test thoroughly before submitting

---

*This AI chatbot integration provides intelligent, contextual assistance by combining your external documentation with comprehensive system knowledge.*
