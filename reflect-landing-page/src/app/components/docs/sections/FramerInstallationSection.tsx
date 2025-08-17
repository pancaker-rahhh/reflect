import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';

const FramerInstallationSection = () => {
    return (
        <section id="framer-installation" className="mb-16">
            <DocsHeader
                title="Framer Installation"
                description=""
            />
            <ContentCard>
                <ol className="list-decimal list-inside text-gray-600 space-y-3">
                    <li>Open your Framer project</li>
                    <li>Click on the <strong>Settings</strong> icon in the toolbar</li>
                    <li>Go to the <strong>General</strong> tab</li>
                    <li>Scroll down to find the <strong>Custom Code</strong> section</li>
                    <li>Click <strong>End of &lt;/body&gt; tag</strong></li>
                    <li>Paste the Feedback script code</li>
                    <li>Click <strong>Save</strong></li>
                    <li>Publish your site</li>
                </ol>
            </ContentCard>
        </section>
    );
};

export default FramerInstallationSection;
