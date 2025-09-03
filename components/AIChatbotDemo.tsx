import React, { useState } from 'react';
import { AIChatbot } from './AIChatbot';

export const AIChatbotDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">AI Chatbot Demo</h1>
      
      <div className="space-y-4">
        <p className="text-lg text-gray-700">
          This is a demo of the AI chatbot integration. Click the button below to test it.
        </p>
        
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Open AI Chatbot
        </button>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Features:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>🤖 Intelligent responses using Gemini AI</li>
            <li>📚 Access to all help documentation</li>
            <li>🔍 Additional knowledge sources</li>
            <li>🌍 Multi-language support (Swedish/English)</li>
            <li>📱 Responsive design</li>
            <li>⚡ Real-time typing indicators</li>
          </ul>
        </div>
        
        <div className="mt-8 p-4 bg-blue-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Example Questions:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>"Hur skapar jag en ny träningssession?"</li>
            <li>"Vad händer om jag avbokar en session?"</li>
            <li>"Hur fungerar klippkortssystemet?"</li>
            <li>"Vilka behörigheter har admin-användare?"</li>
          </ul>
        </div>
      </div>

      <AIChatbot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context="demo"
        helpSections={[]}
      />
    </div>
  );
};
