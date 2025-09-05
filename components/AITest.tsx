import React, { useState } from 'react';

export const AITest: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setResponse('❌ Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment.');
        return;
      }

      // Import GoogleGenAI dynamically
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `Du är en hjälpsam AI-assistent för ett träningshanteringssystem. 

Systemet har följande huvudfunktioner:
- Användarhantering med admin- och vanliga användare
- Träningssessioner som användare kan prenumerera på
- Klippkortssystem för att hantera krediter
- Incheckningshantering för träningssessioner

Svara på svenska om användaren skriver på svenska, annars på engelska.
Var hjälpsam, vänlig och professionell.

Användarens fråga: ${question}`;

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: systemPrompt,
      });

      const text = result.text.trim();

      setResponse(text);
    } catch (error) {
      console.error('AI Error:', error);
      setResponse(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Chat Test</h1>
      
      <div className="space-y-4">
        <p className="text-lg text-gray-700">
          This is a simple test to verify the AI chat functionality works independently.
        </p>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ask a question about the training management system:
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Hur skapar jag en ny träningssession?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onKeyPress={(e) => e.key === 'Enter' && testAI()}
          />
        </div>
        
        <button
          onClick={testAI}
          disabled={loading || !question.trim()}
          className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Asking AI...' : 'Ask AI'}
        </button>
        
        {response && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">AI Response:</h3>
            <div className="text-gray-700 whitespace-pre-wrap">{response}</div>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Test Questions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• "Hur skapar jag en ny träningssession?"</li>
            <li>• "Vad händer om jag avbokar en session?"</li>
            <li>• "Hur fungerar klippkortssystemet?"</li>
            <li>• "Vilka behörigheter har admin-användare?"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
