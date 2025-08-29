import React from 'react';

interface InputFormProps {
    projectIdea: string;
    setProjectIdea: (idea: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ projectIdea, setProjectIdea, onGenerate, isLoading }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
            <label htmlFor="project-idea" className="block text-lg font-medium text-slate-600 mb-2">
                Describe your project idea
            </label>
            <textarea
                id="project-idea"
                rows={4}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
                placeholder="e.g., A mobile app that helps users find the best local coffee shops..."
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                disabled={isLoading}
            />
            <button
                onClick={onGenerate}
                disabled={isLoading || !projectIdea}
                className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isLoading ? 'Generating...' : 'Generate Plan'}
            </button>
        </div>
    );
};