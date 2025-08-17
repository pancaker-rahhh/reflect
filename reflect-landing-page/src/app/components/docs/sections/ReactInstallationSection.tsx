import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const ReactInstallationSection = () => {
    const reactCode = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My React App</title>
  </head>
  <body>
    <div id="root"></div>

    <!-- Feedback widget -->
    <script
      defer
      src="https://cdn.reflect.com/widget.js"
      data-client-key="YOUR_WIDGET_ID"
      data-language="en"
      id="reflect-widget-script"
    ></script>

    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    return (
        <section id="react-installation" className="mb-16">
            <DocsHeader
                title="React Installation"
                description=""
            />
            <ContentCard>
                <p className="text-gray-600 mb-4">Add the script to your <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">index.html</code> file:</p>
                <CodeBlock code={reactCode} />
            </ContentCard>
        </section>
    );
};

export default ReactInstallationSection;
