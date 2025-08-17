import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';

const TroubleshootingSection = () => {
    return (
        <section id="troubleshooting" className="mb-16">
            <DocsHeader
                title="Troubleshooting"
                description=""
            />
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Widget Not Appearing</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Verify you've replaced <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">YOUR_WIDGET_ID</code> with your actual Widget ID.</li>
                    <li>Check that the script is placed before the closing <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag.</li>
                    <li>Clear your browser cache and try in an incognito window.</li>
                    <li>Check the browser console for any JavaScript errors.</li>
                </ul>
            </ContentCard>
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Widget Not Responding</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Ensure JavaScript is enabled in your browser.</li>
                    <li>Check for conflicting scripts that might prevent the widget from loading.</li>
                    <li>Verify your widget is active in the dashboard.</li>
                    <li>Test on a different browser or device.</li>
                </ul>
            </ContentCard>
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Console Errors</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Open your browser's developer console (F12).</li>
                    <li>Look for any red error messages.</li>
                    <li>Common errors include incorrect widget ID or network issues.</li>
                    <li>Contact support with any error messages for help.</li>
                </ul>
            </ContentCard>
        </section>
    );
};

export default TroubleshootingSection;
