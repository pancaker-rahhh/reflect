import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import Note from '@/app/components/docs/Note';

const ShopifyInstallationSection = () => {
    return (
        <section id="shopify-installation" className="mb-16">
            <DocsHeader
                title="Shopify Installation"
                description=""
            />
            <ContentCard>
                <ol className="list-decimal list-inside text-gray-600 space-y-3">
                    <li>Go to your Shopify admin panel</li>
                    <li>Navigate to <strong>Online Store → Themes</strong></li>
                    <li>Click <strong>Actions → Edit code</strong> for your active theme</li>
                    <li>Open the <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">theme.liquid</code> file</li>
                    <li>Scroll to the bottom and find the <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag</li>
                    <li>Paste the Feedback script just before the closing body tag</li>
                    <li>Click <strong>Save</strong></li>
                </ol>
                <Note>
                    <strong>Warning:</strong> Always backup your theme before making changes. Consider creating a duplicate theme for testing.
                </Note>
            </ContentCard>
        </section>
    );
};

export default ShopifyInstallationSection;
