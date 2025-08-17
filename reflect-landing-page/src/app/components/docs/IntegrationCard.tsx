import React from 'react';
import { Slack, ClipboardCheck, Mail, BarChart2 } from 'lucide-react';

interface IntegrationCardProps {
    icon: 'slack' | 'jira' | 'email' | 'analytics';
    title: string;
    description: string;
}

const IntegrationCard = ({ icon, title, description }: IntegrationCardProps) => {
    const icons = {
        slack: <Slack size={24} className="text-pink-500" />,
        jira: <ClipboardCheck size={24} className="text-blue-500" />,
        email: <Mail size={24} className="text-yellow-500" />,
        analytics: <BarChart2 size={24} className="text-green-500" />,
    };

    const bgColors = {
        slack: 'bg-pink-50',
        jira: 'bg-blue-50',
        email: 'bg-yellow-50',
        analytics: 'bg-green-50',
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start space-x-4">
            <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center ${bgColors[icon]} rounded-lg`}>
                {icons[icon]}
            </div>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
        </div>
    );
};

export default IntegrationCard;
