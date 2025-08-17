import React from 'react';
import LanguageCard from '@/app/components/docs/LanguageCard';
import CodeBlock from '@/app/components/docs/CodeBlock';
import Note from '@/app/components/docs/Note';

const LanguageConfigurationSection = () => {
    const frenchExampleCode = `<script
    defer
    src="https://cdn.reflect.com/widget.js"
    data-client-key="YOUR_WIDGET_ID"
    data-language="fr"
    id="reflect-widget-script"
    ></script>`;

    const languages = [
        { name: 'English (Default)', code: 'data-language="en"', color: 'blue' },
        { name: 'French', code: 'data-language="fr"', color: 'green' },
        { name: 'German', code: 'data-language="de"', color: 'yellow' },
        { name: 'Spanish', code: 'data-language="es"', color: 'red' },
        { name: 'Chinese', code: 'data-language="zh"', color: 'purple' },
        { name: 'Khmer', code: 'data-language="km"', color: 'pink' },
        { name: 'Vietnamese', code: 'data-language="vi"', color: 'indigo' },
    ];

    return (
        <section id="language-configuration" className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Language Configuration</h2>

            <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Available Languages</h3>
                <p className="text-gray-600 mb-6">The widget supports multiple languages and will automatically adapt its interface text.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {languages.map(lang => <LanguageCard key={lang.name} language={lang.name} code={lang.code} color={lang.color} />)}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Example with French language:</h3>
                <CodeBlock code={frenchExampleCode} />
            </div>

            <Note>
                <strong>Note:</strong> If no language is specified, the widget will default to English. The language setting affects all text displayed in the widget interface, including buttons, labels, and validation messages.
            </Note>
        </section>
    );
};

export default LanguageConfigurationSection;
