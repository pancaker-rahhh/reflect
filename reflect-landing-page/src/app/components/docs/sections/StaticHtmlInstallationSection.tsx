import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const StaticHtmlInstallationSection = () => {
    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to my website!</h1>
    <p>Your content here...</p>

    <!-- Feedback Widget -->
    <script
        defer
        src="https://cdn.feedbask.com/widget.js"
        data-client-key="YOUR_WIDGET_ID"
        data-language="en"
        id="feedbask-widget-script"
    ></script>
</body>
</html>`;

    return (
        <section id="static-html-installation" className="mb-16">
            <DocsHeader
                title="Static HTML Installation"
                description=""
            />
            <ContentCard>
                <p className="text-gray-600 mb-4">For static HTML websites, add the script directly to your HTML files before the closing <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag:</p>
                <CodeBlock code={htmlCode} />
                <div className="mt-4 bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-lg">
                    <strong>Simple Setup:</strong> Just replace <code className="bg-green-100 text-green-900 px-1.5 py-0.5 rounded">YOUR_WIDGET_ID</code> with your actual widget ID and you're ready to go!
                </div>
            </ContentCard>
        </section>
    );
};

export default StaticHtmlInstallationSection;
