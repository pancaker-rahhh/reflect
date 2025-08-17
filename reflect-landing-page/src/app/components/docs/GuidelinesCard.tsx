import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface GuidelinesCardProps {
    type: 'success' | 'danger';
    title: string;
    items: string[];
}

const GuidelinesCard = ({ type, title, items }: GuidelinesCardProps) => {
    const isSuccess = type === 'success';

    const containerClasses = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const iconClasses = isSuccess ? 'text-green-500' : 'text-red-500';
    const textClasses = isSuccess ? 'text-green-800' : 'text-red-800';

    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
        <div className={`p-6 rounded-lg border ${containerClasses}`}>
            <div className="flex items-center mb-3">
                <Icon className={`h-6 w-6 mr-2 ${iconClasses}`} />
                <h4 className={`font-semibold ${textClasses}`}>{title}</h4>
            </div>
            <ul className={`space-y-2 text-sm ${textClasses}`}>
                {items.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <span className="mr-2 mt-1">&#8226;</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GuidelinesCard;
