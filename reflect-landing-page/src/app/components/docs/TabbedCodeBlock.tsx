'use client';

import React, { useState } from 'react';
import CodeBlock from './CodeBlock';

interface Tab {
    id: string;
    label: string;
    language: string;
    code: string;
}

interface TabbedCodeBlockProps {
    tabs: Tab[];
}

const TabbedCodeBlock: React.FC<TabbedCodeBlockProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="my-6">
            <div className="flex border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'border-b-2 border-purple-600 text-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="pt-4">
                {activeTabData && <CodeBlock language={activeTabData.language} code={activeTabData.code} />}
            </div>
        </div>
    );
};

export default TabbedCodeBlock;
