import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import ContentCard from '@/app/components/docs/ContentCard';
import ApiReference from '@/app/components/docs/ApiReference';

const WidgetControlApiSection = () => {
    const basicControlMethods = [
        { name: 'open()', description: 'Opens the widget menu' },
        { name: 'close()', description: 'Closes the widget' },
        { name: 'isOpen()', description: 'Check if widget is open' },
        { name: 'getCurrentSection()', description: 'Get active section' },
    ];

    const sectionNavigationMethods = [
        { name: 'openBug()', description: 'Open bug report section' },
        { name: 'openFeature()', description: 'Open feature request' },
        { name: 'openReview()', description: 'Open review section' },
        { name: 'openFeedback()', description: 'Open general feedback' },
        { name: 'openRoadmap()', description: 'Open roadmap section' },
    ];

    return (
        <section id="widget-control-api" className="mb-16">
            <DocsHeader
                title="Widget Control API"
                description=""
            />

            <ContentCard>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Widget Control Methods</h3>
                <p className="text-gray-600">Programmatically control and interact with the feedback widget using JavaScript.</p>
                <p className="text-gray-600 mt-2">The widget exposes all its control methods through the global <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">window.feedback</code> object after initialization. All methods are queued if called before the widget is fully loaded, so you can call them immediately without waiting.</p>
                <ApiReference basicControl={basicControlMethods} sectionNavigation={sectionNavigationMethods} />
            </ContentCard>
        </section>
    );
};

export default WidgetControlApiSection;
