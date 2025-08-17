'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // or your preferred theme

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'html' }) => {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            // Ensure the language is registered before highlighting
            if (language && hljs.getLanguage(language)) {
                codeRef.current.innerHTML = hljs.highlight(code, { language }).value;
            } else {
                // Auto-highlight if language is not specified or not registered
                codeRef.current.innerHTML = hljs.highlightAuto(code).value;
            }
        }
    }, [code, language]);

    return (
        <div className="rounded-lg bg-[#2D2D2D] p-4">
            <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed whitespace-pre">
                <code ref={codeRef} className={`language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default CodeBlock;
