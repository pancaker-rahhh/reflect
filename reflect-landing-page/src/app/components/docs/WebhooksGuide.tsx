'use client';

import React, { useState } from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import CodeBlock from '@/app/components/docs/CodeBlock';
import DosAndDontsCard from '@/app/components/docs/DosAndDontsCard';
import { bugReportPayload, featureRequestPayload, testWebhookPayload, slackIntegrationCode } from './webhook-payloads';

const Overview = () => (
    <div>
        <p className="text-gray-600 mb-4">Webhooks allow you to receive real-time HTTP notifications for events in your feedback program, enabling seamless integration with tools like Slack, Jira, and more.</p>
    </div>
);

const Payloads = () => {
    const [activePayload, setActivePayload] = useState('bug');
    const payload = activePayload === 'bug' ? bugReportPayload : activePayload === 'feature' ? featureRequestPayload : testWebhookPayload;

    return (
        <div>
            <div className="flex items-center mb-4">
                <select onChange={(e) => setActivePayload(e.target.value)} className="border rounded-md p-2">
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="test">Test Payload</option>
                </select>
            </div>
            <CodeBlock code={payload} language="json" />
        </div>
    );
};

const Security = () => {
    const items = [
        { text: 'All webhook URLs are encrypted at rest.', isDo: true },
        { text: 'Never expose your webhook URLs on the client-side.', isDo: false },
        { text: 'HTTPS is required for all production webhook endpoints.', isDo: true },
        { text: 'Bypass HTTPS for quick local testing.', isDo: false },
        { text: 'We enforce a 10-second timeout for all webhook requests.', isDo: true },
        { text: 'Assume webhook deliveries are always instantaneous.', isDo: false },
    ];
    return <DosAndDontsCard title="Security & Best Practices" items={items} />;
};

const SlackGuide = () => (
    <div>
        <h3 className="text-xl font-semibold mb-4">Slack Integration Guide</h3>
        <p className="mb-4">Follow these steps to send feedback notifications to a Slack channel.</p>
        <CodeBlock code={slackIntegrationCode} language="javascript" />
    </div>
);

const WebhooksGuide = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'payloads': return <Payloads />;
            case 'security': return <Security />;
            case 'slack': return <SlackGuide />;
            case 'overview': default: return <Overview />;
        }
    };

    return (
        <section id="webhooks" className="mb-16">
            <DocsHeader title="Webhooks Guide" description="Receive real-time notifications and integrate feedback into your workflows." />

            <div className="mt-8">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>Overview</button>
                    <button onClick={() => setActiveTab('payloads')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'payloads' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>Payloads</button>
                    <button onClick={() => setActiveTab('security')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'security' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>Security</button>
                    <button onClick={() => setActiveTab('slack')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'slack' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>Slack Guide</button>
                </div>
                <div className="pt-6">
                    {renderContent()}
                </div>
            </div>
        </section>
    );
};

export default WebhooksGuide;
