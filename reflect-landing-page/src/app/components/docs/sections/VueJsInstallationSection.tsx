import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const VueJsInstallationSection = () => {
    const vueCode = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Vue App</title>
  </head>
  <body>
    <div id="app"></div>

    <!-- Feedback widget -->
    <script
      defer
      src="https://cdn.feedbask.com/widget.js"
      data-client-key="YOUR_WIDGET_ID"
      data-language="en"
      id="feedbask-widget-script"
    ></script>

    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;

    const nuxtCode = `export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          defer: true,
          src: 'https://cdn.feedbask.com/widget.js',
          'data-client-key': 'YOUR_WIDGET_ID',
          'data-language': 'en',
          id: 'feedbask-widget-script'
        }
      ]
    }
  }
})`;

    return (
        <section id="vuejs-installation" className="mb-16">
            <DocsHeader
                title="Vue.js Installation"
                description=""
            />
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Vue 3 with Vite</h3>
                <p className="text-gray-600 mb-4">Add the script to your <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">index.html</code> file:</p>
                <CodeBlock code={vueCode} />
            </ContentCard>
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Nuxt.js</h3>
                <p className="text-gray-600 mb-4">Add the script to your <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">nuxt.config.ts</code>:</p>
                <CodeBlock code={nuxtCode} />
            </ContentCard>
        </section>
    );
};

export default VueJsInstallationSection;
