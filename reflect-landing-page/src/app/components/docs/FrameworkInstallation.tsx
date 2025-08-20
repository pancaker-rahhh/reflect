import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import CodeBlock from '@/app/components/docs/CodeBlock';
import TabbedCodeBlock from '@/app/components/docs/TabbedCodeBlock';

interface Step {
    title: string;
    description: string;
    code?: string;
}

interface Tab {
    id: string;
    label: string;
    language: string;
    code: string;
}

interface FrameworkInstallationProps {
    title: string;
    logo: React.ReactNode;
    steps?: Step[];
    tabs?: Tab[];
}

const FrameworkInstallation: React.FC<FrameworkInstallationProps> = ({ title, logo, steps, tabs }) => {
    return (
        <section className="mb-16">
            <div className="flex items-center mb-6">
                {logo}
                <DocsHeader title={`${title} Installation`} description={`Integrate the feedback widget into your ${title} application.`} />
            </div>

            {steps && (
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div key={index} className="border rounded-lg p-6 bg-white shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{`${index + 1}. ${step.title}`}</h3>
                            <p className="text-gray-600 mb-4">{step.description}</p>
                            {step.code && <CodeBlock code={step.code} />}
                        </div>
                    ))}
                </div>
            )}

            {tabs && <TabbedCodeBlock tabs={tabs} />}
        </section>
    );
};

export default FrameworkInstallation;
