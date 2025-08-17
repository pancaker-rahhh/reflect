'use client';
import React, { useState } from 'react';
import { Copy, Check, Sparkles, ChevronDown } from 'lucide-react';

interface PromptCardProps {
    prompt: string;
}

const PromptCard = ({ prompt }: PromptCardProps) => {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card from collapsing when copy is clicked
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <Sparkles className="h-6 w-6 text-purple-500 mr-3" />
                    <div>
                        <h4 className="font-semibold text-gray-800">Copy this prompt into Cursor AI to implement this feature</h4>
                        <p className="text-sm text-gray-600">Click to {isExpanded ? 'collapse' : 'expand'} and see the full prompt</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handleCopy}
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm font-semibold mr-4"
                    >
                        {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                        {copied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                    <ChevronDown className={`h-5 w-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{prompt}</pre>
                </div>
            )}
        </div>
    );
};

export default PromptCard;
