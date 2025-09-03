import React, { useState } from 'react';
import { HelpSystem } from './HelpSystem';

export const IntegratedAIDemo: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Integrated AI Chat Demo</h1>
      
      <div className="space-y-4">
        <p className="text-lg text-gray-700">
          This demo shows the AI chatbot integrated directly into the help system footer.
          The AI chat is now a search field at the bottom of the help window.
        </p>
        
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Open Help System with AI Chat
        </button>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">New Features:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>🤖 AI chat integrated in help window footer</li>
            <li>🔍 Search field for asking questions</li>
            <li>📚 Uses all help documentation + additional knowledge</li>
            <li>🌍 Multi-language support (Swedish/English)</li>
            <li>📱 Always accessible while browsing help</li>
            <li>⚡ No need to open separate modal</li>
          </ul>
        </div>
        
        <div className="mt-8 p-4 bg-blue-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">How to Use:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Open Help System with AI Chat" above</li>
            <li>Browse help documentation as usual</li>
            <li>Scroll to bottom to see AI chat field</li>
            <li>Type your question and press "Fråga"</li>
            <li>Get AI-powered answers with source citations</li>
          </ol>
        </div>
        
        <div className="mt-8 p-4 bg-green-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Example Questions:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>"Hur skapar jag en ny träningssession?"</li>
            <li>"Vad händer om jag avbokar en session?"</li>
            <li>"Hur fungerar klippkortssystemet?"</li>
            <li>"Vilka behörigheter har admin-användare?"</li>
            <li>"Hur löser jag problem med inloggning?"</li>
          </ul>
        </div>
      </div>

      <HelpSystem
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        context="demo"
        isAdmin={false}
      />
    </div>
  );
};
