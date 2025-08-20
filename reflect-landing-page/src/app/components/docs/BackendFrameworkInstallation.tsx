import React, { useState } from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import CodeBlock from '@/app/components/docs/CodeBlock';
import TabbedCodeBlock from '@/app/components/docs/TabbedCodeBlock';

interface Method {
    id: string;
    label: string;
    description: string;
    steps?: string[];
    code: string;
}

interface BackendFrameworkInstallationProps {
    title: string;
    logo: React.ReactNode;
    methods: Method[];
}

const BackendFrameworkInstallation: React.FC<BackendFrameworkInstallationProps> = ({ title, logo, methods }) => {
    // We need to customize the TabbedCodeBlock to show more than just code
    const [activeTab, setActiveTab] = useState(methods[0].id);
    const activeMethod = methods.find(method => method.id === activeTab);

    return (
        <section className="mb-16">
            <div className="flex items-center mb-6">
                {logo}
                <DocsHeader title={`${title} Installation`} description={`Integrate the feedback widget with your ${title} project.`} />
            </div>

            <div className="my-6">
                <div className="flex border-b border-gray-200">
                    {methods.map(method => (
                        <button
                            key={method.id}
                            onClick={() => setActiveTab(method.id)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === method.id
                                    ? 'border-b-2 border-purple-600 text-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>
                <div className="pt-6">
                    {activeMethod && (
                        <div>
                            <p className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: activeMethod.description }}></p>
                            {activeMethod.steps && (
                                <ol className="list-decimal list-inside text-gray-600 space-y-3 my-4">
                                    {activeMethod.steps.map((step, index) => (
                                        <li key={index} dangerouslySetInnerHTML={{ __html: step }}></li>
                                    ))}
                                </ol>
                            )}
                            <CodeBlock language="php" code={activeMethod.code} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BackendFrameworkInstallation;
