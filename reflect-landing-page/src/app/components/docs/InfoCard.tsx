import React from 'react';
import { Icon } from 'lucide-react';

interface InfoCardProps {
    icon: React.ReactElement;
    title: string;
    description: string;
}

const InfoCard = ({ icon, title, description }: InfoCardProps) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-start space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-purple-100 rounded-lg">
              {icon}
            </div>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
        </div>
    );
};

export default InfoCard;
