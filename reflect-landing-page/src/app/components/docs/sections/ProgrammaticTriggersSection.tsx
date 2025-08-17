import React from 'react';
import ContentCard from '@/app/components/docs/ContentCard';
import CodeBlock from '@/app/components/docs/CodeBlock';
import InfoBox from '@/app/components/docs/InfoBox';
import Note from '@/app/components/docs/Note';
import GuidelinesCard from '@/app/components/docs/GuidelinesCard';

const ProgrammaticTriggersSection = () => {
    const bestPractices = [
        "Always check widget availability before calling functions",
        "Use proper error handling to prevent JavaScript errors",
        "Implement loading states to provide user feedback",
        "Test on multiple devices and browsers",
        "Use meaningful timing - trigger feedback at relevant moments",
        "Provide visual cues when feedback is being requested",
    ];

    const commonMistakes = [
        "Calling functions immediately on page load without checking readiness",
        "No error handling - causing JavaScript errors when widget fails to load",
        "Showing feedback too frequently to the same user",
        "Interrupting user workflows with poorly timed feedback requests",
        "Not testing on mobile devices or different screen sizes",
        "Not providing fallbacks when widget fails to load",
    ];

    return (
        <section id="programmatic-triggers" className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Programmatic Triggers</h2>

            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Widget Control</h3>
                <p className="text-gray-600">Take complete control over when your feedback widget appears by using programmatic triggers.</p>
                <p className="text-gray-600 mt-2">By default, the widget shows a floating feedback button that users can click. However, you can configure the widget to be hidden by default and only show it when you call a JavaScript function. This is perfect for integrating feedback collection into your existing UI workflow and creating custom user experiences.</p>

                <InfoBox>
                    <h4 className="font-semibold text-blue-800 mb-2">Common Use Cases</h4>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        <li><strong>Post-purchase feedback:</strong> Show feedback form after successful checkout</li>
                        <li><strong>Navigation integration:</strong> Add "Give Feedback" button to your menu</li>
                        <li><strong>Custom workflows:</strong> Trigger feedback collection on specific user actions</li>
                        <li><strong>Thank you pages:</strong> Display feedback form on completion pages</li>
                        <li><strong>Help desk integration:</strong> Embed in support workflows</li>
                        <li><strong>Contextual feedback:</strong> Show feedback for specific features or sections</li>
                        <li><strong>A/B testing:</strong> Control when feedback is requested for experiments</li>
                    </ul>
                </InfoBox>
            </ContentCard>

            <ContentCard>
                <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">1</div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Manual Trigger</h3>
                        <p className="mb-3 text-gray-600">First, set up your widget to use the "Manual (On Click)" trigger type:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                            <li>Go to your widget settings in the Feedbask dashboard</li>
                            <li>Navigate to the "Behavior & Targeting" section</li>
                            <li>Under "Widget trigger", select "<strong>Manual (On Click)</strong>"</li>
                            <li>Save your widget configuration</li>
                        </ul>
                        <Note>
                            <strong>Note:</strong> When manual trigger is selected, the floating feedback button will be hidden by default.
                        </Note>
                    </div>
                </div>
            </ContentCard>

            <ContentCard>
                <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">2</div>
                    <div className="ml-4 flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Install Widget Script</h3>
                        <p className="mb-4 text-gray-600">Install the widget script normally on your website:</p>
                        <CodeBlock code={`<script ...></script>`} />
                    </div>
                </div>
            </ContentCard>

            <ContentCard>
                <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">3</div>
                    <div className="ml-4 flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Trigger the Widget Programmatically</h3>
                        <p className="mb-4 text-gray-600">Use the global JavaScript function to open the widget when needed:</p>
                        <CodeBlock code={`// open the feedback widget\nwindow.feedback.open()`} />

                        <h4 className="text-md font-semibold text-gray-800 mt-6 mb-4">Common Implementation Examples:</h4>

                        <p className="text-sm text-gray-600 mb-2">Example 1: Button Click</p>
                        <CodeBlock code={`<button onclick="window.feedback.open()">\n  Give Feedback\n</button>`} />

                        <p className="text-sm text-gray-600 mt-4 mb-2">Example 2: After Successful Action</p>
                        <CodeBlock code={`// After a successful purchase\nfunction handlePurchaseSuccess() {\n  showSuccessMessage();\n\n  // Show feedback widget after 2 seconds\n  setTimeout(() => {\n    window.feedback.open();\n  }, 2000);\n}`} />

                        <p className="text-sm text-gray-600 mt-4 mb-2">Example 3: Navigation Menu Integration</p>
                        <CodeBlock code={`<nav>\n  <a href="/home">Home</a>\n  <a href="/about">About</a>\n  <a href="/contact">Contact</a>\n  <a href="#" onclick="window.feedback.open(); return false;">\n    Feedback\n  </a>\n</nav>`} />
                    </div>
                </div>
            </ContentCard>

            <div id="guidelines">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Best Practices & Guidelines</h3>
                <p className="text-gray-600 mb-6">Important considerations for production deployments.</p>
                <div className="space-y-6">
                    <GuidelinesCard type="success" title="Best Practices" items={bestPractices} />
                    <GuidelinesCard type="danger" title="Common Mistakes" items={commonMistakes} />
                </div>
            </div>
        </section>
    );
};

export default ProgrammaticTriggersSection;
