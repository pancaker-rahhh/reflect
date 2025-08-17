'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
            <pre className="p-4 text-sm text-white overflow-x-auto font-mono">{code}</pre>
            <button
                onClick={handleCopy}
                className="flex items-center w-full py-2 px-4 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
            >
                <div className="flex items-center">
                    {copied ? <Check size={16} className="mr-2 text-green-400" /> : <Copy size={16} className="mr-2" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                </div>
            </button>
        </div>
    );
};

export default CodeBlock;
