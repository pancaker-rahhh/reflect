import React from 'react';
import DocsHeader from '@/app/components/docs/DocsHeader';
import InfoCard from '@/app/components/docs/InfoCard';
import { Zap, Framer } from 'lucide-react';

const OverviewSection = () => {
    return (
        <section id="overview" className="mb-16">
            <DocsHeader
                title="Widget Installation Guide"
                description="Learn how to integrate the Feedbask feedback widget into your website or application."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <InfoCard
                    icon={<Zap size={20} className="text-purple-600" />}
                    title="Quick Start"
                    description="Get up and running in under 5 minutes with our simple script tag. No complex setup required."
                />
                <InfoCard
                    icon={<Framer size={20} className="text-purple-600" />}
                    title="Framework Support"
                    description="Detailed guides for React, Vue, Next.js, Laravel, Django, WordPress, and more."
                />
            </div>
        </section>
    );
};

export default OverviewSection;
