import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, ChevronRight, Brain } from 'lucide-react';

const AIInsights = ({ onAnalyze, analysis, isLoading }) => {
    const [customQuestion, setCustomQuestion] = useState('');
    const [selectedPreset, setSelectedPreset] = useState(null);

    const presetQuestions = [
        { id: 1, text: 'Why is there congestion?', question: 'Analyze the current traffic congestion and identify the main causes.' },
        { id: 2, text: 'Reduce power usage', question: 'Suggest specific strategies to reduce electricity consumption across zones.' },
        { id: 3, text: 'Air quality concerns', question: 'Identify zones with poor air quality and recommend immediate actions.' },
        { id: 4, text: 'Overall city health', question: 'Provide a comprehensive assessment of the city\'s current status and health.' },
    ];

    const handlePresetClick = (preset) => {
        setSelectedPreset(preset.id);
        onAnalyze(preset.question);
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (customQuestion.trim()) {
            setSelectedPreset(null);
            onAnalyze(customQuestion);
            setCustomQuestion('');
        }
    };

    return (
        <div className="glass-card p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Insights</h2>
                    <p className="text-xs text-slate-500">Powered by Gemini</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                {presetQuestions.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-all
              ${selectedPreset === preset.id
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'}
              border disabled:opacity-50`}
                    >
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{preset.text}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleCustomSubmit} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Ask a custom question..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !customQuestion.trim()}
                        className="px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30"></div>
                            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
                        </div>
                        <p className="text-slate-400 text-sm">Analyzing city data...</p>
                    </div>
                ) : analysis ? (
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-300">AI Analysis</span>
                        </div>
                        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {analysis}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Sparkles className="w-10 h-10 mb-3 opacity-50" />
                        <p className="text-sm text-center">Select a question or ask your own<br />to get AI-powered insights</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsights;
