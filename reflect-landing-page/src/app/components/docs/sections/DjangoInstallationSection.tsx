import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const DjangoInstallationSection = () => {
    const djangoCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}My Django App{% endblock %}</title>
</head>
<body>
    {% block content %}
    {% endblock %}

    <!-- Feedback Widget -->
    <script
        defer
        src="https://cdn.feedbask.com/widget.js"
        data-client-key="{{ FEEDBASK_WIDGET_ID }}"
        data-language="en"
        id="feedbask-widget-script"
    ></script>
</body>
</html>`;

    const settingsCode = `FEEDBASK_WIDGET_ID = 'your_actual_widget_id'`;

    return (
        <section id="django-installation" className="mb-16">
            <DocsHeader
                title="Django Installation"
                description=""
            />
            <ContentCard>
                <p className="text-gray-600 mb-4">Add the script to your base template (typically <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">templates/base.html</code>):</p>
                <CodeBlock code={djangoCode} />
            </ContentCard>
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Configuration</h3>
                <p className="text-gray-600 mb-4">Add this to your Django settings file (usually <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">settings.py</code>):</p>
                <div className="bg-gray-100 p-4 rounded">
                    <pre className="text-sm text-gray-800">{settingsCode}</pre>
                </div>
                <p className="text-sm text-gray-600 mt-4">Don't forget to add <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">'FEEDBASK_WIDGET_ID': FEEDBASK_WIDGET_ID</code> to your template context processors if needed.</p>
            </ContentCard>
        </section>
    );
};

export default DjangoInstallationSection;
