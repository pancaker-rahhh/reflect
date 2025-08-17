import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';
import InfoBox from '@/app/components/docs/InfoBox';

const WordPressInstallationSection = () => {
    const pluginCode = `<script
    defer
    src="https://cdn.reflect.com/widget.js"
    data-client-key="YOUR_WIDGET_ID"
    data-language="en"
    id="reflect-widget-script"
    ></script>`;

    const functionsCode = `function add_feedback_widget() {
    ?>
    <script
      defer
      src="https://cdn.reflect.com/widget.js"
      data-client-key="YOUR_WIDGET_ID"
      data-language="en"
      id="reflect-widget-script"
    ></script>
    <?php
}
add_action('wp_footer', 'add_feedback_widget');`;

    return (
        <section id="wordpress-installation" className="mb-16">
            <DocsHeader
                title="WordPress Installation"
                description=""
            />
            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Method 1: Using a Plugin (Recommended)</h3>
                <ol className="list-decimal list-inside text-gray-600 space-y-3">
                    <li>Install a code injection plugin like <a href="#" className="text-purple-600 hover:underline">WPCode (Insert Headers and Footers)</a> or <a href="#" className="text-purple-600 hover:underline">Code Snippets</a>.</li>
                    <li>Go to <strong>Code Snippets → Add Snippet</strong> (or similar in your chosen plugin).</li>
                    <li>Choose "Add Your Custom Code (New Snippet)".</li>
                    <li>Select "HTML Snippet" as the code type.</li>
                    <li>Give your snippet a descriptive name like "Feedback Feedback Widget".</li>
                    <li>Paste the feedback script in the code editor:</li>
                </ol>
                <div className="my-4">
                    <CodeBlock code={pluginCode} />
                </div>
                <ol className="list-decimal list-inside text-gray-600 space-y-3" start={7}>
                    <li>Set location to "Footer" and activate the snippet.</li>
                    <li>Test the widget by visiting your website (may need to clear cache).</li>
                </ol>
                <InfoBox>
                    <p className="text-sm text-blue-700"><strong>Pro Tip:</strong> This method is theme-independent, so your widget will persist even if you change themes.</p>
                </InfoBox>
            </ContentCard>

            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Method 2: Theme Functions</h3>
                <p className="text-gray-600 mb-4">Add this code to your theme's <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">functions.php</code> file (usually found in <strong>Appearance → Theme Editor</strong>):</p>
                <CodeBlock code={functionsCode} />
            </ContentCard>
        </section>
    );
};

export default WordPressInstallationSection;
