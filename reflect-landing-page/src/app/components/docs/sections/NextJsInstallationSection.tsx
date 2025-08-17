import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';

const NextJsInstallationSection = () => {
    const appRouterCode = `import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          id="feedbask-widget-script"
          strategy="lazyOnload"
          src="https://cdn.feedbask.com/widget.js"
          data-client-key="YOUR_WIDGET_ID"
          data-language="en"
        />
      </body>
    </html>
  )
}`;

    const pagesRouterCode = `import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <script
          id="feedbask-widget-script"
          strategy="lazyOnload"
          src="https://cdn.feedbask.com/widget.js"
          data-client-key="YOUR_WIDGET_ID"
          data-language="en"
        />
      </body>
    </Html>
  )
}`;

    return (
        <section id="nextjs-installation" className="mb-16">
            <DocsHeader
                title="Next.js Installation"
                description=""
            />
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">App Router (Recommended)</h3>
                <p className="text-sm text-gray-600 mb-4">For Next.js 13+ with the App Router</p>
                <p className="text-gray-600 mb-4">Add the script to your root layout file (<code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">app/layout.tsx</code>):</p>
                <CodeBlock code={appRouterCode} />
            </ContentCard>

            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Pages Router</h3>
                <p className="text-sm text-gray-600 mb-4">For Next.js with the traditional Pages Router</p>
                <p className="text-gray-600 mb-4">Add the script to your <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">pages/_document.tsx</code> file:</p>
                <CodeBlock code={pagesRouterCode} />
            </ContentCard>
        </section>
    );
};

export default NextJsInstallationSection;
