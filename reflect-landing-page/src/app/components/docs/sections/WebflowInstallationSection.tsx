import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import Note from '@/app/components/docs/Note';

const WebflowInstallationSection = () => {
    return (
        <section id="webflow-installation" className="mb-16">
            <DocsHeader
                title="Webflow Installation"
                description=""
            />
            <ContentCard>
                <ol className="list-decimal list-inside text-gray-600 space-y-3">
                    <li>Open your Webflow project in the Designer</li>
                    <li>Go to <strong>Project Settings</strong> (gear icon in the top left)</li>
                    <li>Navigate to the <strong>Custom Code</strong> tab</li>
                    <li>Scroll down to the <strong>Footer Code</strong> section</li>
                    <li>Paste the Feedback script code</li>
                    <li>Click <strong>Save Changes</strong></li>
                    <li>Publish your site for the changes to take effect</li>
                </ol>
                <Note>
                    <strong>Note:</strong> The widget will only appear on your published site, not in the Webflow Designer preview.
                </Note>
            </ContentCard>
        </section>
    );
};

export default WebflowInstallationSection;
