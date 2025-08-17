import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const LaravelInstallationSection = () => {
    const laravelCode = `<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    @yield('content')

    <!-- Feedback widget -->
    <script
        defer
        src="https://cdn.feedbask.com/widget.js"
        data-client-key="{{ env('FEEDBASK_WIDGET_ID') }}"
        data-language="en"
        id="feedbask-widget-script"
    ></script>
</body>
</html>`;

    const envCode = `FEEDBASK_WIDGET_ID=your_actual_widget_id`;

    return (
        <section id="laravel-installation" className="mb-16">
            <DocsHeader
                title="Laravel Installation"
                description=""
            />
            <ContentCard>
                <p className="text-gray-600 mb-4">Add the script to your main layout file (typically <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">resources/views/layouts/app.blade.php</code>):</p>
                <CodeBlock code={laravelCode} />
            </ContentCard>
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Environment Configuration</h3>
                <p className="text-gray-600 mb-4">Add the following line to your <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">.env</code> file:</p>
                <CodeBlock code={envCode} />
            </ContentCard>
        </section>
    );
};

export default LaravelInstallationSection;
