import React from 'react';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const GeneralInstallationSection = () => {
    const embedCode = `<script
    defer
    src="https://cdn.feedbask.com/widget.js"
    data-client-key="YOUR_WIDGET_ID"
    data-language="en"
    id="feedbask-widget-script"
    ></script>`;

    return (
        <section id="general-installation" className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">General Installation</h2>
            <ContentCard>
                <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">1</div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Your Widget ID</h3>
                        <p className="mb-3 text-gray-600">First, you need the unique ID for the specific widget you want to embed.</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Navigate to the <a href="#" className="text-purple-600 hover:underline font-semibold">Widgets</a> page in your dashboard.</li>
                            <li>Select the widget you wish to install.</li>
                            <li>On the widget details page, find the "Installation" section.</li>
                            <li>Your unique <span className="font-semibold text-gray-800">Widget ID</span> (also called Client Key) will be displayed there. Copy it.</li>
                        </ul>
                    </div>
                </div>
            </ContentCard>

            <ContentCard>
                <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">2</div>
                    <div className="ml-4 flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Copy the Embed Code</h3>
                        <p className="mb-4 text-gray-600">This code snippet will load the widget on your site.</p>
                        <CodeBlock code={embedCode} />
                        <p className="text-sm text-gray-600 mt-4">
                            Remember to replace <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">YOUR_WIDGET_ID</code> with your actual Widget ID from Step 1.
                        </p>
                    </div>
                </div>
            </ContentCard>
        </section>
    );
};

export default GeneralInstallationSection;
