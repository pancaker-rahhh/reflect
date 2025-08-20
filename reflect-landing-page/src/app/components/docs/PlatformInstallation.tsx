import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import CodeBlock from '@/app/components/docs/CodeBlock';

interface Step {
    title: string;
    description: string;
    code?: string;
    image?: string;
}

interface PlatformInstallationProps {
    title: string;
    logo: React.ReactNode;
    steps: Step[];
}

const PlatformInstallation: React.FC<PlatformInstallationProps> = ({ title, logo, steps }) => {
    return (
        <section className="mb-16">
            <div className="flex items-center mb-6">
                {logo}
                <DocsHeader title={`${title} Installation`} description={`Follow these steps to integrate the widget with your ${title} site.`} />
            </div>

            <div className="space-y-8">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 font-bold text-lg">{index + 1}</div>
                        <div className="ml-6 flex-grow">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                            <p className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: step.description }}></p>
                            {step.image && <img src={step.image} alt={`Step ${index + 1}`} className="rounded-lg border shadow-sm my-4" />}
                            {step.code && <CodeBlock code={step.code} />}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PlatformInstallation;
